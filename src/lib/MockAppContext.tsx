import React, { createContext, useContext, useState, ReactNode, useEffect, useMemo, useRef } from 'react';
import { collection, doc, onSnapshot, setDoc, updateDoc, deleteDoc, serverTimestamp, Timestamp, getDocs, getDoc, deleteField, query, orderBy, limit } from 'firebase/firestore';
import { db, auth } from './firebase';

export type UserRole = 'customer' | 'staff' | 'cast' | 'admin' | 'pending';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export const TABLES = ['1-1', '1-2', '2-1', '2-2', '3-1', '3-2', '4-1', '4-2', '5', 'BC'];

export interface UserProfile {
  id: string; // Auth User ID
  loginId: string;
  userCode?: string;
  passwordHash?: string;
  displayName: string;
  vrcName: string;
  iconUrl: string;
  role: UserRole;
  requestedRole: 'staff' | 'cast' | 'admin' | null;
  canCreateOrder: boolean;
  assignedTableId?: string;
  approvalStatus: ApprovalStatus;
  createdAt: Date;
  isDeleted?: boolean;
  deletedAt?: Date;
  deletedBy?: string;
  deleteReason?: string;
  lastStatusBeforeDelete?: ApprovalStatus;
  lastRoleBeforeDelete?: UserRole;
  gamePlaysLimit?: number; // Override default game plays
}

export type RegistrationData = Omit<UserProfile, 'id' | 'role' | 'canCreateOrder' | 'approvalStatus' | 'createdAt' | 'passwordHash'> & {
  password: string;
};

export interface UserDeleteLog {
  id: string;
  targetUserId: string;
  targetUserNameSnapshot: string;
  targetUserRoleSnapshot: UserRole;
  deletedBy: string;
  deleteReason: string;
  deletedAt: Date;
  actionType: 'delete' | 'restore';
  createdAt: Date;
}

export type EmergencyCallStatus = 'active' | 'handled' | 'canceled';

export interface EmergencyCall {
  id: string;
  tableId: string;
  tableNameSnapshot: string;
  castUserId: string;
  castNameSnapshot: string;
  castIconSnapshot?: string;
  rotationNumberSnapshot: number;
  message?: string | null;
  status: EmergencyCallStatus;
  createdAt: Date;
  handledAt?: Date;
  handledBy?: string;
  canceledAt?: Date;
  cancelReason?: string;
}

export const CATEGORIES = [
  '通常カクテル',
  'キャストオリジナルカクテル',
  'フード',
  '限定メニュー',
  'その他'
] as const;

export type Category = typeof CATEGORIES[number];

export type RotationNumber = 0 | 1 | 2 | 3 | 4;

export type EventStatus = 'before_open' | 'rotation_1' | 'rotation_2' | 'rotation_3' | 'rotation_4' | 'closed';

export interface RotationStatusHistory {
  id: string;
  fromStatus: EventStatus;
  toStatus: EventStatus;
  fromRotationNumber: RotationNumber | null;
  toRotationNumber: RotationNumber | null;
  changedBy: string;
  changedAt: Date;
  memo?: string;
}

export interface RotationAssignment {
  id: string;
  rotationNumber: RotationNumber;
  tableId: string;
  castId1?: string;
  castId2?: string;
  castId3?: string;
}

export type StaffTaskType = 'drink' | 'original_cocktail' | 'delivery' | 'food' | 'announcement' | 'check';

export const STAFF_TASK_LABELS: Record<StaffTaskType, string> = {
  drink: 'ドリンク',
  original_cocktail: 'ドリンク（オリジナルカクテル）',
  delivery: '配膳',
  food: 'フード',
  announcement: 'アナウンス',
  check: '確認'
};

export interface StaffTaskAssignment {
  id?: string;
  statusType: EventStatus;
  staffId: string;
  tasks: StaffTaskType[];
}

export type AnnouncementType = 'normal' | 'important' | 'emergency';
export type AnnouncementTarget = 'all' | 'staff' | 'cast' | 'customer' | 'admin';

export type AnnouncementMode = 'manual' | 'scheduled';
export type RepeatType = 'none' | 'interval' | 'before_rotation' | 'after_rotation';

export interface Announcement {
  id: string;
  title: string;
  body: string;
  type: AnnouncementType;
  targetRole: AnnouncementTarget;
  announcementMode: AnnouncementMode;
  isActive: boolean; // For manual
  startAt?: string | null; // For scheduled (e.g., '14:00')
  endAt?: string | null; // For scheduled
  displayDurationSeconds?: number | null;
  repeatType?: RepeatType | null;
  intervalMinutes?: number | null;
  rotationNumber?: RotationNumber | null;
  createdAt: Date;
}

export interface ShiftRequest {
  id: string;
  businessDate: string;
  title: string;
  description: string | null;
  status: 'open' | 'closed' | 'canceled';
  deadlineAt: Date | null;
  createdBy: string;
  createdByNameSnapshot: string;
  createdAt: Date;
  updatedAt: Date;
  canceledAt: Date | null;
  canceledBy: string | null;
  cancelReason: string | null;
  isDeleted: boolean;
}

export interface AttendanceRequest {
  id: string;
  userId: string;
  shiftRequestId: string;
  businessDate: string;
  status: 'present' | 'absent' | 'late' | 'leave_early';
  time?: string;
  memo?: string;
  attendanceRole?: 'admin' | 'staff' | 'cast' | 'off';
  createdAt: Date;
  updatedAt: Date;
  updatedBy: string;
}

export interface Product {
  id: string;
  name: string;
  category: Category | string;
  price: number;
  description: string;
  imageUrl: string;
  isAvailable: boolean;
  isRecommended: boolean;
  isCastOriginal: boolean;
  castId?: string; // ID of the cast if it's an original cocktail
  isDeleted?: boolean;
  deletedAt?: Date;
  deletedBy?: string;
  recipeText?: string;
  notes?: string;
  recommendationText?: string;
  updatedAt?: Date;
}

export interface HistoryResetLog {
  id: string;
  resetType: 'orders' | 'announcements' | 'emergency_calls' | 'rotation_history' | 'all';
  targetTables: string[];
  eventId?: string;
  beforeDate?: Date;
  deletedCount: number;
  archivedCount: number;
  executedBy: string;
  executedAt: Date;
  memo?: string;
}

export type OrderStatus = 'pending' | 'processing' | 'completed' | 'delivered';

export interface OrderItem {
  id: string;
  itemType: 'normal_cocktail' | 'product';
  productId?: string;
  productName: string; // snapshot
  priceSnapshot: number; // snapshot
  quantity: number;
  // For normal cocktails
  color1?: string;
  color2?: string;
  hasSoda?: boolean;
}

export interface Order {
  id: string;
  tableId: string; // 注文者がいる卓 (customer_table_id)
  creatorId: string; // 注文作成者
  castId?: string | null; // 選択されたキャストID
  castNameSnapshot?: string | null;
  rotationNumberSnapshot?: RotationNumber | null;
  eventStatusSnapshot?: EventStatus;
  castTableIdSnapshot?: string | null; // 注文時点でキャストがいた卓
  castTableNameSnapshot?: string | null;
  items: OrderItem[];
  status: OrderStatus;
  memo: string;
  totalAmount: number;
  tableNameSnapshot: string;
  createdAt: Date;
  updatedAt?: Date;
  isDeleted?: boolean;
  deletedAt?: Date;
  deletedBy?: string;
  deleteReason?: string;
}

export interface CustomerSession {
  id: string;
  displayName: string;
  createdAt: Date;
  lastSeenAt: Date;
}

export interface StampRally {
  id: string;
  eventId: string;
  title: string;
  description: string;
  requiredStampCount: number;
  rewardDescription: string;
  status: 'draft' | 'active' | 'closed';
  startAt?: Date | null;
  endAt?: Date | null;
  createdAt: Date;
}

export interface CustomerStamp {
  id: string;
  customerMemberId: string;
  businessDate?: string;
  stampedByUserId?: string;
  stampedByNameSnapshot?: string;
  type?: 'grant' | 'spend' | 'adjust';
  points?: number;
  reason?: 'daily_grant' | 'lottery_entry' | 'admin_adjustment' | 'chinchiro_bet' | 'chinchiro_payout' | 'chinchiro_refund';
  lotteryItemId?: string;
  createdAt: Date;
}

export interface LotteryItem {
  id: string;
  eventId: string;
  title: string;
  description: string;
  prizeName: string;
  winnerCount: number;
  status: 'draft' | 'open' | 'closed' | 'drawn' | 'published';
  requiredPoints?: number;
  entryStartAt?: Date | null;
  entryEndAt?: Date | null;
  createdAt: Date;
  isDeleted?: boolean;
  deletedAt?: Date;
  deletedBy?: string;
}

export type ChinchiroResult = 'customer_win' | 'employee_win' | 'draw';
export type ChinchiroStatus = 'customer_rolled' | 'employee_pending' | 'completed' | 'canceled';

export interface ChinchiroSettings {
  maxChallengesPer24h: number;
  periodType: string;
  updatedAt?: Date;
  updatedBy?: string;
}

export interface GameSession {
  id: string;
  customerMemberId: string;
  customerNameSnapshot: string;
  employeeUserId: string;
  employeeNameSnapshot: string;
  employeeRoleSnapshot: string;
  status: ChinchiroStatus;
  betPoints: number;
  payoutMultiplier?: number;
  payoutPoints?: number;
  customerDie1: number;
  customerDie2: number;
  customerDie3: number;
  customerHand: string;
  customerScore: number;
  customerRerollCount?: number;
  employeeDie1?: number;
  employeeDie2?: number;
  employeeDie3?: number;
  employeeHand?: string;
  employeeScore?: number;
  employeeRerollCount?: number;
  result?: ChinchiroResult;
  pointSpendTransactionId?: string;
  pointPayoutTransactionId?: string;
  startedAt: Date;
  completedAt?: Date;
}

export interface LotteryEntry {
  id: string;
  eventId: string;
  lotteryItemId: string;
  customerMemberId: string;
  customerDisplayNameSnapshot: string;
  status: 'entered' | 'won' | 'lost';
  enteredAt: Date;
}

