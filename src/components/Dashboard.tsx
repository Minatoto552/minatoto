import { AlertTriangle, BriefcaseBusiness, CalendarClock, CheckCircle2, Clock3, Flame, ListChecks, Target } from "lucide-react";
import type { Company } from "../types/company";
import { formatDate, getDeadlineTone, getPrimaryDeadline, isActiveCompany, isStaleCompany, sortCompanies } from "../lib/scoreUtils";

const DashboardMetric = ({
  label,
  value,
  icon: Icon,
  tone = "blue",
}: {
  label: string;
  value: number | string;
  icon: typeof BriefcaseBusiness;
  tone?: "blue" | "red" | "yellow" | "green" | "gray";
}) => (
  <div className={`metric-card metric-${tone}`}>
    <div className="flex items-center justify-between">
      <span className="text-xs font-semibold text-slate-500">{label}</span>
      <Icon size={17} />
    </div>
    <p className="mt-2 text-2xl font-bold text-slate-950">{value}</p>
  </div>
);

const MiniList = ({ title, companies }: { title: string; companies: Company[] }) => (
  <div className="rounded-lg border border-slate-200 bg-white p-3">
    <h3 className="text-xs font-bold text-slate-600">{title}</h3>
    <div className="mt-2 space-y-2">
      {companies.length ? (
        companies.slice(0, 3).map((company) => (
          <div key={company.id} className="flex items-center justify-between gap-2 text-xs">
            <span className="min-w-0 truncate font-semibold text-slate-800">{company.name}</span>
            <span className="shrink-0 text-slate-500">{formatDate(getPrimaryDeadline(company))}</span>
          </div>
        ))
      ) : (
        <p className="text-xs text-slate-400">該当なし</p>
      )}
    </div>
  </div>
);

export function Dashboard({ companies }: { companies: Company[] }) {
  const urgent = companies.filter((company) => ["urgent", "expired"].includes(getDeadlineTone(getPrimaryDeadline(company))));
  const warning = companies.filter((company) => getDeadlineTone(getPrimaryDeadline(company)) === "warning");
  const today = companies.filter((company) => {
    const deadline = getPrimaryDeadline(company);
    return getDeadlineTone(deadline) === "urgent" && deadline && new Date(`${deadline}T00:00:00`).toDateString() === new Date().toDateString();
  });
  const tomorrow = companies.filter((company) => {
    const deadline = getPrimaryDeadline(company);
    if (!deadline) return false;
    const target = new Date(`${deadline}T00:00:00`);
    const next = new Date();
    next.setDate(next.getDate() + 1);
    return target.toDateString() === next.toDateString();
  });
  const active = companies.filter(isActiveCompany);
  const favorite = companies.filter((company) => company.desireLevel === "本命");
  const highPriority = companies.filter((company) => company.priority === "高");
  const stale = companies.filter(isStaleCompany);
  const nextCompanies = sortCompanies(
    companies.filter((company) => company.nextAction.trim() || getPrimaryDeadline(company)),
    "priority",
  );

  return (
    <section className="space-y-3">
      <div className="dashboard-grid">
        <DashboardMetric label="登録企業" value={companies.length} icon={BriefcaseBusiness} />
        <DashboardMetric label="選考中" value={active.length} icon={ListChecks} tone="green" />
        <DashboardMetric label="締切間近" value={urgent.length + warning.length} icon={CalendarClock} tone={urgent.length ? "red" : "yellow"} />
        <DashboardMetric label="本命" value={favorite.length} icon={Target} tone="red" />
        <DashboardMetric label="優先度 高" value={highPriority.length} icon={Flame} tone="yellow" />
        <DashboardMetric label="放置中" value={stale.length} icon={Clock3} tone={stale.length ? "red" : "gray"} />
      </div>

      <div className="grid gap-3 lg:grid-cols-4">
        <MiniList title="今日やること" companies={today.length ? today : nextCompanies.slice(0, 3)} />
        <MiniList title="明日まで" companies={tomorrow} />
        <MiniList title="3日以内の締切" companies={urgent} />
        <MiniList title="次に対応すべき企業" companies={nextCompanies} />
      </div>

      {companies.length > 0 && urgent.length > 0 && (
        <div className="flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700">
          <AlertTriangle size={17} />
          3日以内または期限切れの企業があります。締切日と次アクションを確認してください。
        </div>
      )}
      {companies.length > 0 && urgent.length === 0 && (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700">
          <CheckCircle2 size={17} />
          今日時点で至急対応の締切はありません。
        </div>
      )}
    </section>
  );
}
