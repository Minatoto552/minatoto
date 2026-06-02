import { useMemo } from 'react';
import {
  TABLES,
  STAFF_TASK_LABELS,
  useMockApp,
  type EventStatus,
  type RotationNumber,
  type StaffTaskType,
  type UserProfile,
} from '../lib/MockAppContext';

export type PlacementType = 'cast' | 'staff';
export type PlacementStatus = 'active' | 'break' | 'finished';

export interface UnifiedPlacement {
  id: string;
  userId: string;
  displayName: string;
  role: UserProfile['role'];
  iconUrl?: string;
  positionType: PlacementType;
  rotation: RotationNumber;
  rotationLabel: string;
  tableNumber: string;
  area: string;
  status: PlacementStatus;
  taskKeys: StaffTaskType[];
  taskLabels: string[];
  slotLabel?: string;
  updatedAt: Date;
}

export interface TablePlacementSummary {
  tableNumber: string;
  castPlacements: UnifiedPlacement[];
  staffPlacements: UnifiedPlacement[];
  isCurrentUserTable: boolean;
}

export const eventStatusToRotation = (status?: EventStatus | null): RotationNumber | null => {
  if (!status) return null;
  if (status === 'before_open') return 0;
  if (status === 'closed') return null;
  return Number(status.replace('rotation_', '')) as RotationNumber;
};

export const rotationToEventStatus = (rotation: RotationNumber): EventStatus => {
  if (rotation === 0) return 'before_open';
  return `rotation_${rotation}` as EventStatus;
};

export const getRotationLabel = (rotation: RotationNumber | null | undefined) => {
  if (rotation === null || rotation === undefined) return '未設定';
  if (rotation === 0) return '営業前';
  return `第${rotation}ローテ`;
};

const getStaffAreaLabel = (tasks: StaffTaskType[]) => {
  if (tasks.length === 0) return '待機';
  return tasks.map(task => STAFF_TASK_LABELS[task]).join(' / ');
};

const isEmployee = (user: UserProfile) =>
  user.approvalStatus === 'approved' &&
  !user.isDeleted &&
  (user.role === 'admin' || user.role === 'staff' || user.role === 'cast');

