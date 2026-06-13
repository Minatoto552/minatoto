import { Plus, X } from "lucide-react";
import { useMemo, useState } from "react";
import { AppHeader } from "./components/AppHeader";
import { CompanyDetail } from "./components/CompanyDetail";
import { CompanyForm } from "./components/CompanyForm";
import { CompanyList } from "./components/CompanyList";
import { Dashboard } from "./components/Dashboard";
import { useCompanies } from "./hooks/useCompanies";
import { filterCompanies, sortCompanies } from "./lib/scoreUtils";
import type { Company, CompanyFilters, CompanyFormValues } from "./types/company";

const initialFilters: CompanyFilters = {
  query: "",
  category: "all",
  industry: "",
  status: "",
  desireLevel: "",
  difficultyLevel: "",
  tag: "",
  sort: "priority",
  view: "card",
};

export default function App() {
  const { companies, loading, saving, error, saveCompany, removeCompany } = useCompanies();
  const [filters, setFilters] = useState<CompanyFilters>(initialFilters);
  const [detailCompany, setDetailCompany] = useState<Company | null>(null);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [notice, setNotice] = useState("");

  const filteredCompanies = useMemo(() => sortCompanies(filterCompanies(companies, filters), filters.sort), [companies, filters]);

  const openNewForm = () => {
    setEditingCompany(null);
    setFormOpen(true);
  };

  const openEditForm = (company: Company) => {
    setEditingCompany(company);
    setDetailCompany(null);
    setFormOpen(true);
  };

  const handleSave = async (values: CompanyFormValues) => {
    const saved = await saveCompany(values);
    if (!saved) return false;
    setNotice(`${saved.name}を保存しました`);
    setFormOpen(false);
    setEditingCompany(null);
    setDetailCompany(saved);
    window.setTimeout(() => setNotice(""), 2800);
    return true;
  };

  const handleDelete = async (company: Company) => {
    const confirmed = window.confirm(`${company.name}を削除しますか？この操作は取り消せません。`);
    if (!confirmed) return;
    const deleted = await removeCompany(company.id);
    if (!deleted) return;
    setNotice(`${company.name}を削除しました`);
    setDetailCompany(null);
    window.setTimeout(() => setNotice(""), 2800);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <AppHeader companies={companies} filters={filters} onChange={setFilters} onNew={openNewForm} />

      <main className="mx-auto max-w-[1800px] space-y-5 px-3 py-4 pb-24 sm:px-5 lg:pb-8">
        {error && (
          <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
            {error}
          </div>
        )}

        <Dashboard companies={companies} />

        <section className="space-y-3">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-950">企業一覧</h2>
              <p className="text-sm text-slate-500">
                {filteredCompanies.length} / {companies.length} 社を表示中
              </p>
            </div>
            <button type="button" className="secondary-button" onClick={() => setFilters(initialFilters)}>
              絞り込みをリセット
            </button>
          </div>

          {loading ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-6">
              {Array.from({ length: 12 }).map((_, index) => (
                <div key={index} className="h-56 animate-pulse rounded-lg border border-slate-200 bg-white" />
              ))}
            </div>
          ) : filteredCompanies.length ? (
            <CompanyList companies={filteredCompanies} view={filters.view} onOpen={setDetailCompany} onEdit={openEditForm} onDelete={handleDelete} onNew={openNewForm} />
          ) : (
            <div className="empty-state">
              <h2 className="text-lg font-bold text-slate-950">{companies.length ? "条件に一致する企業がありません" : "登録企業はまだありません"}</h2>
              <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-500">
                {companies.length
                  ? "検索キーワードやフィルターを少し緩めると見つかるかもしれません。"
                  : "サンプル企業は表示していません。最初の1社を登録すると、締切・次アクション・優先度が反映されます。"}
              </p>
              {!companies.length && (
                <button type="button" className="primary-button mt-4" onClick={openNewForm}>
                  企業を追加する
                </button>
              )}
            </div>
          )}
        </section>
      </main>

      <button type="button" className="floating-add-button md:hidden" onClick={openNewForm} aria-label="企業を追加">
        <Plus size={24} />
      </button>

      {notice && (
        <div className="fixed bottom-5 left-1/2 z-[60] -translate-x-1/2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700 shadow-lg">
          {notice}
        </div>
      )}

      {formOpen && (
        <div className="fixed inset-0 z-50">
          <button className="absolute inset-0 bg-slate-950/35" onClick={() => setFormOpen(false)} aria-label="フォームを閉じる" />
          <aside className="drawer-panel">
            <CompanyForm initialCompany={editingCompany} saving={saving} onSubmit={handleSave} onCancel={() => setFormOpen(false)} />
          </aside>
        </div>
      )}

      <CompanyDetail company={detailCompany} onClose={() => setDetailCompany(null)} onEdit={openEditForm} onDelete={handleDelete} />

      {formOpen && (
        <button type="button" className="fixed right-4 top-4 z-[61] grid h-10 w-10 place-items-center rounded-lg bg-white text-slate-700 shadow md:hidden" onClick={() => setFormOpen(false)} aria-label="閉じる">
          <X size={20} />
        </button>
      )}
    </div>
  );
}
