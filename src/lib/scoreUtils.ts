import type { CategoryFilter, Company, CompanyFilters, PriorityLevel } from "../types/company";

export type DeadlineTone = "expired" | "urgent" | "warning" | "normal" | "none";

const activeStatuses = new Set([
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
]);

const terminalStatuses = new Set(["内定", "見送り", "辞退"]);

export const desireWeight: Record<Company["desireLevel"], number> = {
  本命: 5,
  高: 4,
  中: 3,
  低: 2,
  未設定: 1,
};

export const difficultyWeight: Record<Company["difficultyLevel"], number> = {
  高: 3,
  中: 2,
  低: 1,
  未設定: 0,
};

export const priorityWeight: Record<PriorityLevel, number> = {
  高: 3,
  中: 2,
  低: 1,
};

const toDate = (value?: string) => {
  if (!value) return null;
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
};

const startOfToday = () => {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
};

export const daysUntil = (value?: string) => {
  const date = toDate(value);
  if (!date) return null;
  const diff = date.getTime() - startOfToday().getTime();
  return Math.ceil(diff / 86_400_000);
};

export const getPrimaryDeadline = (company: Pick<Company, "nextDeadline" | "esDeadline" | "internshipDeadline" | "applyDate">) =>
  company.nextDeadline || company.esDeadline || company.internshipDeadline || company.applyDate || "";

export const getDeadlineTone = (value?: string): DeadlineTone => {
  const days = daysUntil(value);
  if (days === null) return "none";
  if (days < 0) return "expired";
  if (days <= 3) return "urgent";
  if (days <= 7) return "warning";
  return "normal";
};

export const formatDate = (value?: string) => {
  const date = toDate(value);
  if (!date) return "-";
  return new Intl.DateTimeFormat("ja-JP", { month: "numeric", day: "numeric", weekday: "short" }).format(date);
};

export const formatDeadline = (value?: string) => {
  const days = daysUntil(value);
  if (days === null) return "未設定";
  if (days < 0) return "期限切れ";
  if (days === 0) return "今日";
  if (days === 1) return "明日";
  return `${days}日後`;
};

export const formatUpdatedAt = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("ja-JP", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

export const isActiveCompany = (company: Company) => activeStatuses.has(company.status);
export const isTerminalCompany = (company: Company) => terminalStatuses.has(company.status);
export const isStaleCompany = (company: Company) => {
  if (isTerminalCompany(company)) return false;
  const updated = new Date(company.updatedAt);
  if (Number.isNaN(updated.getTime())) return false;
  return Date.now() - updated.getTime() >= 14 * 86_400_000;
};

export const calculatePriorityScore = (company: Company) => {
  if (company.status === "見送り" || company.status === "辞退") return 0;

  let score = desireWeight[company.desireLevel] * 10;
  const deadlineTone = getDeadlineTone(getPrimaryDeadline(company));

  if (deadlineTone === "expired") score += 4;
  if (deadlineTone === "urgent") score += 28;
  if (deadlineTone === "warning") score += 18;
  if (deadlineTone === "normal") score += 6;
  if (isActiveCompany(company)) score += 12;
  if (company.nextAction.trim()) score += 8;
  if (company.status === "内定候補") score += 10;
  if (!company.nextAction.trim()) score -= 6;
  if (company.status === "内定") score -= 8;

  return Math.max(0, Math.min(100, score));
};

export const getPriorityLevel = (company: Company): PriorityLevel => {
  const score = calculatePriorityScore(company);
  if (score >= 62) return "高";
  if (score >= 34) return "中";
  return "低";
};

export const withDerivedCompanyFields = (company: Company): Company => ({
  ...company,
  priority: getPriorityLevel(company),
});

export const getCompanyWarnings = (company: Company) => {
  const deadline = getPrimaryDeadline(company);
  const tone = getDeadlineTone(deadline);
  const warnings: string[] = [];

  if (tone === "expired") warnings.push("期限切れ");
  if (tone === "urgent") warnings.push("至急");
  if (tone === "warning") warnings.push("注意");
  if (!company.nextAction.trim() && !isTerminalCompany(company)) warnings.push("次アクション未設定");
  if (isStaleCompany(company)) warnings.push("放置中");

  return warnings;
};

export const matchesCategory = (company: Company, category: CategoryFilter) => {
  const deadline = getPrimaryDeadline(company);
  const tone = getDeadlineTone(deadline);

  switch (category) {
    case "favorite":
      return company.desireLevel === "本命";
    case "internship":
      return company.status.includes("インターン") || company.internshipStatus !== "未対応";
    case "active":
      return isActiveCompany(company);
    case "mypage":
      return company.myPageRegistered || company.status === "マイページ作成済み";
    case "esBefore":
      return company.status === "ES提出前" || company.esStatus === "準備中" || company.esStatus === "未着手";
    case "aptitude":
      return company.status.includes("SPI") || company.aptitudeTestStatus === "予定";
    case "interview":
      return company.status === "面接予定" || Boolean(company.interviewSchedule);
    case "urgent":
      return tone === "urgent" || tone === "expired";
    case "offer":
      return company.status === "内定候補" || company.status === "内定";
    case "rejected":
      return company.status === "見送り" || company.status === "辞退";
    default:
      return true;
  }
};

const normalizeText = (value: string) => value.toLowerCase().trim();

export const filterCompanies = (companies: Company[], filters: CompanyFilters) => {
  const query = normalizeText(filters.query);
  const tagQuery = normalizeText(filters.tag);

  return companies.filter((company) => {
    const haystack = normalizeText(
      [
        company.name,
        company.industry,
        company.jobType,
        company.status,
        company.nextAction,
        company.companyMemo,
        company.motivationMemo,
        company.esMemo,
        company.interviewMemo,
        company.questionMemo,
        company.tags.join(" "),
      ].join(" "),
    );

    return (
      matchesCategory(company, filters.category) &&
      (!query || haystack.includes(query)) &&
      (!filters.industry || company.industry === filters.industry) &&
      (!filters.status || company.status === filters.status) &&
      (!filters.desireLevel || company.desireLevel === filters.desireLevel) &&
      (!filters.difficultyLevel || company.difficultyLevel === filters.difficultyLevel) &&
      (!tagQuery || company.tags.some((tag) => normalizeText(tag).includes(tagQuery)))
    );
  });
};

export const sortCompanies = (companies: Company[], sort: CompanyFilters["sort"]) =>
  [...companies].sort((a, b) => {
    if (sort === "deadline") return (daysUntil(getPrimaryDeadline(a)) ?? 9999) - (daysUntil(getPrimaryDeadline(b)) ?? 9999);
    if (sort === "desire") return desireWeight[b.desireLevel] - desireWeight[a.desireLevel] || calculatePriorityScore(b) - calculatePriorityScore(a);
    if (sort === "difficulty") return difficultyWeight[b.difficultyLevel] - difficultyWeight[a.difficultyLevel] || calculatePriorityScore(b) - calculatePriorityScore(a);
    if (sort === "priority") return calculatePriorityScore(b) - calculatePriorityScore(a);
    return b.updatedAt.localeCompare(a.updatedAt);
  });

export const getUniqueOptions = (companies: Company[], key: "industry") =>
  [...new Set(companies.map((company) => company[key]).filter(Boolean))].sort((a, b) => a.localeCompare(b, "ja"));
