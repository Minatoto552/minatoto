import { CalendarDays, Edit3, ExternalLink, Trash2, X } from "lucide-react";
import type { Company } from "../types/company";
import { calculatePriorityScore, formatDate, formatUpdatedAt, getCompanyWarnings, getPrimaryDeadline } from "../lib/scoreUtils";
import { Badge } from "./Badge";

const MemoBlock = ({ title, value }: { title: string; value: string }) => (
  <section className="rounded-lg border border-slate-200 bg-white p-4">
    <h3 className="text-sm font-bold text-slate-950">{title}</h3>
    <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">{value || "未入力"}</p>
  </section>
);

export function CompanyDetail({
  company,
  onClose,
  onEdit,
  onDelete,
}: {
  company: Company | null;
  onClose: () => void;
  onEdit: (company: Company) => void;
  onDelete: (company: Company) => void;
}) {
  if (!company) return null;

  const primaryDeadline = getPrimaryDeadline(company);

  return (
    <div className="fixed inset-0 z-50">
      <button className="absolute inset-0 bg-slate-950/35" onClick={onClose} aria-label="詳細を閉じる" />
      <aside className="drawer-panel">
        <div className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 px-5 py-4 backdrop-blur">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">Company Detail</p>
              <h2 className="mt-1 truncate text-2xl font-bold text-slate-950">{company.name}</h2>
              <p className="mt-1 text-sm text-slate-500">
                {company.industry || "業界未設定"} / {company.jobType || "職種未設定"}
              </p>
            </div>
            <button type="button" className="icon-button" onClick={onClose} aria-label="詳細を閉じる">
              <X size={19} />
            </button>
          </div>
        </div>

        <div className="space-y-5 p-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold text-slate-500">優先度</p>
              <div className="mt-2 flex items-center gap-2">
                <Badge tone={company.priority === "高" ? "red" : company.priority === "中" ? "yellow" : "gray"}>{company.priority}</Badge>
                <span className="text-sm font-semibold text-slate-700">スコア {calculatePriorityScore(company)}</span>
              </div>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold text-slate-500">次の締切</p>
              <p className="mt-2 flex items-center gap-2 text-sm font-bold text-slate-800">
                <CalendarDays size={16} />
                {primaryDeadline ? `${formatDate(primaryDeadline)} (${primaryDeadline})` : "未設定"}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge tone={company.desireLevel === "本命" ? "red" : "blue"}>志望度 {company.desireLevel}</Badge>
            <Badge tone="purple">難易度 {company.difficultyLevel}</Badge>
            <Badge tone="green">{company.status}</Badge>
            <Badge tone={company.myPageRegistered ? "green" : "gray"}>{company.myPageRegistered ? "マイページ済み" : "マイページ未登録"}</Badge>
            {getCompanyWarnings(company).map((warning) => (
              <Badge key={warning} tone={warning === "注意" ? "yellow" : "red"}>
                {warning}
              </Badge>
            ))}
          </div>

          <section className="rounded-lg border border-blue-100 bg-blue-50 p-4">
            <h3 className="text-sm font-bold text-blue-950">次にやること</h3>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-blue-900">{company.nextAction || "次アクション未設定"}</p>
          </section>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="detail-row"><span>応募予定日</span><strong>{company.applyDate || "-"}</strong></div>
            <div className="detail-row"><span>ES締切</span><strong>{company.esDeadline || "-"}</strong></div>
            <div className="detail-row"><span>インターン締切</span><strong>{company.internshipDeadline || "-"}</strong></div>
            <div className="detail-row"><span>面接予定</span><strong>{company.interviewSchedule || "-"}</strong></div>
            <div className="detail-row"><span>ES提出状況</span><strong>{company.esStatus}</strong></div>
            <div className="detail-row"><span>SPI・適性検査</span><strong>{company.aptitudeTestStatus}</strong></div>
            <div className="detail-row"><span>インターン</span><strong>{company.internshipStatus}</strong></div>
            <div className="detail-row"><span>最終更新</span><strong>{formatUpdatedAt(company.updatedAt)}</strong></div>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <MemoBlock title="企業メモ" value={company.companyMemo} />
            <MemoBlock title="志望理由メモ" value={company.motivationMemo} />
            <MemoBlock title="ESメモ" value={company.esMemo} />
            <MemoBlock title="面接メモ" value={company.interviewMemo} />
            <MemoBlock title="逆質問メモ" value={company.questionMemo} />
          </div>

          <div className="flex flex-wrap gap-2">
            {company.tags.length ? company.tags.map((tag) => <Badge key={tag}>#{tag}</Badge>) : <Badge>タグ未設定</Badge>}
          </div>

          <div className="flex flex-wrap justify-between gap-3 border-t border-slate-200 pt-4">
            <div className="flex flex-wrap gap-2">
              {company.myPageUrl && (
                <a className="secondary-button" href={company.myPageUrl} target="_blank" rel="noreferrer">
                  <ExternalLink size={17} />
                  マイページ
                </a>
              )}
              {company.recruitUrl && (
                <a className="secondary-button" href={company.recruitUrl} target="_blank" rel="noreferrer">
                  <ExternalLink size={17} />
                  採用ページ
                </a>
              )}
            </div>
            <div className="flex gap-2">
              <button type="button" className="danger-button" onClick={() => onDelete(company)}>
                <Trash2 size={17} />
                削除
              </button>
              <button type="button" className="primary-button" onClick={() => onEdit(company)}>
                <Edit3 size={17} />
                編集
              </button>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
