export const selectionStatuses = [
  "未対応",
  "検討中",
  "マイページ作成済み",
  "ES提出前",
  "ES提出済み",
  "SPI・適性検査予定",
  "SPI・適性検査完了",
  "面接予定",
  "面接完了",
  "インターン応募予定",
  "インターン選考中",
  "インターン参加予定",
  "選考中",
  "内定候補",
  "内定",
  "見送り",
  "辞退",
] as const;

export const desireLevels = ["本命", "高", "中", "低", "未設定"] as const;
export const difficultyLevels = ["高", "中", "低", "未設定"] as const;
export const priorityLevels = ["高", "中", "低"] as const;
export const esStatuses = ["未着手", "準備中", "提出済み", "不要"] as const;
export const aptitudeTestStatuses = ["未定", "予定", "完了", "不要"] as const;
export const internshipStatuses = ["未対応", "応募予定", "応募済み", "選考中", "参加予定", "参加済み", "見送り"] as const;

export type SelectionStatus = (typeof selectionStatuses)[number];
export type DesireLevel = (typeof desireLevels)[number];
export type DifficultyLevel = (typeof difficultyLevels)[number];
export type PriorityLevel = (typeof priorityLevels)[number];
export type EsStatus = (typeof esStatuses)[number];
export type AptitudeTestStatus = (typeof aptitudeTestStatuses)[number];
export type InternshipStatus = (typeof internshipStatuses)[number];

export type Company = {
  id: string;
  name: string;
  industry: string;
  jobType: string;
  desireLevel: DesireLevel;
  difficultyLevel: DifficultyLevel;
  priority: PriorityLevel;
  status: SelectionStatus;
  myPageRegistered: boolean;
  esStatus: EsStatus;
  aptitudeTestStatus: AptitudeTestStatus;
  interviewSchedule: string;
  internshipStatus: InternshipStatus;
  applyDate: string;
  esDeadline: string;
  internshipDeadline: string;
  nextDeadline: string;
  nextAction: string;
  companyMemo: string;
  motivationMemo: string;
  esMemo: string;
  interviewMemo: string;
  questionMemo: string;
  myPageUrl: string;
  recruitUrl: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
};

export type CompanyFormValues = Omit<Company, "id" | "createdAt" | "updatedAt" | "priority"> & {
  id?: string;
  priority?: PriorityLevel;
  createdAt?: string;
  updatedAt?: string;
};

export type CompanyViewMode = "card" | "compact" | "table" | "kanban";
export type CompanySortKey = "deadline" | "desire" | "difficulty" | "priority" | "updated";

export type CategoryFilter =
  | "all"
  | "favorite"
  | "internship"
  | "active"
  | "mypage"
  | "esBefore"
  | "aptitude"
  | "interview"
  | "urgent"
  | "offer"
  | "rejected";

export type CompanyFilters = {
  query: string;
  category: CategoryFilter;
  industry: string;
  status: string;
  desireLevel: string;
  difficultyLevel: string;
  tag: string;
  sort: CompanySortKey;
  view: CompanyViewMode;
};

export const defaultCompanyFormValues: CompanyFormValues = {
  name: "",
  industry: "",
  jobType: "",
  desireLevel: "未設定",
  difficultyLevel: "未設定",
  status: "未対応",
  myPageRegistered: false,
  esStatus: "未着手",
  aptitudeTestStatus: "未定",
  interviewSchedule: "",
  internshipStatus: "未対応",
  applyDate: "",
  esDeadline: "",
  internshipDeadline: "",
  nextDeadline: "",
  nextAction: "",
  companyMemo: "",
  motivationMemo: "",
  esMemo: "",
  interviewMemo: "",
  questionMemo: "",
  myPageUrl: "",
  recruitUrl: "",
  tags: [],
};
