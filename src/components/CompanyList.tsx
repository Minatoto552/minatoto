import { Edit3, ExternalLink, Search, Trash2 } from "lucide-react";
import type { Company, CompanyViewMode } from "../types/company";
import { selectionStatuses } from "../types/company";
import { formatDate, formatDeadline, formatUpdatedAt, getPrimaryDeadline } from "../lib/scoreUtils";
import { Badge } from "./Badge";
import { CompanyCard } from "./CompanyCard";

export function EmptyState({ onNew }: { onNew: () => void }) {
  return (
    <div className="empty-state">
      <div className="mx-auto grid h-12 w-12 place-items-center rounded-lg bg-blue-50 text-blue-600">
        <Search size={24} />
      </div>
      <h2 className="mt-3 text-lg font-bold text-slate-950">登録企業はまだありません</h2>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-500">
        サンプル企業は表示していません。最初の1社を登録すると、締切・次アクション・優先度がダッシュボードに反映されます。
      </p>
      <button type="button" className="primary-button mt-4" onClick={onNew}>
        企業を追加する
      </button>
    </div>
  );
}

export function CompanyList({
  companies,
  view,
  onOpen,
  onEdit,
  onDelete,
  onNew,
}: {
  companies: Company[];
  view: CompanyViewMode;
  onOpen: (company: Company) => void;
  onEdit: (company: Company) => void;
  onDelete: (company: Company) => void;
  onNew: () => void;
}) {
  if (!companies.length) return <EmptyState onNew={onNew} />;

  if (view === "compact") {
    return (
      <section className="compact-grid">
        {companies.map((company) => (
          <CompanyCard key={company.id} company={company} compact onOpen={onOpen} onEdit={onEdit} />
        ))}
      </section>
    );
  }

  if (view === "table") {
    return (
      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-[980px] w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-3 py-3">企業名</th>
                <th className="px-3 py-3">業界/職種</th>
                <th className="px-3 py-3">志望/難易度</th>
                <th className="px-3 py-3">選考状況</th>
                <th className="px-3 py-3">締切</th>
                <th className="px-3 py-3">次アクション</th>
                <th className="px-3 py-3">更新</th>
                <th className="px-3 py-3 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {companies.map((company) => (
                <tr key={company.id} className="hover:bg-slate-50">
                  <td className="px-3 py-3">
                    <button type="button" className="font-bold text-slate-950 hover:text-blue-700" onClick={() => onOpen(company)}>
                      {company.name}
                    </button>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {company.tags.slice(0, 2).map((tag) => (
                        <Badge key={tag}>#{tag}</Badge>
                      ))}
                    </div>
                  </td>
                  <td className="px-3 py-3 text-slate-600">
                    {company.industry || "-"} / {company.jobType || "-"}
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex flex-wrap gap-1">
                      <Badge tone={company.desireLevel === "本命" ? "red" : "blue"}>{company.desireLevel}</Badge>
                      <Badge tone="purple">{company.difficultyLevel}</Badge>
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <Badge tone="green">{company.status}</Badge>
                  </td>
                  <td className="px-3 py-3 text-slate-600">
                    <div className="font-semibold text-slate-800">{formatDeadline(getPrimaryDeadline(company))}</div>
                    <div className="text-xs text-slate-500">{formatDate(getPrimaryDeadline(company))}</div>
                  </td>
                  <td className="max-w-[260px] px-3 py-3 text-slate-600">
                    <p className="line-clamp-2">{company.nextAction || "未設定"}</p>
                  </td>
                  <td className="px-3 py-3 text-xs text-slate-500">{formatUpdatedAt(company.updatedAt)}</td>
                  <td className="px-3 py-3">
                    <div className="flex justify-end gap-1">
                      {company.recruitUrl && (
                        <a className="icon-button-small" href={company.recruitUrl} target="_blank" rel="noreferrer" aria-label="採用ページを開く">
                          <ExternalLink size={15} />
                        </a>
                      )}
                      <button type="button" className="icon-button-small" onClick={() => onEdit(company)} aria-label="編集">
                        <Edit3 size={15} />
                      </button>
                      <button type="button" className="icon-button-small text-rose-600" onClick={() => onDelete(company)} aria-label="削除">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    );
  }

  if (view === "kanban") {
    const groups = selectionStatuses
      .map((status) => ({ status, companies: companies.filter((company) => company.status === status) }))
      .filter((group) => group.companies.length > 0);

    return (
      <section className="kanban-board">
        {groups.map((group) => (
          <div key={group.status} className="kanban-column">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800">{group.status}</h3>
              <Badge>{group.companies.length}社</Badge>
            </div>
            <div className="space-y-3">
              {group.companies.map((company) => (
                <CompanyCard key={company.id} company={company} compact onOpen={onOpen} onEdit={onEdit} />
              ))}
            </div>
          </div>
        ))}
      </section>
    );
  }

  return (
    <section className="company-grid">
      {companies.map((company) => (
        <CompanyCard key={company.id} company={company} onOpen={onOpen} onEdit={onEdit} />
      ))}
    </section>
  );
}