export interface MockAppContextType {
  currentUser: UserProfile | null;
  users: UserProfile[];
  products: Product[];
  orders: Order[];
  eventStatus: EventStatus;
  currentRotationNumber: RotationNumber | null;
  rotationAssignments: RotationAssignment[];
  staffTasks: StaffTaskAssignment[];
  announcements: Announcement[];
  rotationStatusHistory: RotationStatusHistory[];
  userDeleteLogs: UserDeleteLog[];
  emergencyCalls: EmergencyCall[];
  historyResetLogs: HistoryResetLog[];
  customerStamps: CustomerStamp[];
  lotteryItems: LotteryItem[];
  lotteryEntries: LotteryEntry[];
  gameSessions: GameSession[];
  chinchiroSettings: ChinchiroSettings | null;
  attendanceRequests: AttendanceRequest[];
  shiftRequests: ShiftRequest[];
  submitAttendanceRequest: (data: Omit<AttendanceRequest, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'updatedBy'>) => Promise<void>;
  updateAttendanceRequest: (id: string, updates: Partial<AttendanceRequest>) => Promise<void>;
  // Stamp Rally
  giveStamp: (customerMemberId: string) => void;
  adjustPoints: (customerMemberId: string, pointsDelta: number, memo: string) => Promise<void>;
  deleteCustomerMember: (memberId: string, reason: string) => Promise<void>;
  restoreCustomerMember: (memberId: string) => Promise<void>;
  hardDeleteCustomerMember: (memberId: string) => Promise<void>;
  
  createShiftRequest: (req: Omit<ShiftRequest, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'createdByNameSnapshot' | 'isDeleted' | 'canceledAt' | 'canceledBy' | 'cancelReason'>) => Promise<void>;
  updateShiftRequest: (id: string, updates: Partial<ShiftRequest>) => Promise<void>;
  deleteShiftRequest: (id: string) => Promise<void>;
  cancelShiftRequest: (id: string, reason: string) => Promise<void>;

  // Chinchiro
  startChinchiroGame: (employeeUserId: string, betPoints: number) => Promise<void>;
  rollEmployeeChinchiro: (gameSessionId: string) => Promise<void>;
  updateChinchiroSettings: (settings: Partial<ChinchiroSettings>) => Promise<void>;
  // Lottery
  addLotteryItem: (item: Omit<LotteryItem, 'id' | 'createdAt'>) => void;
  updateLotteryItem: (id: string, updates: Partial<LotteryItem>) => void;
  deleteLotteryItem: (id: string) => void;
  enterLottery: (lotteryItemId: string) => void;
  executeLotteryDraw: (lotteryItemId: string) => void;
  isAuthReady: boolean;
  isProfileLoading: boolean;
  profileError: string | null;
  hasSeenOpening: boolean;
  setHasSeenOpening: (val: boolean) => void;
  login: (loginId: string, password: string) => Promise<UserProfile | null>;
  logout: () => void;
  register: (data: RegistrationData, requestedRoleOverride?: UserRole) => Promise<void>;
  updateUserPermission: (userId: string, updates: Partial<UserProfile>) => Promise<void>;
  deleteUser: (userId: string, reason: string) => Promise<void>;
  hardDeleteUser: (userId: string) => Promise<void>;
  restoreUser: (userId: string, restoreTo: ApprovalStatus, role: UserRole) => Promise<void>;
  updateProfile: (userId: string, updates: { displayName?: string, iconUrl?: string, userCode?: string }) => Promise<void>;
  addOrder: (order: Omit<Order, 'id' | 'createdAt' | 'status' | 'updatedAt' | 'isDeleted' | 'totalAmount'>) => Promise<void>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  deleteOrder: (orderId: string, reason: string, userId: string) => Promise<void>;
  restoreOrder: (orderId: string) => Promise<void>;
  addProduct: (product: Omit<Product, 'id'>) => Promise<void>;
  updateProduct: (productId: string, updates: Partial<Product>) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
  updateEventStatus: (status: EventStatus, memo?: string) => Promise<void>;
  updateCurrentRotation: (rotationNumber: RotationNumber) => Promise<void>;
  updateRotationAssignment: (rotationNumber: RotationNumber, tableId: string, updates: Partial<RotationAssignment>) => Promise<void>;
  getCastCurrentTable: (castId: string) => string | undefined;
  updateStaffTasks: (statusType: EventStatus, staffId: string, tasks: StaffTaskType[]) => Promise<void>;
  addAnnouncement: (announcement: Omit<Announcement, 'id' | 'createdAt'>) => Promise<void>;
  updateAnnouncement: (id: string, updates: Partial<Announcement>) => Promise<void>;
  deleteAnnouncement: (id: string) => Promise<void>;
  triggerEmergencyCall: (data: Omit<EmergencyCall, 'id' | 'status' | 'createdAt'>) => Promise<void>;
  handleEmergencyCall: (id: string, userId: string) => Promise<void>;
  cancelEmergencyCall: (id: string, reason?: string) => Promise<void>;
  resetHistory: (options: { 
    type: HistoryResetLog['resetType'], 
    beforeDate?: Date, 
    memo?: string 
  }) => Promise<void>;
}

const PASSWORD_PEPPER = 'vrc-bar-creator:v2';
const LEGACY_ADMIN_PASSWORD = '1112';

const normalizeLoginId = (value: string) => {
  if (!value) return '';
  return value
    .replace(/\s+/g, '')
    .trim()
    .toLowerCase()
    .replace(/[Ａ-Ｚａ-ｚ０-９]/g, (s) =>
      String.fromCharCode(s.charCodeAt(0) - 0xFEE0)
    );
};