export function usePlacements(selectedRotation?: RotationNumber) {
  const {
    currentUser,
    users,
    rotationAssignments,
    staffTasks,
    currentRotationNumber,
    eventStatus,
  } = useMockApp();

  const activeRotation = selectedRotation ?? currentRotationNumber ?? eventStatusToRotation(eventStatus) ?? 0;
  const activeEventStatus = rotationToEventStatus(activeRotation);

  const employeeUsers = useMemo(
    () => (users || []).filter(isEmployee),
    [users],
  );

  const castUsers = useMemo(
    () => employeeUsers.filter(user => user.role === 'cast' || user.role === 'admin'),
    [employeeUsers],
  );

  const staffUsers = useMemo(
    () => employeeUsers.filter(user => user.role === 'staff' || user.role === 'admin'),
    [employeeUsers],
  );

  const placements = useMemo<UnifiedPlacement[]>(() => {
    const userById = new Map(employeeUsers.map(user => [user.id, user]));
    const nextPlacements: UnifiedPlacement[] = [];

    (rotationAssignments || []).forEach(assignment => {
      const castIds = [assignment.castId1, assignment.castId2, assignment.castId3].filter(Boolean) as string[];
      castIds.forEach((castId, index) => {
        const user = userById.get(castId);
        if (!user || !isEmployee(user)) return;

        nextPlacements.push({
          id: `cast-${assignment.rotationNumber}-${assignment.tableId}-${castId}-${index}`,
          userId: user.id,
          displayName: user.displayName,
          role: user.role,
          iconUrl: user.iconUrl,
          positionType: 'cast',
          rotation: assignment.rotationNumber,
          rotationLabel: getRotationLabel(assignment.rotationNumber),
          tableNumber: assignment.tableId,
          area: `${assignment.tableId}卓`,
          status: 'active',
          taskKeys: [],
          taskLabels: [],
          slotLabel: `CAST ${index + 1}`,
          updatedAt: new Date(),
        });
      });
    });

    (staffTasks || []).forEach(task => {
      const rotation = eventStatusToRotation(task.statusType);
      const user = userById.get(task.staffId);
      if (rotation === null || !user || !isEmployee(user)) return;

      const taskKeys = task.tasks || [];
      nextPlacements.push({
        id: `staff-${task.statusType}-${task.staffId}`,
        userId: user.id,
        displayName: user.displayName,
        role: user.role,
        iconUrl: user.iconUrl,
        positionType: 'staff',
        rotation,
        rotationLabel: getRotationLabel(rotation),
        tableNumber: user.assignedTableId || '全体',
        area: getStaffAreaLabel(taskKeys),
        status: taskKeys.length > 0 ? 'active' : 'break',
        taskKeys,
        taskLabels: taskKeys.map(taskKey => STAFF_TASK_LABELS[taskKey]),
        slotLabel: user.role === 'admin' ? 'ADMIN' : 'STAFF',
        updatedAt: new Date(),
      });
    });

    return nextPlacements;
  }, [employeeUsers, rotationAssignments, staffTasks]);

  const currentPlacements = useMemo(
    () => placements.filter(placement => placement.rotation === activeRotation),
    [activeRotation, placements],
  );

  const currentCastPlacements = useMemo(
    () => currentPlacements.filter(placement => placement.positionType === 'cast'),
    [currentPlacements],
  );

  const currentStaffPlacements = useMemo(() => {
    const assigned = currentPlacements.filter(placement => placement.positionType === 'staff');
    const assignedUserIds = new Set(assigned.map(placement => placement.userId));
    const waitingStaff = staffUsers
      .filter(staff => !assignedUserIds.has(staff.id))
      .map<UnifiedPlacement>(staff => ({
        id: `staff-${activeEventStatus}-${staff.id}-waiting`,
        userId: staff.id,
        displayName: staff.displayName,
        role: staff.role,
        iconUrl: staff.iconUrl,
        positionType: 'staff',
        rotation: activeRotation,
        rotationLabel: getRotationLabel(activeRotation),
        tableNumber: staff.assignedTableId || '全体',
        area: '未割当',
        status: 'break',
        taskKeys: [],
        taskLabels: [],
        slotLabel: staff.role === 'admin' ? 'ADMIN' : 'STAFF',
        updatedAt: new Date(),
      }));

    return [...assigned, ...waitingStaff];
  }, [activeEventStatus, activeRotation, currentPlacements, staffUsers]);

  const tableSummaries = useMemo<TablePlacementSummary[]>(() => {
    return TABLES.map(tableNumber => {
      const castPlacements = currentCastPlacements.filter(placement => placement.tableNumber === tableNumber);
      const staffPlacements = currentStaffPlacements.filter(placement => placement.tableNumber === tableNumber);

      return {
        tableNumber,
        castPlacements,
        staffPlacements,
        isCurrentUserTable: Boolean(
          currentUser &&
          [...castPlacements, ...staffPlacements].some(placement => placement.userId === currentUser.id),
        ),
      };
    });
  }, [currentCastPlacements, currentStaffPlacements, currentUser]);

  const getUserPlacements = (userId: string) =>
    placements.filter(placement => placement.userId === userId);

  const getUserCurrentPlacements = (userId: string) =>
    currentPlacements.filter(placement => placement.userId === userId);

  const getPlacementsForTable = (tableNumber: string) =>
    currentPlacements.filter(placement => placement.tableNumber === tableNumber);

  return {
    activeRotation,
    activeEventStatus,
    currentPlacements,
    currentCastPlacements,
    currentStaffPlacements,
    employeeUsers,
    castUsers,
    staffUsers,
    placements,
    tableSummaries,
    getPlacementsForTable,
    getUserPlacements,
    getUserCurrentPlacements,
    getRotationLabel,
  };
}
