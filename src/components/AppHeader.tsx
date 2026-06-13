import { ArrowDownAZ, Columns3, Grid2X2, KanbanSquare, LayoutList, Plus, Search, Table2 } from "lucide-react";
import {
  desireLevels,
  difficultyLevels,
  selectionStatuses,
  type CategoryFilter,
  type Company,
  type CompanyFilters,
  type CompanySortKey,
  type CompanyViewMode,
} from "../types/company";
import { getUniqueOptions } from "../lib/scoreUtils";

const categories: { id: CategoryFilter; label: string }[] = [
  { id: "all", label: "すべて" },
  { id: "favorite", label: "本命" },
  { id: "internship", label: "インターン" },
  { id: "active", label: "選考中" },
  { id: "mypage", label: "マイページ作成済み" },
  { id: "esBefore", label: "ES提出前" },
  { id: "aptitude", label: "SPI・適性検査" },
  { id: "interview", label: "面接予定" },
  { id: "urgent", label: "締切間近" },
  { id: "offer", label: "内定候補" },
  { id: "rejected", label: "見送り" },
];

const sortLabels: Record<CompanySortKey, string> = {
  deadline: "締切が近い順",
  desire: "志望度が高い順",
  difficulty: "難易度が高い順",
  priority: "優先度が高い順",
  updated: "最近更新した順",
};

const viewItems: { id: CompanyViewMode; label: string; icon: typeof Grid2X2 }[] = [
  { id: "card", label: "カード表示", icon: Grid2X2 },
  { id: "compact", label: "コンパクト表示", icon: LayoutList },
  { id: "table", label: "一覧表表示", icon: Table2 },
  { id: "kanban", label: "カンバン表示", icon: KanbanSquare },
];

export function AppHeader({
  companies,
  filters,
  onChange,
  onNew,
}: {
  companies: Company[];
  filters: CompanyFilters;
  onChange: (filters: CompanyFilters) => void;
  onNew: () => void;
}) {
  const industries = getUniqueOptions(companies, "industry");

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-slate-50/92 py-3 backdrop-blur">
      <div className="mx-auto max-w-[1800px] space-y-3 px-3 sm:px-5">
        <div className="grid gap-3 xl:grid-cols-[auto_minmax(280px,1fr)_auto_auto] xl:items-center">
          <div>
            <h1 className="text-xl font-bold text-slate-950 sm:text-2xl">就活企業管理</h1>
            <p className="text-xs text-slate-500">締切・選考状況・次アクションを一元管理</p>
          </div>

          <label className="relative block">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              className="field-control h-11 pl-10"
              value={filters.query}
              onChange={(event) => onChange({ ...filters, query: event.target.value })}
              placeholder="企業名、業界、タグ、メモを検索"
            />
          </label>

          <label className="relative block">
            <ArrowDownAZ className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <select className="field-control h-11 min-w-48 pl-10" value={filters.sort} onChange={(event) => onChange({ ...filters, sort: event.target.value as CompanySortKey })}>
              {Object.entries(sortLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>

          <button type="button" className="primary-button hidden md:inline-flex" onClick={onNew}>
            <Plus size={18} />
            企業追加
          </button>
        </div>

        <nav className="flex gap-2 overflow-x-auto pb-1 scrollbar-none" aria-label="カテゴリ">
          {categories.map((category) => (
            <button
              key={category.id}
              type="button"
              className={`category-tab ${filters.category === category.id ? "category-tab-active" : ""}`}
              onClick={() => onChange({ ...filters, category: category.id })}
            >
              {category.label}
            </button>
          ))}
        </nav>

        <div className="grid gap-2 lg:grid-cols-[repeat(5,minmax(0,1fr))_auto]">
          <select className="field-control h-10" value={filters.industry} onChange={(event) => onChange({ ...filters, industry: event.target.value })} aria-label="業界で絞り込み">
            <option value="">業界すべて</option>
            {industries.map((industry) => (
              <option key={industry} value={industry}>
                {industry}
              </option>
            ))}
          </select>
          <select className="field-control h-10" value={filters.status} onChange={(event) => onChange({ ...filters, status: event.target.value })} aria-label="選考状況で絞り込み">
            <option value="">選考状況すべて</option>
            {selectionStatuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          <select className="field-control h-10" value={filters.desireLevel} onChange={(event) => onChange({ ...filters, desireLevel: event.target.value })} aria-label="志望度で絞り込み">
            <option value="">志望度すべて</option>
            {desireLevels.map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>
          <select className="field-control h-10" value={filters.difficultyLevel} onChange={(event) => onChange({ ...filters, difficultyLevel: event.target.value })} aria-label="難易度で絞り込み">
            <option value="">難易度すべて</option>
            {difficultyLevels.map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>
          <input className="field-control h-10" value={filters.tag} onChange={(event) => onChange({ ...filters, tag: event.target.value })} placeholder="タグ検索" />

          <div className="inline-flex w-fit items-center rounded-lg border border-slate-200 bg-white p-1">
            {viewItems.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                className={`view-button ${filters.view === id ? "view-button-active" : ""}`}
                onClick={() => onChange({ ...filters, view: id })}
                aria-label={label}
                title={label}
              >
                {id === "compact" ? <Columns3 size={17} /> : <Icon size={17} />}
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