const fallbackHash = (value: string) => {
  let h1 = 0xdeadbeef ^ value.length;
  let h2 = 0x41c6ce57 ^ value.length;
  for (let i = 0; i < value.length; i++) {
    const ch = value.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return `fallback:${(4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(16)}`;
};

const hashPassword = async (loginId: string, password: string) => {
  const payload = `${PASSWORD_PEPPER}:${normalizeLoginId(loginId)}:${password}`;
  if (globalThis.crypto?.subtle) {
    const digest = await globalThis.crypto.subtle.digest('SHA-256', new TextEncoder().encode(payload));
    return `sha256:${Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, '0')).join('')}`;
  }
  return fallbackHash(payload);
};

const stripSensitiveUser = (user: UserProfile, viewerRole?: UserRole | null, viewerId?: string | null): UserProfile => {
  const sanitized: UserProfile = { ...user, passwordHash: undefined };
  delete (sanitized as Record<string, unknown>).passwordHash;
  delete (sanitized as Record<string, unknown>).password;

  const isAdminViewer = viewerRole === 'admin';
  const isSelf = viewerId === user.id;

  if (!isAdminViewer && !isSelf) {
    sanitized.loginId = '';
    delete sanitized.userCode;
    delete sanitized.deletedAt;
    delete sanitized.deletedBy;
    delete sanitized.deleteReason;
    delete sanitized.lastRoleBeforeDelete;
    delete sanitized.lastStatusBeforeDelete;
    delete sanitized.gamePlaysLimit;
  }

  return sanitized;
};

const stripRecipeFields = (product: Product): Product => {
  const publicProduct = { ...product };
  delete publicProduct.recipeText;
  delete publicProduct.notes;
  delete publicProduct.recommendationText;
  return publicProduct;
};

const defaultProducts: Product[] = [
  { id: '1', name: 'Nakiya オリジナル', category: 'キャストオリジナルカクテル', price: 0, description: 'Nakiya専用の甘いカクテル。', imageUrl: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=400&q=80', isAvailable: true, isRecommended: true, isCastOriginal: true, castId: 'nakiya', recipeText: '・ベース：ジン\n・シロップ：ストロベリー\n・割り材：トニックウォーター\n・仕上げ：レモンピール\n\nよく混ぜて提供してください。' },
  { id: '3', name: 'チーズ盛り合わせ', category: 'フード', price: 0, description: 'ワインによく合うチーズの3種盛り合わせ。', imageUrl: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?auto=format&fit=crop&w=400&q=80', isAvailable: true, isRecommended: true, isCastOriginal: false },
];

const mockInitialUsers: UserProfile[] = [
  {
    id: 'admin_minatoto', userCode: 'minatoto', loginId: 'minatoto1112', displayName: 'Minatoto', vrcName: 'Minatoto', iconUrl: '', role: 'admin', requestedRole: 'admin', canCreateOrder: true, approvalStatus: 'approved', assignedTableId: '1-1', createdAt: new Date()
  }
];

const generateInitialAssignments = (): RotationAssignment[] => {
  const assignments: RotationAssignment[] = [];
  ([0, 1, 2, 3, 4] as RotationNumber[]).forEach(rot => {
    TABLES.forEach(table => {
      assignments.push({
        id: `rot${rot}-${table}`,
        rotationNumber: rot,
        tableId: table,
      });
    });
  });
  
  // mock some data for rotation 1
  const m = assignments.find(a => a.rotationNumber === 1 && a.tableId === '1-1');
  if (m) {
    m.castId1 = 'admin_minatoto';
  }
  
  return assignments;
};

const initialStaffTasks: StaffTaskAssignment[] = [];

const MockAppContext = createContext<MockAppContextType | undefined>(undefined);

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
}

export function MockAppProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [productRecipes, setProductRecipes] = useState<Record<string, Pick<Product, 'recipeText' | 'notes' | 'recommendationText'>>>({});
  const [orders, setOrders] = useState<Order[]>([]);
  const [eventStatus, setEventStatus] = useState<EventStatus>('before_open');
  const [currentRotationNumber, setCurrentRotationNumber] = useState<RotationNumber | null>(null);
  const [rotationStatusHistory, setRotationStatusHistory] = useState<RotationStatusHistory[]>([]);
  const [rotationAssignments, setRotationAssignments] = useState<RotationAssignment[]>([]);
  const [staffTasks, setStaffTasks] = useState<StaffTaskAssignment[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [userDeleteLogs, setUserDeleteLogs] = useState<UserDeleteLog[]>([]);
  const [emergencyCalls, setEmergencyCalls] = useState<EmergencyCall[]>([]);
  const [historyResetLogs, setHistoryResetLogs] = useState<HistoryResetLog[]>([]);
  const [customerStamps, setCustomerStamps] = useState<CustomerStamp[]>([]);
  const [lotteryItems, setLotteryItems] = useState<LotteryItem[]>([]);
  const [lotteryEntries, setLotteryEntries] = useState<LotteryEntry[]>([]);
  const [gameSessions, setGameSessions] = useState<GameSession[]>([]);
  const [chinchiroSettings, setChinchiroSettings] = useState<ChinchiroSettings>({ maxChallengesPer24h: 4, periodType: 'rolling_24h' });
  const [attendanceRequests, setAttendanceRequests] = useState<AttendanceRequest[]>([]);
  const [shiftRequests, setShiftRequests] = useState<ShiftRequest[]>([]);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [hasReceivedInitialUsers, setHasReceivedInitialUsers] = useState(false);
  const [sessionRestored, setSessionRestored] = useState(false);
  const [hasSeenOpening, setHasSeenOpeningState] = useState(() => {
    try {
      return sessionStorage.getItem('openingAnimationPlayed') === 'true';
    } catch (e) {
      return false;
    }
  });

  const setHasSeenOpening = (val: boolean) => {
    setHasSeenOpeningState(val);
    try {
      if (val) {
        sessionStorage.setItem('openingAnimationPlayed', 'true');
      } else {
        sessionStorage.removeItem('openingAnimationPlayed');
      }
    } catch (e) {
      console.warn('Storage access failed:', e);
    }
  };

  const isApprovedRole = (roles: UserRole[]) =>
    !!currentUser && roles.includes(currentUser.role) && currentUser.approvalStatus === 'approved' && !currentUser.isDeleted;

  const requireApprovedRole = (roles: UserRole[]) => {
    if (!isApprovedRole(roles)) {
      throw new Error('権限がありません。');
    }
  };

  // Firebase Auth Setup (Mock/Simplified)
  useEffect(() => {
    // In this app, we use mock authentication stored in 'users' collection.
    // We don't need real Firebase Auth providers unless explicitly requested.
    setIsAuthReady(true);
  }, []);

  // Convert Firestore types to JS types
  const convertDoc = <T extends any>(data: any): T => {
    if (!data) return data;
    const result = { ...data };
    for (const key in result) {
      if (result[key] && typeof result[key].toDate === 'function') {
        result[key] = result[key].toDate();
      } else if (result[key] === null && typeof key === 'string' && key.endsWith('At')) {
        // Prevent blackout from optimistic updates with null serverTimestamp
        result[key] = new Date();
      }
    }
    return result as T;
  };

  // Firebase Realtime listeners
  useEffect(() => {
    if (!isAuthReady) return;
    
    const unsubUsers = onSnapshot(collection(db, 'users'), snapshot => {
      const dbUsers = snapshot.docs.map(doc => {
        const u = convertDoc<UserProfile>(doc.data());
        const legacyPassword = (u as unknown as { password?: string }).password;
        if (legacyPassword && !u.passwordHash) {
          hashPassword(u.loginId, legacyPassword)
            .then((passwordHash) => updateDoc(doc.ref, { passwordHash, password: deleteField() }))
            .catch(e => handleFirestoreError(e, OperationType.UPDATE, doc.ref.path));
        } else if (legacyPassword) {
          updateDoc(doc.ref, { password: deleteField() }).catch(e => handleFirestoreError(e, OperationType.UPDATE, doc.ref.path));
        }
        // Special safety for main admin account
        if (u.userCode === 'minatoto' || u.loginId === 'minatoto_1112' || u.loginId === 'minatoto1112') {
          const updates: any = {};
          if (u.role !== 'admin') updates.role = 'admin';
          if (u.approvalStatus !== 'approved') updates.approvalStatus = 'approved';
          if (u.loginId === 'minatoto_1112') updates.loginId = 'minatoto1112';
          if (u.isDeleted) updates.isDeleted = false; // Never allow deletion
          if (!u.passwordHash && !legacyPassword) {
            hashPassword('minatoto1112', LEGACY_ADMIN_PASSWORD)
              .then((passwordHash) => updateDoc(doc.ref, { passwordHash }))
              .catch(e => handleFirestoreError(e, OperationType.UPDATE, doc.ref.path));
          }
          
          if (Object.keys(updates).length > 0) {
             updateDoc(doc.ref, updates).catch(e => handleFirestoreError(e, OperationType.UPDATE, doc.ref.path));
          }
        }
        return { ...u, id: doc.id };
      });
      setUsers(dbUsers);
      setHasReceivedInitialUsers(true);
    }, (error) => {
      // safe fallback for error
      console.error("Firestore users listener error:", error);
      setHasReceivedInitialUsers(true);
    });
    const unsubProducts = onSnapshot(collection(db, 'products'), snapshot => {
      setProducts(snapshot.docs.map(doc => convertDoc<Product>(doc.data())));
    }, (error) => handleFirestoreError(error, OperationType.GET, 'products'));
    const unsubProductRecipes = onSnapshot(collection(db, 'productRecipes'), snapshot => {
      const nextRecipes: Record<string, Pick<Product, 'recipeText' | 'notes' | 'recommendationText'>> = {};
      snapshot.docs.forEach((recipeDoc) => {
        const data = recipeDoc.data() as Pick<Product, 'recipeText' | 'notes' | 'recommendationText'>;
        nextRecipes[recipeDoc.id] = {
          recipeText: data.recipeText || '',
          notes: data.notes || '',
          recommendationText: data.recommendationText || '',
        };
      });
      setProductRecipes(nextRecipes);
    }, (error) => handleFirestoreError(error, OperationType.GET, 'productRecipes'));
    const unsubOrders = onSnapshot(query(collection(db, 'orders'), orderBy('createdAt', 'desc'), limit(100)), snapshot => {
      setOrders(snapshot.docs.map(doc => convertDoc<Order>(doc.data())));
    }, (error) => handleFirestoreError(error, OperationType.GET, 'orders'));
    const unsubGlobals = onSnapshot(doc(db, 'global', 'state'), docSnap => {
      if(docSnap.exists()) {
        const data = docSnap.data();
        if(data.eventStatus) setEventStatus(data.eventStatus);
        setCurrentRotationNumber(data.currentRotationNumber ?? null);
      }
    }, (error) => handleFirestoreError(error, OperationType.GET, 'global/state'));
    const unsubRotHist = onSnapshot(query(collection(db, 'rotationStatusHistory'), orderBy('recordedAt', 'desc'), limit(50)), snap => setRotationStatusHistory(snap.docs.map(d => convertDoc<RotationStatusHistory>(d.data()))), (error) => handleFirestoreError(error, OperationType.GET, 'rotationStatusHistory'));
    const unsubRotAsgn = onSnapshot(collection(db, 'rotationAssignments'), snap => setRotationAssignments(snap.docs.map(d => convertDoc<RotationAssignment>(d.data()))), (error) => handleFirestoreError(error, OperationType.GET, 'rotationAssignments'));
    const unsubStaffTasks = onSnapshot(collection(db, 'staffTasks'), snap => setStaffTasks(snap.docs.map(d => convertDoc<StaffTaskAssignment>(d.data()))), (error) => handleFirestoreError(error, OperationType.GET, 'staffTasks'));
    const unsubAnnouncements = onSnapshot(collection(db, 'announcements'), snap => setAnnouncements(snap.docs.map(d => convertDoc<Announcement>(d.data()))), (error) => handleFirestoreError(error, OperationType.GET, 'announcements'));
    const unsubDelLogs = onSnapshot(query(collection(db, 'userDeleteLogs'), orderBy('deletedAt', 'desc'), limit(50)), snap => setUserDeleteLogs(snap.docs.map(d => convertDoc<UserDeleteLog>(d.data()))), (error) => handleFirestoreError(error, OperationType.GET, 'userDeleteLogs'));
    const unsubEmergncy = onSnapshot(query(collection(db, 'emergencyCalls'), orderBy('calledAt', 'desc'), limit(50)), snap => setEmergencyCalls(snap.docs.map(d => convertDoc<EmergencyCall>(d.data()))), (error) => handleFirestoreError(error, OperationType.GET, 'emergencyCalls'));
    const unsubResetLogs = onSnapshot(query(collection(db, 'historyResetLogs'), orderBy('executedAt', 'desc'), limit(50)), snap => setHistoryResetLogs(snap.docs.map(d => convertDoc<HistoryResetLog>(d.data()))), (error) => handleFirestoreError(error, OperationType.GET, 'historyResetLogs'));
    
    // Customer features
    const unsubCustomerStamps = onSnapshot(query(collection(db, 'customerStamps'), orderBy('createdAt', 'desc'), limit(200)), snap => setCustomerStamps(snap.docs.map(d => convertDoc<CustomerStamp>(d.data()))), (error) => handleFirestoreError(error, OperationType.GET, 'customerStamps'));
    const unsubLotteryItems = onSnapshot(collection(db, 'lotteryItems'), snap => setLotteryItems(snap.docs.map(d => convertDoc<LotteryItem>(d.data()))), (error) => handleFirestoreError(error, OperationType.GET, 'lotteryItems'));
    const unsubLotteryEntries = onSnapshot(query(collection(db, 'lotteryEntries'), orderBy('createdAt', 'desc'), limit(200)), snap => setLotteryEntries(snap.docs.map(d => convertDoc<LotteryEntry>(d.data()))), (error) => handleFirestoreError(error, OperationType.GET, 'lotteryEntries'));
    const unsubGameSessions = onSnapshot(query(collection(db, 'gameSessions'), orderBy('startedAt', 'desc'), limit(100)), snap => setGameSessions(snap.docs.map(d => convertDoc<GameSession>(d.data()))), (error) => handleFirestoreError(error, OperationType.GET, 'gameSessions'));
    const unsubChinchiro = onSnapshot(doc(db, 'gameSettings', 'chinchiro'), docSnap => {
      if (docSnap.exists()) {
        setChinchiroSettings(convertDoc<ChinchiroSettings>(docSnap.data()));
      } else {
        // Initialize if empty
        const initialSettings: ChinchiroSettings = { maxChallengesPer24h: 4, periodType: 'rolling_24h' };
        setDoc(doc(db, 'gameSettings', 'chinchiro'), {
          ...initialSettings,
          updatedAt: serverTimestamp()
        }).catch(e => console.error(e));
      }
    }, (error) => handleFirestoreError(error, OperationType.GET, 'gameSettings/chinchiro'));

    const unsubAttendanceRequests = onSnapshot(query(collection(db, 'attendanceRequests'), orderBy('createdAt', 'desc'), limit(300)), snap => 
      setAttendanceRequests(snap.docs.map(d => convertDoc<AttendanceRequest>(d.data()))), 
      (error) => handleFirestoreError(error, OperationType.GET, 'attendanceRequests')
    );

    const unsubShiftRequests = onSnapshot(query(collection(db, 'shiftRequests'), orderBy('businessDate', 'desc'), limit(100)), snap => 
      setShiftRequests(snap.docs.map(d => convertDoc<ShiftRequest>(d.data()))), 
      (error) => handleFirestoreError(error, OperationType.GET, 'shiftRequests')
    );

    return () => { 
      unsubUsers(); unsubProducts(); unsubOrders(); unsubGlobals(); unsubRotHist(); unsubRotAsgn(); unsubStaffTasks(); unsubAnnouncements(); unsubDelLogs(); unsubEmergncy(); unsubResetLogs(); 
      unsubProductRecipes(); unsubCustomerStamps(); unsubLotteryItems(); unsubLotteryEntries(); unsubGameSessions(); unsubChinchiro(); unsubAttendanceRequests(); unsubShiftRequests();
    };
  }, [isAuthReady]);

  // Resurrection logic for protected admin
  useEffect(() => {
    if (!isAuthReady || !hasReceivedInitialUsers) return;
    
    const adminExists = users.some(u => u.userCode === 'minatoto' || u.loginId === 'minatoto1112');
    if (!adminExists) {
      console.log('Resurrecting protected admin...');
      const adminTemplate = mockInitialUsers.find(u => u.userCode === 'minatoto');
      if (adminTemplate) {
        hashPassword(adminTemplate.loginId, LEGACY_ADMIN_PASSWORD)
          .then((passwordHash) => setDoc(doc(db, 'users', adminTemplate.id), { ...adminTemplate, passwordHash, createdAt: new Date() }))
          .catch(e => console.error('Resurrection failed:', e));
      }
    }
  }, [users, isAuthReady, hasReceivedInitialUsers]);

  const hasSeededProducts = useRef(false);
  // Initialize DB if empty
  useEffect(() => {
    if (!isAuthReady) return;
    if (products.length === 0 && !hasSeededProducts.current) {
      const timer = setTimeout(async () => {
        const snapshot = await getDocs(collection(db, 'products'));
        if (snapshot.empty && !hasSeededProducts.current) {
          hasSeededProducts.current = true;
          const p1 = { id: '1', name: 'Nakiya オリジナル', category: 'キャストオリジナルカクテル', price: 0, description: 'Nakiya専用の甘いカクテル。', imageUrl: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=400&q=80', isAvailable: true, isRecommended: true, isCastOriginal: true, castId: 'nakiya' };
          const p3 = { id: '3', name: 'チーズ盛り合わせ', category: 'フード', price: 0, description: 'ワインによく合うチーズの3種盛り合わせ。', imageUrl: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?auto=format&fit=crop&w=400&q=80', isAvailable: true, isRecommended: true, isCastOriginal: false };
          setDoc(doc(db, 'products', '1'), p1).catch(()=>{});
          setDoc(doc(db, 'products', '3'), p3).catch(()=>{});
        }
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [products.length, isAuthReady]);

  const hasSeededUsers = useRef(false);
  useEffect(() => {
    if (!isAuthReady) return;
    if (users.length === 0 && !hasSeededUsers.current) {
      const timer = setTimeout(async () => {
        // Double check length after delay
        const snapshot = await getDocs(collection(db, 'users'));
        if (snapshot.empty && !hasSeededUsers.current) {
          hasSeededUsers.current = true;
          mockInitialUsers.forEach(async (u) => {
            const passwordHash = await hashPassword(u.loginId, LEGACY_ADMIN_PASSWORD);
            setDoc(doc(db, 'users', u.id), { ...u, passwordHash }).catch(e => handleFirestoreError(e, OperationType.WRITE, `users/${u.id}`));
          });
        }
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [users.length, isAuthReady]);

  const hasSeededAssignments = useRef(false);
  useEffect(() => {
    if (!isAuthReady) return;
    if (rotationAssignments.length > 0 && rotationAssignments.length < 30) {
      // 0-rotation added later, make sure they exist
      const hasRot0 = rotationAssignments.some(a => a.rotationNumber === 0);
      if (!hasRot0) {
        generateInitialAssignments().filter(a => a.rotationNumber === 0).forEach(a => setDoc(doc(db, 'rotationAssignments', a.id), a).catch(e => handleFirestoreError(e, OperationType.WRITE, `rotationAssignments/${a.id}`)));
      }
    }
    if (rotationAssignments.length === 0 && !hasSeededAssignments.current) {
      const timer = setTimeout(async () => {
         const snapshot = await getDocs(collection(db, 'rotationAssignments'));
         if (snapshot.empty && !hasSeededAssignments.current) {
          hasSeededAssignments.current = true;
          generateInitialAssignments().forEach(a => setDoc(doc(db, 'rotationAssignments', a.id), a).catch(e => handleFirestoreError(e, OperationType.WRITE, `rotationAssignments/${a.id}`)));
        }
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [rotationAssignments.length, isAuthReady]);

  // Auth restoring and Profile Sync
  useEffect(() => {
    if (!isAuthReady || sessionRestored) return;

    // Safety timeout for profile loading
    const safetyTimer = setTimeout(() => {
      // Do not set isProfileLoading to false or force null to prevent instant logout
      console.warn('Profile loading timeout reached. Connection may be weak.');
      setProfileError('通信状態を確認中、またはプロフィール取得が遅れています...');
    }, 15000);

    const savedUserId = (() => {
      try {
        return localStorage.getItem('mockSessionUserId');
      } catch (e) {
        return null;
      }
    })();

    if (!hasReceivedInitialUsers) {
      if (!savedUserId) {
         // If we don't have a savedUserId, we can end the loading quickly
         setIsProfileLoading(false);
         setSessionRestored(true);
         clearTimeout(safetyTimer);
      }
      return () => clearTimeout(safetyTimer);
    }
    
    if (savedUserId) {
      const user = users.find(u => u.id === savedUserId);
      if (user) {
        setCurrentUser(stripSensitiveUser(user, user.role, user.id));
        setProfileError(null);
        setIsProfileLoading(false);
        setSessionRestored(true);
        clearTimeout(safetyTimer);
        return;
      } else if (users.length > 0) {
        // Found users in DB, but not the savedUserId. We can safely say the account is missing.
        try { localStorage.removeItem('mockSessionUserId'); } catch (e) {}
        setCurrentUser(null);
        setProfileError('アカウント情報が見つからない、または削除されています。再度ログインしてください。');
        setSessionRestored(true);
      } else {
        // Users array is empty, which could mean connection is still establishing or failed.
        // Wait instead of throwing user out.
        clearTimeout(safetyTimer);
        return;
      }
    } else {
      setCurrentUser(null);
      setSessionRestored(true);
    }
    
    setIsProfileLoading(false);
    clearTimeout(safetyTimer);
    return () => clearTimeout(safetyTimer);
  }, [users, isAuthReady, hasReceivedInitialUsers, sessionRestored]);

  // Handle case where authenticated user HAS NO PROFILE (Point 5)
  // We can add logic to automatically redirect or create a skeleton profile.
  // For now, ProtectedRoute will handle the "approvalStatus" which effectively tags missing profiles as guests.
  
  // Realtime updates for current user
  useEffect(() => {
    if (currentUser) {
      const updatedUser = users.find(u => u.id === currentUser.id);
      if (updatedUser && JSON.stringify(stripSensitiveUser(updatedUser, updatedUser.role, updatedUser.id)) !== JSON.stringify(currentUser)) {
        setCurrentUser(stripSensitiveUser(updatedUser, updatedUser.role, updatedUser.id));
        if (updatedUser.role === 'pending' && currentUser.role !== 'pending') {
          // Force logout if revoked
          setCurrentUser(null);
          localStorage.removeItem('mockSessionUserId');
        }
      }
    }
  }, [users, currentUser]);


  const login = async (loginId: string, password: string) => {
    const normalizedInput = normalizeLoginId(loginId);
    const user = users.find(u => normalizeLoginId(u.loginId) === normalizedInput);
    if (!user || user.isDeleted) return null;

    const passwordHash = await hashPassword(normalizedInput, password);
    const legacyPassword = (user as unknown as { password?: string }).password;
    const isValidPassword = user.passwordHash === passwordHash || legacyPassword === password;

    if (isValidPassword) {
      if (legacyPassword || !user.passwordHash) {
        updateDoc(doc(db, 'users', user.id), { passwordHash, password: deleteField() })
          .catch(e => handleFirestoreError(e, OperationType.UPDATE, `users/${user.id}`));
      }
      const safeUser = stripSensitiveUser({ ...user, passwordHash }, user.role, user.id);
      setCurrentUser(safeUser);
      try { localStorage.setItem('mockSessionUserId', user.id); } catch (e) {}
      return safeUser;
    }

    return null;
  };

  const logout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem('mockSessionUserId');
      sessionStorage.removeItem('openingAnimationPlayed');
    } catch (e) {}
    setHasSeenOpeningState(false);
  };

  const register = async (data: RegistrationData, requestedRoleOverride?: UserRole) => {
    const normalizedId = normalizeLoginId(data.loginId);
    if (!normalizedId) throw new Error("IDが入力されていません");
    if (!data.password || data.password.length < 4) throw new Error("パスワードは4文字以上で入力してください");
    
    // Check for duplicates
    const isDuplicate = users.some(u => normalizeLoginId(u.loginId) === normalizedId);
    if (isDuplicate) {
      throw new Error("このIDは既に使用されています。別のIDを指定してください。");
    }

    const id = Math.random().toString(36).substring(7);
    const roleForNewUser = requestedRoleOverride === 'customer' ? 'customer' : 'pending';
    const approvalStatusForNewUser = requestedRoleOverride === 'customer' ? 'approved' : 'pending';
    const { password, ...profileData } = data;
    const passwordHash = await hashPassword(normalizedId, password);

    const newUser: UserProfile = {
      ...profileData,
      loginId: normalizedId,
      passwordHash,
      id,
      role: roleForNewUser,
      canCreateOrder: false,
      approvalStatus: approvalStatusForNewUser,
      isDeleted: false,
      createdAt: new Date(),
    };
    await setDoc(doc(db, 'users', id), newUser);
    setCurrentUser(stripSensitiveUser(newUser, newUser.role, newUser.id));
    try { localStorage.setItem('mockSessionUserId', id); } catch (e) {}
  };

  const updateUserPermission = async (userId: string, updates: Partial<UserProfile>) => {
    requireApprovedRole(['admin']);
    const targetUser = users.find(u => u.id === userId);
    
    // Safety guard for protected account
    if (targetUser && (targetUser.userCode === 'minatoto' || targetUser.loginId === 'minatoto1112')) {
      // Prevent changing away from approved admin status
      if (updates.approvalStatus && updates.approvalStatus !== 'approved') {
        throw new Error('このアカウントのステータスは変更できません。');
      }
      if (updates.role && updates.role !== 'admin') {
        throw new Error('このアカウントのロールは変更できません。');
      }
      if (updates.isDeleted === true) {
        throw new Error('このアカウントはシステム保護されているため削除できません。');
      }
    }

    try {
      const safeUpdates = { ...updates };
      delete (safeUpdates as Record<string, unknown>).passwordHash;
      delete (safeUpdates as Record<string, unknown>).password;
      await updateDoc(doc(db, 'users', userId), safeUpdates);
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `users/${userId}`);
    }
  };

  const deleteUser = async (userId: string, reason: string) => {
    requireApprovedRole(['admin']);
    const targetUser = users.find(u => u.id === userId);
    if (!targetUser) return;
    
    // Safety guard: Prevent deleting protected admin account
    if (targetUser.userCode === 'minatoto' || targetUser.loginId === 'minatoto1112') {
      throw new Error('このアカウントはシステム保護されているため削除できません。');
    }

    try {
      await updateDoc(doc(db, 'users', userId), {
        isDeleted: true, deletedAt: serverTimestamp(), deletedBy: currentUser?.id || 'unknown', deleteReason: reason,
        lastStatusBeforeDelete: targetUser.approvalStatus, lastRoleBeforeDelete: targetUser.role
      });
      const logId = Math.random().toString(36).substring(7);
      await setDoc(doc(db, 'userDeleteLogs', logId), {
        id: logId, targetUserId: userId, targetUserNameSnapshot: targetUser.displayName, targetUserRoleSnapshot: targetUser.role,
        deletedBy: currentUser?.id || 'system', deleteReason: reason, deletedAt: serverTimestamp(), actionType: 'delete', createdAt: serverTimestamp()
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `users/${userId}`);
    }
  };

  const restoreUser = async (userId: string, restoreTo: ApprovalStatus, role: UserRole) => {
    requireApprovedRole(['admin']);
    const targetUser = users.find(u => u.id === userId);
    if (!targetUser) return;
    try {
      await updateDoc(doc(db, 'users', userId), {
        isDeleted: false, deletedAt: null, deletedBy: null, deleteReason: null, approvalStatus: restoreTo, role: role
      });
      const logId = Math.random().toString(36).substring(7);
      await setDoc(doc(db, 'userDeleteLogs', logId), {
        id: logId, targetUserId: userId, targetUserNameSnapshot: targetUser.displayName, targetUserRoleSnapshot: role,
        deletedBy: currentUser?.id || 'system', deleteReason: 'Restored by admin', deletedAt: serverTimestamp(), actionType: 'restore', createdAt: serverTimestamp()
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `users/${userId}`);
    }
  };

  const hardDeleteUser = async (userId: string) => {
    requireApprovedRole(['admin']);
    const targetUser = users.find(u => u.id === userId);
    if (targetUser?.userCode === 'minatoto' || targetUser?.loginId === 'minatoto1112') {
      throw new Error('このアカウントはシステム保護されているため完全削除できません。');
    }
    try {
      // Create a log entry for hard deletion before deleting the document
      const logId = Math.random().toString(36).substring(7);
      await setDoc(doc(db, 'userDeleteLogs', logId), {
        id: logId, 
        targetUserId: userId, 
        targetUserNameSnapshot: targetUser?.displayName || 'Unknown', 
        targetUserRoleSnapshot: targetUser?.role || 'staff',
        deletedBy: currentUser?.id || 'system', 
        deleteReason: 'PERMANENT_HARD_DELETE', 
        deletedAt: serverTimestamp(), 
        actionType: 'delete', 
        createdAt: serverTimestamp()
      });
      // Delete from firestore
      await deleteDoc(doc(db, 'users', userId));
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `users/${userId}`);
    }
  };

  const updateProfile = async (userId: string, updates: { displayName?: string, iconUrl?: string, userCode?: string }) => {
    if (!currentUser || (currentUser.id !== userId && currentUser.role !== 'admin')) {
      throw new Error('権限がありません。');
    }
    if (updates.userCode) {
      const exists = users.find(u => u.userCode === updates.userCode && u.id !== userId);
      if (exists) throw new Error('このID (user_code) は既に使用されています');
    }
    await updateDoc(doc(db, 'users', userId), updates);
  };

  const addOrder = async (orderData: Omit<Order, 'id' | 'createdAt' | 'status' | 'updatedAt' | 'isDeleted' | 'totalAmount' | 'tableNameSnapshot'>) => {
    requireApprovedRole(['admin', 'staff', 'cast']);
    if (currentUser?.role === 'cast' && !currentUser?.canCreateOrder) {
      throw new Error('注文作成権限がありません。');
    }
    const totalAmount = orderData.items.reduce((sum, item) => sum + (item.priceSnapshot * item.quantity), 0);
    const id = Math.random().toString(36).substring(7);
    
    // Rule: Match order table to cast table if cast is selected
    let finalTableId = orderData.tableId;
    if (orderData.castId && orderData.castTableIdSnapshot) {
      finalTableId = orderData.castTableIdSnapshot;
    }

    const newOrder: Order = { 
      ...orderData, 
      tableId: finalTableId,
      tableNameSnapshot: finalTableId, // In this system IDs are used as names for simple tables
      id, 
      status: 'pending', 
      totalAmount, 
      createdAt: new Date() 
    };
    await setDoc(doc(db, 'orders', id), newOrder);
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    requireApprovedRole(['admin', 'staff', 'cast']);
    await updateDoc(doc(db, 'orders', orderId), { status, updatedAt: new Date() });
  };
  
  const deleteOrder = async (orderId: string, reason: string, userId: string) => {
    requireApprovedRole(['admin', 'staff']);
    await updateDoc(doc(db, 'orders', orderId), { isDeleted: true, deleteReason: reason, deletedBy: userId, deletedAt: new Date() });
  };

  const restoreOrder = async (orderId: string) => {
    requireApprovedRole(['admin']);
    await updateDoc(doc(db, 'orders', orderId), { isDeleted: false, deleteReason: null, deletedBy: null, deletedAt: null });
  };

  const addProduct = async (productData: Omit<Product, 'id'>) => {
    requireApprovedRole(['admin']);
    const id = Math.random().toString(36).substring(7);
    const { recipeText, notes, recommendationText, ...publicProductData } = productData;
    const newProduct: Product = { ...publicProductData, id, updatedAt: new Date() };
    await setDoc(doc(db, 'products', id), newProduct);
    if (productData.isCastOriginal && (recipeText || notes || recommendationText)) {
      await setDoc(doc(db, 'productRecipes', id), {
        productId: id,
        recipeText: recipeText || '',
        notes: notes || '',
        recommendationText: recommendationText || '',
        updatedAt: serverTimestamp(),
        updatedBy: currentUser?.id
      }, { merge: true });
    }
  };

  const updateProduct = async (productId: string, updates: Partial<Product>) => {
    requireApprovedRole(['admin']);
    const { recipeText, notes, recommendationText, ...publicUpdates } = updates;
    const productPatch: Record<string, unknown> = { ...publicUpdates, updatedAt: new Date() };
    if ('recipeText' in updates) productPatch.recipeText = deleteField();
    if ('notes' in updates) productPatch.notes = deleteField();
    if ('recommendationText' in updates) productPatch.recommendationText = deleteField();
    await updateDoc(doc(db, 'products', productId), productPatch);
    if (updates.isCastOriginal !== false && ('recipeText' in updates || 'notes' in updates || 'recommendationText' in updates)) {
      await setDoc(doc(db, 'productRecipes', productId), {
        productId,
        recipeText: recipeText || '',
        notes: notes || '',
        recommendationText: recommendationText || '',
        updatedAt: serverTimestamp(),
        updatedBy: currentUser?.id
      }, { merge: true });
    }
  };
  
  const deleteProduct = async (productId: string) => {
    requireApprovedRole(['admin']);
    try {
      await updateDoc(doc(db, 'products', productId), { 
        isDeleted: true, 
        deletedAt: serverTimestamp(), 
        deletedBy: currentUser?.id,
        updatedAt: serverTimestamp() 
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, 'products');
    }
  };

  const updateEventStatus = async (newStatus: EventStatus, memo?: string) => {
    requireApprovedRole(['admin']);
    const getRotNum = (status: EventStatus): RotationNumber | null => {
      if (status === 'before_open') return 0;
      if (status === 'rotation_1') return 1; if (status === 'rotation_2') return 2;
      if (status === 'rotation_3') return 3; if (status === 'rotation_4') return 4; return null;
    };
    const newRotNum = getRotNum(newStatus);
    const oldRotNum = getRotNum(eventStatus);

    await setDoc(doc(db, 'global', 'state'), { eventStatus: newStatus, currentRotationNumber: newRotNum }, {merge: true});

    const histId = Math.random().toString(36).substring(7);
    await setDoc(doc(db, 'rotationStatusHistory', histId), {
      id: histId, fromStatus: eventStatus, toStatus: newStatus, fromRotationNumber: oldRotNum, toRotationNumber: newRotNum,
      changedBy: currentUser?.id || 'system', changedAt: new Date(), memo: memo || null
    });
  };

  const updateCurrentRotation = async (rotNum: RotationNumber) => {
    requireApprovedRole(['admin']);
    await setDoc(doc(db, 'global', 'state'), { currentRotationNumber: rotNum }, {merge: true});
  };

  const updateRotationAssignment = async (rotationNumber: RotationNumber, tableId: string, updates: Partial<RotationAssignment>) => {
    requireApprovedRole(['admin']);
    const id = `rot${rotationNumber}-${tableId}`;
    const cleanUpdates: any = { ...updates };
    
    // Explicitly handle unsetting values only if the key exists in updates and is null/undefined
    if ('castId1' in updates && (updates.castId1 === undefined || updates.castId1 === null)) cleanUpdates.castId1 = deleteField();
    if ('castId2' in updates && (updates.castId2 === undefined || updates.castId2 === null)) cleanUpdates.castId2 = deleteField();
    if ('castId3' in updates && (updates.castId3 === undefined || updates.castId3 === null)) cleanUpdates.castId3 = deleteField();

    await setDoc(doc(db, 'rotationAssignments', id), cleanUpdates, { merge: true });
  };

  const getCastCurrentTable = (castId: string) => {
    const assignment = rotationAssignments.find(a => 
      a.rotationNumber === currentRotationNumber && (a.castId1 === castId || a.castId2 === castId || a.castId3 === castId)
    );
    return assignment?.tableId;
  };

  const updateStaffTasks = async (statusType: EventStatus, staffId: string, tasks: StaffTaskType[]) => {
    requireApprovedRole(['admin']);
    const docId = `${statusType}_${staffId}`;
    await setDoc(doc(db, 'staffTasks', docId), { staffId, statusType, tasks }, { merge: true });
  };

  const addAnnouncement = async (data: Omit<Announcement, 'id' | 'createdAt'>) => {
    requireApprovedRole(['admin']);
    const id = Math.random().toString(36).substring(7);
    await setDoc(doc(db, 'announcements', id), { ...data, id, createdAt: new Date() });
  };

  const updateAnnouncement = async (id: string, updates: Partial<Announcement>) => {
    requireApprovedRole(['admin']);
    await updateDoc(doc(db, 'announcements', id), updates);
  };

  const deleteAnnouncement = async (id: string) => {
    requireApprovedRole(['admin']);
    await deleteDoc(doc(db, 'announcements', id));
  };

  const triggerEmergencyCall = async (data: Omit<EmergencyCall, 'id' | 'status' | 'createdAt'>) => {
    requireApprovedRole(['admin', 'staff', 'cast', 'customer']);
    const id = Math.random().toString(36).substring(7);
    await setDoc(doc(db, 'emergencyCalls', id), { ...data, id, status: 'active', createdAt: new Date() });
  };

  const handleEmergencyCall = async (id: string, userId: string) => {
    requireApprovedRole(['admin', 'staff']);
    await updateDoc(doc(db, 'emergencyCalls', id), { status: 'handled', handledAt: new Date(), handledBy: userId });
  };

  const cancelEmergencyCall = async (id: string, reason?: string) => {
    const targetCall = emergencyCalls.find(call => call.id === id);
    const canCancelOwn = !!currentUser && targetCall?.castUserId === currentUser.id;
    if (!canCancelOwn) requireApprovedRole(['admin', 'staff']);
    await updateDoc(doc(db, 'emergencyCalls', id), { status: 'canceled', canceledAt: new Date(), cancelReason: reason || null });
  };

  const resetHistory = async (options: { 
    type: HistoryResetLog['resetType'], 
    beforeDate?: Date | null, 
    memo?: string | null
  }) => {
    if (!currentUser || currentUser.role !== 'admin' || currentUser.approvalStatus !== 'approved' || currentUser.isDeleted) {
      throw new Error('権限がありません。');
    }
    const { type, beforeDate, memo } = options;
    const collectionsToReset = [];
    
    if (type === 'all') {
      collectionsToReset.push('orders', 'announcements', 'emergencyCalls', 'rotationStatusHistory');
    } else if (type === 'orders') {
      collectionsToReset.push('orders');
    } else if (type === 'announcements') {
      collectionsToReset.push('announcements');
    } else if (type === 'emergency_calls') {
      collectionsToReset.push('emergencyCalls');
    } else if (type === 'rotation_history') {
      collectionsToReset.push('rotationStatusHistory');
    }

    let totalDeleted = 0;

    for (const collName of collectionsToReset) {
      const q = collection(db, collName);
      const snapshot = await getDocs(q);
      
      const deletions = [];
      for (const d of snapshot.docs) {
        const data = d.data();
        const createdAt = data.createdAt?.toDate ? data.createdAt.toDate() : (data.createdAt instanceof Date ? data.createdAt : null);
        
        let shouldDelete = true;

        // Date filter
        if (beforeDate && createdAt && createdAt >= beforeDate) {
          shouldDelete = false;
        }

        // Active status filters
        if (collName === 'announcements' && data.isActive === true) {
          shouldDelete = false;
        }
        if (collName === 'emergencyCalls' && data.status === 'active') {
          shouldDelete = false;
        }
        if (collName === 'orders' && (data.status === 'pending' || data.status === 'processing')) {
          shouldDelete = false;
        }

        if (shouldDelete) {
          deletions.push(deleteDoc(d.ref));
          totalDeleted++;
        }
      }
      await Promise.all(deletions);
    }

    // Log the operation
    const logId = Math.random().toString(36).substring(7);
    const log: HistoryResetLog = {
      id: logId,
      resetType: type,
      targetTables: collectionsToReset,
      beforeDate: beforeDate,
      deletedCount: totalDeleted,
      archivedCount: 0,
      executedBy: currentUser?.id || 'system',
      executedAt: new Date(),
      memo: memo
    };
    await setDoc(doc(db, 'historyResetLogs', logId), {
      ...log,
      executedAt: serverTimestamp(),
      beforeDate: beforeDate ? Timestamp.fromDate(beforeDate) : null
    });
  };

  // --- Customer Features ---

  const giveStamp = async (customerMemberId: string) => {
    if (!currentUser) throw new Error('ログインしていません。');
    if (!['admin', 'staff', 'cast'].includes(currentUser.role)) {
      throw new Error('権限がありません。');
    }

    if (currentUser.role !== 'admin') {
      const isScheduled =
        (currentUser.role === 'cast' && rotationAssignments.some(r => r.castId1 === currentUser.id || r.castId2 === currentUser.id || r.castId3 === currentUser.id)) ||
        (currentUser.role === 'staff' && staffTasks.some(t => t.staffId === currentUser.id));
      if (!isScheduled) {
        throw new Error('本日の出勤登録がないため、ポイントを付与できません。');
      }
    }
    
    // Check daily limit with business_date logic
    const calcDate = new Date();
    if (calcDate.getHours() < 3) {
      calcDate.setDate(calcDate.getDate() - 1);
    }
    const yyyy = calcDate.getFullYear();
    const mm = String(calcDate.getMonth() + 1).padStart(2, '0');
    const dd = String(calcDate.getDate()).padStart(2, '0');
    const businessDate = `${yyyy}-${mm}-${dd}`;

    console.log(`[DEBUG] giveStamp - Role: ${currentUser.role}, ID: ${currentUser.id}, MemberId: ${customerMemberId}, BusinessDate: ${businessDate}`);

    const existing = customerStamps.find(s => s.customerMemberId === customerMemberId && s.businessDate === businessDate && s.type !== 'spend');
    if (existing) {
      throw new Error('本日はすでにポイント付与済みです。');
    }

    const id = `${customerMemberId}_grant_${businessDate}`;
    await setDoc(doc(db, 'customerStamps', id), {
      id, 
      customerMemberId,
      businessDate,
      stampedByUserId: currentUser.id, 
      stampedByNameSnapshot: currentUser.displayName, 
      type: 'grant',
      points: 1,
      reason: 'daily_grant',
      createdAt: serverTimestamp()
    });
  };

  const adjustPoints = async (customerMemberId: string, pointsDelta: number, memo: string) => {
    if (!currentUser || currentUser.role !== 'admin') {
      throw new Error('権限がありません。');
    }
    if (!memo) throw new Error('調整理由を入力してください。');
    
    // Check if enough points for negative delta
    if (pointsDelta < 0) {
      const memberPoints = customerStamps.filter(s => s.customerMemberId === customerMemberId);
      const totalPoints = memberPoints.reduce((acc, curr) => acc + (curr.points !== undefined ? curr.points : (curr.type === 'spend' ? -1 : 1)), 0);
      if (totalPoints + pointsDelta < 0) {
        throw new Error('保有ポイントを超えて減算できません。');
      }
    }

    const id = `${customerMemberId}_adjust_${Math.random().toString(36).substring(7)}`;
    await setDoc(doc(db, 'customerStamps', id), {
      id, 
      customerMemberId,
      businessDate: new Date().toISOString().split('T')[0],
      stampedByUserId: currentUser.id, 
      stampedByNameSnapshot: currentUser.displayName, 
      type: 'adjust',
      points: pointsDelta,
      reason: 'admin_adjustment',
      memo,
      createdAt: serverTimestamp()
    });
  };

  const deleteCustomerMember = async (memberId: string, reason: string) => {
    if (!currentUser || currentUser.role !== 'admin') throw new Error('権限がありません。');
    if (!reason) throw new Error('削除理由を入力してください。');
    
    await updateDoc(doc(db, 'users', memberId), {
      isDeleted: true,
      deletedAt: serverTimestamp(),
      deletedBy: currentUser.id,
      deleteReason: reason
    });
    
    const logId = Math.random().toString(36).substring(7);
    await setDoc(doc(db, 'userDeleteLogs', logId), {
      id: logId, 
      targetUserId: memberId, 
      targetUserNameSnapshot: users.find(u => u.id === memberId)?.displayName || 'Unknown', 
      targetUserRoleSnapshot: 'customer',
      deletedBy: currentUser.id, 
      deleteReason: reason, 
      actionType: 'soft_delete', 
      createdAt: serverTimestamp()
    });
  };

  const restoreCustomerMember = async (memberId: string) => {
    if (!currentUser || currentUser.role !== 'admin') throw new Error('権限がありません。');
    
    await updateDoc(doc(db, 'users', memberId), {
      isDeleted: false,
      deletedAt: null,
      deletedBy: null,
      deleteReason: null
    });
    
    const logId = Math.random().toString(36).substring(7);
    await setDoc(doc(db, 'userDeleteLogs', logId), {
      id: logId, 
      targetUserId: memberId, 
      targetUserNameSnapshot: users.find(u => u.id === memberId)?.displayName || 'Unknown', 
      targetUserRoleSnapshot: 'customer',
      deletedBy: currentUser.id, 
      deleteReason: 'レストア(復元)', 
      actionType: 'restore', 
      createdAt: serverTimestamp()
    });
  };

  const hardDeleteCustomerMember = async (memberId: string) => {
    if (!currentUser || currentUser.role !== 'admin') throw new Error('権限がありません。');
    
    const user = users.find(u => u.id === memberId);
    
    const logId = Math.random().toString(36).substring(7);
    await setDoc(doc(db, 'userDeleteLogs', logId), {
      id: logId, 
      targetUserId: memberId, 
      targetUserNameSnapshot: user?.displayName || 'Unknown', 
      targetUserRoleSnapshot: 'customer',
      deletedBy: currentUser.id, 
      deleteReason: 'CUSTOMER_HARD_DELETE', 
      actionType: 'hard_delete', 
      createdAt: serverTimestamp()
    });
    
    await deleteDoc(doc(db, 'users', memberId));
  };

  const addLotteryItem = async (item: Omit<LotteryItem, 'id' | 'createdAt'>) => {
    requireApprovedRole(['admin']);
    try {
      const id = Math.random().toString(36).substring(7);
      await setDoc(doc(db, 'lotteryItems', id), { 
        ...item, 
        id, 
        createdAt: serverTimestamp(),
        createdBy: currentUser?.id,
        updatedBy: currentUser?.id,
        updatedAt: serverTimestamp() 
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, 'lotteryItems');
    }
  };

  const updateLotteryItem = async (id: string, updates: Partial<LotteryItem>) => {
    requireApprovedRole(['admin']);
    try {
      await updateDoc(doc(db, 'lotteryItems', id), {
        ...updates,
        updatedBy: currentUser?.id,
        updatedAt: serverTimestamp()
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, 'lotteryItems');
    }
  };

  const deleteLotteryItem = async (id: string) => {
    requireApprovedRole(['admin']);
    try {
      await updateDoc(doc(db, 'lotteryItems', id), {
        isDeleted: true,
        deletedAt: serverTimestamp(),
        deletedBy: currentUser?.id || 'admin'
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, 'lotteryItems');
    }
  };

  const enterLottery = async (lotteryItemId: string) => {
    if (!currentUser || currentUser.role !== 'customer') throw new Error('会員としてログインしていません');
    
    const targetItem = lotteryItems.find(i => i.id === lotteryItemId);
    const requiredPoints = targetItem?.requiredPoints ?? 1;

    const myStamps = customerStamps.filter(s => s.customerMemberId === currentUser.id);
    // Legacy support: if no type and points, assume it's a +1 grant.
    const myPoints = myStamps.reduce((acc, curr) => acc + (curr.points !== undefined ? curr.points : (curr.type === 'spend' ? -1 : 1)), 0);

    if (requiredPoints > 0 && myPoints < requiredPoints) {
      throw new Error('ポイントが不足しています');
    }

    // Check if already entered
    const existing = lotteryEntries.find(e => e.lotteryItemId === lotteryItemId && e.customerMemberId === currentUser.id);
    if (existing) throw new Error('すでに応募済みです');

    if (requiredPoints > 0) {
      const spendId = `${currentUser.id}_spend_${lotteryItemId}_${Math.random().toString(36).substring(7)}`;
      await setDoc(doc(db, 'customerStamps', spendId), {
        id: spendId,
        customerMemberId: currentUser.id,
        type: 'spend',
        points: -requiredPoints,
        reason: 'lottery_entry',
        lotteryItemId,
        createdAt: serverTimestamp()
      });
    }

    const id = Math.random().toString(36).substring(7);
    await setDoc(doc(db, 'lotteryEntries', id), {
      id,
      eventId: 'current',
      lotteryItemId,
      customerMemberId: currentUser.id,
      customerDisplayNameSnapshot: currentUser.displayName,
      status: 'entered',
      enteredAt: serverTimestamp()
    });
  };

  const updateChinchiroSettings = async (settings: Partial<ChinchiroSettings>) => {
    if (!currentUser || currentUser.role !== 'admin') throw new Error('権限がありません');
    await updateDoc(doc(db, 'gameSettings', 'chinchiro'), {
      ...settings,
      updatedAt: serverTimestamp(),
      updatedBy: currentUser.id
    });
  };

  const getChinchiroHand = (d1: number, d2: number, d3: number): { name: string, score: number, multiplier: number } => {
    if (d1 === 1 && d2 === 1 && d3 === 1) return { name: 'ピンゾロ', score: 100, multiplier: 5 };
    if (d1 === d2 && d2 === d3) return { name: 'ゾロ目', score: 90 + d1, multiplier: 4 };
    
    const sorted = [d1, d2, d3].sort();
    if (sorted.join('') === '456') return { name: 'シゴロ', score: 80, multiplier: 3 };
    if (sorted.join('') === '123') return { name: 'ヒフミ (負け確定)', score: 0, multiplier: 0 };

    if (d1 === d2) return { name: `${d3}の目`, score: d3, multiplier: 2 };
    if (d1 === d3) return { name: `${d2}の目`, score: d2, multiplier: 2 };
    if (d2 === d3) return { name: `${d1}の目`, score: d1, multiplier: 2 };

    return { name: '目なし', score: 0, multiplier: 0 };
  };

  const rollChinchiroWithReroll = () => {
    let lastRoll = { die1: 0, die2: 0, die3: 0, hand: '', score: 0, multiplier: 0, rerollCount: 0 };
    const roll = () => Math.floor(Math.random() * 6) + 1;

    for (let attempt = 1; attempt <= 3; attempt++) {
      const d1 = roll();
      const d2 = roll();
      const d3 = roll();
      const handInfo = getChinchiroHand(d1, d2, d3);

      lastRoll = {
        die1: d1,
        die2: d2,
        die3: d3,
        hand: handInfo.name,
        score: handInfo.score,
        multiplier: handInfo.multiplier,
        rerollCount: attempt - 1
      };

      if (handInfo.name !== '目なし') {
        return lastRoll;
      }
    }

    return lastRoll;
  };

  const startChinchiroGame = async (employeeUserId: string, betPoints: number) => {
    if (!currentUser || currentUser.role !== 'customer') throw new Error('お客様のみ実行可能です');
    if (betPoints < 1) throw new Error('1ポイント以上賭けてください');

    const memberPoints = customerStamps.filter(s => s.customerMemberId === currentUser.id);
    const totalPoints = memberPoints.reduce((acc, curr) => acc + (curr.points !== undefined ? curr.points : (curr.type === 'spend' ? -1 : 1)), 0);

    if (betPoints > totalPoints) throw new Error('保有ポイントが不足しています');

    const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentGames = gameSessions.filter(g => g.customerMemberId === currentUser.id && g.startedAt >= last24h && g.status !== 'canceled');
    const overrideLimit = currentUser.gamePlaysLimit;
    const globalLimit = chinchiroSettings?.maxChallengesPer24h ?? 4;
    const MAX_PLAYS = overrideLimit && overrideLimit > 0 ? overrideLimit : globalLimit;
    
    if (recentGames.length >= MAX_PLAYS) throw new Error(`24時間以内の挑戦回数上限(${MAX_PLAYS}回)に達しました`);

    const employee = users.find(u => u.id === employeeUserId);
    if (!employee) throw new Error('指定された従業員が見つかりません');

    // Roll dice safely with rerolls
    const customerRoll = rollChinchiroWithReroll();

    const spendTxId = `chinchiro_bet_${Math.random().toString(36).substring(7)}`;
    const sessionId = `game_${Math.random().toString(36).substring(7)}`;

    await setDoc(doc(db, 'customerStamps', spendTxId), {
      id: spendTxId,
      customerMemberId: currentUser.id,
      businessDate: new Date().toISOString().split('T')[0],
      type: 'spend',
      points: -betPoints,
      reason: 'chinchiro_bet',
      createdAt: serverTimestamp()
    });

    await setDoc(doc(db, 'gameSessions', sessionId), {
      id: sessionId,
      customerMemberId: currentUser.id,
      customerNameSnapshot: currentUser.displayName,
      employeeUserId: employee.id,
      employeeNameSnapshot: employee.displayName,
      employeeRoleSnapshot: employee.role,
      status: 'employee_pending',
      betPoints,
      customerDie1: customerRoll.die1,
      customerDie2: customerRoll.die2,
      customerDie3: customerRoll.die3,
      customerHand: customerRoll.hand,
      customerScore: customerRoll.score,
      customerRerollCount: customerRoll.rerollCount,
      startedAt: serverTimestamp()
    });
  };

  const rollEmployeeChinchiro = async (gameSessionId: string) => {
    if (!currentUser) throw new Error('未ログイン');
    
    const sessionDocRef = doc(db, 'gameSessions', gameSessionId);
    const sessionSnap = await getDoc(sessionDocRef);
    if (!sessionSnap.exists()) throw new Error('ゲームが見つかりません');
    const sessionData = sessionSnap.data() as GameSession;

    if (sessionData.status !== 'employee_pending') throw new Error('既に終了しています');
    if (sessionData.employeeUserId !== currentUser.id && currentUser.role !== 'admin') {
       throw new Error('権限がありません');
    }

    const employeeRoll = rollChinchiroWithReroll();

    const cScore = sessionData.customerScore;
    const eScore = employeeRoll.score;

    let result: ChinchiroResult;
    if (cScore > eScore) result = 'customer_win';
    else if (cScore < eScore) result = 'employee_win';
    else result = 'draw';

    let payoutPoints = 0;
    let multiplier = 0;

    if (result === 'draw') {
      multiplier = 1;
      payoutPoints = sessionData.betPoints;
    } else if (result === 'customer_win') {
      // Calculate multiplier from customer hand
      const dummyHand = getChinchiroHand(sessionData.customerDie1, sessionData.customerDie2, sessionData.customerDie3);
      multiplier = dummyHand.multiplier;
      payoutPoints = sessionData.betPoints * multiplier;
    } else {
      multiplier = 0;
      payoutPoints = 0;
    }

    let payoutTxId: string | undefined = undefined;

    if (payoutPoints > 0) {
      payoutTxId = `chinchiro_payout_${Math.random().toString(36).substring(7)}`;
      await setDoc(doc(db, 'customerStamps', payoutTxId), {
        id: payoutTxId,
        customerMemberId: sessionData.customerMemberId,
        businessDate: new Date().toISOString().split('T')[0],
        type: 'grant',
        points: payoutPoints,
        reason: result === 'draw' ? 'chinchiro_refund' : 'chinchiro_payout',
        stampedByUserId: currentUser.id,
        stampedByNameSnapshot: currentUser.displayName,
        createdAt: serverTimestamp()
      });
    }

    await updateDoc(sessionDocRef, {
      status: 'completed',
      employeeDie1: employeeRoll.die1,
      employeeDie2: employeeRoll.die2,
      employeeDie3: employeeRoll.die3,
      employeeHand: employeeRoll.hand,
      employeeScore: employeeRoll.score,
      employeeRerollCount: employeeRoll.rerollCount,
      result,
      payoutPoints,
      payoutMultiplier: multiplier,
      pointPayoutTransactionId: payoutTxId || null,
      completedAt: serverTimestamp()
    });
  };

  const executeLotteryDraw = async (lotteryItemId: string) => {
    requireApprovedRole(['admin']);
    const targetItem = lotteryItems.find(i => i.id === lotteryItemId);
    const targetEntries = lotteryEntries.filter(e => e.lotteryItemId === lotteryItemId);
    if (!targetItem) throw new Error('Lottery item not found');
    
    // Reset all previous results if redrawing
    const updates: Promise<void>[] = [];
    
    // Pick winners
    const shuffled = [...targetEntries].sort(() => Math.random() - 0.5);
    const winners = shuffled.slice(0, targetItem.winnerCount);
    
    targetEntries.forEach(entry => {
      const isWinner = winners.some(w => w.id === entry.id);
      updates.push(updateDoc(doc(db, 'lotteryEntries', entry.id), { status: isWinner ? 'won' : 'lost' }));
    });
    
    await Promise.all(updates);
    await updateDoc(doc(db, 'lotteryItems', lotteryItemId), {
      status: 'drawn',
      drawnBy: currentUser?.id,
      drawnAt: new Date()
    });
  };

  const createShiftRequest = async (req: Omit<ShiftRequest, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'createdByNameSnapshot' | 'isDeleted' | 'canceledAt' | 'canceledBy' | 'cancelReason'>) => {
    if (!currentUser || currentUser.role !== 'admin') throw new Error('Permission denied');
    const id = doc(collection(db, 'shiftRequests')).id;
    await setDoc(doc(db, 'shiftRequests', id), {
      ...req,
      isDeleted: false,
      canceledAt: null,
      canceledBy: null,
      cancelReason: null,
      id,
      createdBy: currentUser.id,
      createdByNameSnapshot: currentUser.displayName,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  };

  const updateShiftRequest = async (id: string, updates: Partial<ShiftRequest>) => {
    if (!currentUser || currentUser.role !== 'admin') throw new Error('Permission denied');
    await updateDoc(doc(db, 'shiftRequests', id), {
      ...updates,
      updatedAt: serverTimestamp()
    });
  };

  const deleteShiftRequest = async (id: string) => {
    if (!currentUser || currentUser.role !== 'admin') throw new Error('Permission denied');
    await updateDoc(doc(db, 'shiftRequests', id), {
      isDeleted: true,
      updatedAt: serverTimestamp()
    });
  };

  const cancelShiftRequest = async (id: string, reason: string) => {
    if (!currentUser || currentUser.role !== 'admin') throw new Error('Permission denied');
    await updateDoc(doc(db, 'shiftRequests', id), {
      status: 'canceled',
      canceledAt: serverTimestamp(),
      canceledBy: currentUser.id,
      cancelReason: reason,
      updatedAt: serverTimestamp()
    });
  };

  const submitAttendanceRequest = async (data: Omit<AttendanceRequest, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'updatedBy'>) => {
    if (!currentUser) throw new Error('ログインが必要です');
    
    // Validate role for submitting
    if (currentUser.role !== 'admin' && currentUser.role !== 'staff' && currentUser.role !== 'cast') {
      throw new Error('権限がありません');
    }

    // Validate that the shift is still active
    const shift = shiftRequests.find(s => s.id === data.shiftRequestId);
    if (!shift) throw new Error('シフト募集が見つかりません');
    if (shift.status === 'canceled') throw new Error('このシフト募集は取り消されています');
    if (shift.status === 'closed') throw new Error('このシフト募集は締め切られています');
    if (shift.isDeleted) throw new Error('このシフト募集は削除されました');

    const id = `${currentUser.id}_${data.shiftRequestId}`;

    await setDoc(doc(db, 'attendanceRequests', id), {
      id,
      userId: currentUser.id,
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      updatedBy: currentUser.id
    }, { merge: true });
  };

  const updateAttendanceRequest = async (id: string, updates: Partial<AttendanceRequest>) => {
    if (!currentUser || currentUser.role !== 'admin') throw new Error('権限がありません');
    await updateDoc(doc(db, 'attendanceRequests', id), {
      ...updates,
      updatedAt: serverTimestamp(),
      updatedBy: currentUser.id
    });
  };

  const visibleUsers = useMemo(() => {
    if (!currentUser) return [];
    if (currentUser.role === 'admin') {
      return users.map(user => stripSensitiveUser(user, 'admin', currentUser.id));
    }
    const publicRoles: UserRole[] = ['admin', 'staff', 'cast'];
    return users
      .filter(user => user.id === currentUser.id || (publicRoles.includes(user.role) && user.approvalStatus === 'approved' && !user.isDeleted))
      .map(user => stripSensitiveUser(user, currentUser.role, currentUser.id));
  }, [currentUser, users]);

  const visibleProducts = useMemo(() => {
    const canViewRecipes = currentUser ? ['admin', 'staff', 'cast'].includes(currentUser.role) : false;
    return products.map(product => {
      const merged = canViewRecipes
        ? {
            ...product,
            recipeText: productRecipes[product.id]?.recipeText ?? product.recipeText,
            notes: productRecipes[product.id]?.notes ?? product.notes,
            recommendationText: productRecipes[product.id]?.recommendationText ?? product.recommendationText,
          }
        : stripRecipeFields(product);
      return merged;
    });
  }, [currentUser, products, productRecipes]);

  const visibleOrders = useMemo(() => {
    if (!currentUser) return [];
    if (['admin', 'staff', 'cast'].includes(currentUser.role)) return orders;
    return orders.filter(order => order.creatorId === currentUser.id);
  }, [currentUser, orders]);

  const visibleAnnouncements = useMemo(() => {
    if (!currentUser) return announcements.filter(a => a.targetRole === 'all' || a.targetRole === 'customer');
    if (currentUser.role === 'admin') return announcements;
    return announcements.filter(a => a.targetRole === 'all' || a.targetRole === currentUser.role);
  }, [announcements, currentUser]);

  const visibleCustomerStamps = useMemo(() => {
    if (!currentUser) return [];
    if (currentUser.role === 'admin') return customerStamps;
    return customerStamps.filter(stamp => stamp.customerMemberId === currentUser.id);
  }, [currentUser, customerStamps]);

  const visibleLotteryEntries = useMemo(() => {
    if (!currentUser) return [];
    if (currentUser.role === 'admin') return lotteryEntries;
    return lotteryEntries.filter(entry => entry.customerMemberId === currentUser.id);
  }, [currentUser, lotteryEntries]);

  const visibleGameSessions = useMemo(() => {
    if (!currentUser) return [];
    if (['admin', 'staff', 'cast'].includes(currentUser.role)) return gameSessions;
    return gameSessions.filter(game => game.customerMemberId === currentUser.id);
  }, [currentUser, gameSessions]);

  const visibleEmergencyCalls = useMemo(() => {
    if (!currentUser) return [];
    if (['admin', 'staff', 'cast'].includes(currentUser.role)) return emergencyCalls;
    return emergencyCalls.filter(call => call.castUserId === currentUser.id);
  }, [currentUser, emergencyCalls]);

  return (
    <MockAppContext.Provider value={{
      currentUser, users: visibleUsers, products: visibleProducts, orders: visibleOrders, eventStatus, currentRotationNumber, rotationAssignments,
      staffTasks, announcements: visibleAnnouncements, rotationStatusHistory, userDeleteLogs, emergencyCalls: visibleEmergencyCalls, historyResetLogs,
      customerStamps: visibleCustomerStamps, lotteryItems, lotteryEntries: visibleLotteryEntries, gameSessions: visibleGameSessions, attendanceRequests, shiftRequests, chinchiroSettings,
      isAuthReady, isProfileLoading, profileError, hasSeenOpening, setHasSeenOpening,
      login, logout, register, updateUserPermission, deleteUser, hardDeleteUser, restoreUser, updateProfile, addOrder, updateOrderStatus,
      deleteOrder, restoreOrder, addProduct, updateProduct, deleteProduct, updateEventStatus, updateCurrentRotation, updateRotationAssignment, getCastCurrentTable,
      updateStaffTasks, addAnnouncement, updateAnnouncement, deleteAnnouncement,
      triggerEmergencyCall, handleEmergencyCall, cancelEmergencyCall, resetHistory,
      giveStamp, adjustPoints, deleteCustomerMember, restoreCustomerMember, hardDeleteCustomerMember,
      createShiftRequest, updateShiftRequest, deleteShiftRequest, cancelShiftRequest,
      startChinchiroGame, rollEmployeeChinchiro, updateChinchiroSettings, submitAttendanceRequest, updateAttendanceRequest,
      addLotteryItem, updateLotteryItem, deleteLotteryItem, enterLottery, executeLotteryDraw
    }}>
      {children}
    </MockAppContext.Provider>
  );
}

export function useMockApp() {
  const context = useContext(MockAppContext);
  if (!context) throw new Error("useMockApp must be used within MockAppProvider");
  return context;
}
