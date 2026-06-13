import { CalendarClock, Edit3, ExternalLink, FileText, MoreHorizontal } from "lucide-react";
import type { MouseEvent } from "react";
import type { Company } from "../types/company";
import { calculatePriorityScore, formatDate, formatDeadline, getCompanyWarnings, getDeadlineTone, getPrimaryDeadline } from "../lib/scoreUtils";
import { Badge } from "./Badge";

const deadlineTone = {
  expired: "red",
  urgent: "red",
  warning: "yellow",
  normal: "blue",
  none: "gray",
} as const;

const priorityTone = {
  高: "red",
  中: "yellow",
  低: "gray",
} as const;

export function CompanyCard({
  company,
  compact = false,
  onOpen,
  onEdit,
}: {
  company: Company;
  compact?: boolean;
  onOpen: (company: Company) => void;
  onEdit: (company: Company) => void;
}) {
  const primaryDeadline = getPrimaryDeadline(company);
  const warnings = getCompanyWarnings(company);
  const tone = getDeadlineTone(primaryDeadline);
  const openUrl = (event: MouseEvent<HTMLAnchorElement>) => event.stopPropagation();

  return (
    <article className={`company-card ${compact ? "company-card-compact" : ""}`} onClick={() => onOpen(company)}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="truncate text-base font-bold text-slate-950">{company.name}</h3>
          <p className="mt-1 truncate text-xs text-slate-500">
            {company.industry || "業界未設定"} / {company.jobType || "職種未設定"}
          </p>
        </div>
        <Badge tone={priorityTone[company.priority]}>優先 {company.priority}</Badge>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        <Badge tone={company.desireLevel === "本命" ? "red" : company.desireLevel === "高" ? "blue" : "gray"}>志望 {company.desireLevel}</Badge>
        <Badge tone={company.difficultyLevel === "高" ? "purple" : "gray"}>難易度 {company.difficultyLevel}</Badge>
        <Badge tone="green">{company.status}</Badge>
      </div>

      <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-2">
        <div className="flex items-center justify-between gap-2 text-xs">
          <span className="inline-flex items-center gap-1 font-semibold text-slate-700">
            <CalendarClock size={14} />
            次の締切
          </span>
          <Badge tone={deadlineTone[tone]}>{formatDeadline(primaryDeadline)}</Badge>
        </div>
        <p className="mt-1 text-xs text-slate-500">{primaryDeadline ? formatDate(primaryDeadline) : "締切日は未設定です"}</p>
      </div>

      {!compact && (
        <>
          <div className="mt-3">
            <p className="text-xs font-semibold text-slate-500">次にやること</p>
            <p className={`mt-1 line-clamp-2 text-sm ${company.nextAction ? "text-slate-800" : "text-rose-600"}`}>
              {company.nextAction || "次アクション未設定"}
            </p>
          </div>

          <div className="mt-3">
            <p className="text-xs font-semibold text-slate-500">メモ</p>
            <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-600">{company.companyMemo || "メモはまだありません"}</p>
          </div>
        </>
      )}

      <div className="mt-3 flex flex-wrap gap-1.5">
        {warnings.slice(0, 3).map((warning) => (
          <Badge key={warning} tone={warning === "注意" ? "yellow" : "red"}>
            {warning}
          </Badge>
        ))}
        {company.tags.slice(0, compact ? 2 : 4).map((tag) => (
          <Badge key={tag} tone="gray">
            #{tag}
          </Badge>
        ))}
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-slate-200 pt-3">
        <span className="text-xs font-medium text-slate-500">優先度スコア {calculatePriorityScore(company)}</span>
        <div className="flex items-center gap-1">
          {company.myPageUrl && (
            <a href={company.myPageUrl} target="_blank" rel="noreferrer" className="icon-button-small" onClick={openUrl} aria-label="マイページURLを開く">
              <FileText size={15} />
            </a>
          )}
          {company.recruitUrl && (
            <a href={company.recruitUrl} target="_blank" rel="noreferrer" className="icon-button-small" onClick={openUrl} aria-label="採用ページURLを開く">
              <ExternalLink size={15} />
            </a>
          )}
          <button
            type="button"
            className="icon-button-small"
            onClick={(event) => {
              event.stopPropagation();
              onEdit(company);
            }}
            aria-label="企業を編集"
          >
            <Edit3 size={15} />
          </button>
          <button type="button" className="icon-button-small" aria-label="詳細を見る">
            <MoreHorizontal size={16} />
          </button>
        </div>
      </div>
    </article>
  );
}
