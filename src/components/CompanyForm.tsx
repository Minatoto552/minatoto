import { Save, X } from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  aptitudeTestStatuses,
  defaultCompanyFormValues,
  desireLevels,
  difficultyLevels,
  esStatuses,
  internshipStatuses,
  selectionStatuses,
  type Company,
  type CompanyFormValues,
} from "../types/company";
import { TagInput } from "./TagInput";

const toFormValues = (company?: Company | null): CompanyFormValues => {
  if (!company) return { ...defaultCompanyFormValues };
  const { id, createdAt, updatedAt, priority, ...values } = company;
  return { ...values, id, createdAt, updatedAt, priority };
};

const loadDraft = (key: string, fallback: CompanyFormValues) => {
  try {
    const draft = window.localStorage.getItem(key);
    return draft ? ({ ...fallback, ...JSON.parse(draft) } as CompanyFormValues) : fallback;
  } catch {
    return fallback;
  }
};

export function CompanyForm({
  initialCompany,
  saving,
  onSubmit,
  onCancel,
}: {
  initialCompany?: Company | null;
  saving: boolean;
  onSubmit: (company: CompanyFormValues) => Promise<boolean | void> | boolean | void;
  onCancel: () => void;
}) {
  const draftKey = `career-company-draft:${initialCompany?.id ?? "new"}`;
  const baseValues = useMemo(() => toFormValues(initialCompany), [initialCompany]);
  const [company, setCompany] = useState<CompanyFormValues>(() => loadDraft(draftKey, baseValues));

  useEffect(() => {
    window.localStorage.setItem(draftKey, JSON.stringify(company));
  }, [company, draftKey]);

  const update = <Key extends keyof CompanyFormValues>(key: Key, value: CompanyFormValues[Key]) => {
    setCompany((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!company.name.trim()) return;
    const result = await onSubmit(company);
    if (result !== false) window.localStorage.removeItem(draftKey);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="flex items-start justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">{initialCompany ? "Edit Company" : "New Company"}</p>
          <h2 className="text-xl font-bold text-slate-950">{initialCompany ? "企業を編集" : "企業を追加"}</h2>
          <p className="mt-1 text-xs text-slate-500">企業名だけ必須です。入力内容は編集中に下書き保存されます。</p>
        </div>
        <button type="button" className="icon-button" onClick={onCancel} aria-label="フォームを閉じる">
          <X size={19} />
        </button>
      </div>

      <section className="form-section">
        <h3 className="form-section-title">基本情報</h3>
        <label className="form-label md:col-span-2">
          企業名 <span className="text-rose-600">*</span>
          <input className="field-control mt-1" value={company.name} onChange={(event) => update("name", event.target.value)} placeholder="例: 株式会社〇〇" required />
        </label>
        <label className="form-label">
          業界
          <input className="field-control mt-1" value={company.industry} onChange={(event) => update("industry", event.target.value)} placeholder="IT、メーカー、金融など" />
        </label>
        <label className="form-label">
          職種
          <input className="field-control mt-1" value={company.jobType} onChange={(event) => update("jobType", event.target.value)} placeholder="総合職、エンジニアなど" />
        </label>
      </section>

      <section className="form-section">
        <h3 className="form-section-title">選考状況</h3>
        <label className="form-label">
          志望度
          <select className="field-control mt-1" value={company.desireLevel} onChange={(event) => update("desireLevel", event.target.value as CompanyFormValues["desireLevel"])}>
            {desireLevels.map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>
        </label>
        <label className="form-label">
          難易度
          <select className="field-control mt-1" value={company.difficultyLevel} onChange={(event) => update("difficultyLevel", event.target.value as CompanyFormValues["difficultyLevel"])}>
            {difficultyLevels.map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>
        </label>
        <label className="form-label md:col-span-2">
          選考状況
          <select className="field-control mt-1" value={company.status} onChange={(event) => update("status", event.target.value as CompanyFormValues["status"])}>
            {selectionStatuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </label>
        <label className="check-row md:col-span-2">
          <input type="checkbox" checked={company.myPageRegistered} onChange={(event) => update("myPageRegistered", event.target.checked)} />
          マイページ作成済み
        </label>
        <label className="form-label">
          ES提出状況
          <select className="field-control mt-1" value={company.esStatus} onChange={(event) => update("esStatus", event.target.value as CompanyFormValues["esStatus"])}>
            {esStatuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </label>
        <label className="form-label">
          SPI・適性検査
          <select className="field-control mt-1" value={company.aptitudeTestStatus} onChange={(event) => update("aptitudeTestStatus", event.target.value as CompanyFormValues["aptitudeTestStatus"])}>
            {aptitudeTestStatuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </label>
        <label className="form-label">
          インターン応募状況
          <select className="field-control mt-1" value={company.internshipStatus} onChange={(event) => update("internshipStatus", event.target.value as CompanyFormValues["internshipStatus"])}>
            {internshipStatuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </label>
        <label className="form-label">
          面接予定
          <input className="field-control mt-1" type="date" value={company.interviewSchedule} onChange={(event) => update("interviewSchedule", event.target.value)} />
        </label>
      </section>

      <section className="form-section">
        <h3 className="form-section-title">締切・次アクション</h3>
        <label className="form-label">
          応募予定日
          <input className="field-control mt-1" type="date" value={company.applyDate} onChange={(event) => update("applyDate", event.target.value)} />
        </label>
        <label className="form-label">
          ES締切
          <input className="field-control mt-1" type="date" value={company.esDeadline} onChange={(event) => update("esDeadline", event.target.value)} />
        </label>
        <label className="form-label">
          インターン締切
          <input className="field-control mt-1" type="date" value={company.internshipDeadline} onChange={(event) => update("internshipDeadline", event.target.value)} />
        </label>
        <label className="form-label">
          次の締切日
          <input className="field-control mt-1" type="date" value={company.nextDeadline} onChange={(event) => update("nextDeadline", event.target.value)} />
        </label>
        <label className="form-label md:col-span-2">
          次にやること
          <textarea className="field-control mt-1 min-h-20" value={company.nextAction} onChange={(event) => update("nextAction", event.target.value)} placeholder="例: ESの設問を確認して下書きを作る" />
        </label>
      </section>

      <section className="form-section">
        <h3 className="form-section-title">URL・タグ</h3>
        <label className="form-label">
          マイページURL
          <input className="field-control mt-1" value={company.myPageUrl} onChange={(event) => update("myPageUrl", event.target.value)} placeholder="https://..." />
        </label>
        <label className="form-label">
          採用ページURL
          <input className="field-control mt-1" value={company.recruitUrl} onChange={(event) => update("recruitUrl", event.target.value)} placeholder="https://..." />
        </label>
        <div className="md:col-span-2">
          <p className="form-label mb-1">タグ</p>
          <TagInput tags={company.tags} onChange={(tags) => update("tags", tags)} />
        </div>
      </section>

      <section className="form-section">
        <h3 className="form-section-title">メモ</h3>
        <label className="form-label md:col-span-2">
          企業メモ
          <textarea className="field-control mt-1 min-h-24" value={company.companyMemo} onChange={(event) => update("companyMemo", event.target.value)} />
        </label>
        <label className="form-label">
          志望理由メモ
          <textarea className="field-control mt-1 min-h-24" value={company.motivationMemo} onChange={(event) => update("motivationMemo", event.target.value)} />
        </label>
        <label className="form-label">
          ESメモ
          <textarea className="field-control mt-1 min-h-24" value={company.esMemo} onChange={(event) => update("esMemo", event.target.value)} />
        </label>
        <label className="form-label">
          面接メモ
          <textarea className="field-control mt-1 min-h-24" value={company.interviewMemo} onChange={(event) => update("interviewMemo", event.target.value)} />
        </label>
        <label className="form-label">
          逆質問メモ
          <textarea className="field-control mt-1 min-h-24" value={company.questionMemo} onChange={(event) => update("questionMemo", event.target.value)} />
        </label>
      </section>

      <div className="sticky bottom-0 -mx-5 flex flex-col-reverse gap-2 border-t border-slate-200 bg-white/95 px-5 py-4 backdrop-blur sm:flex-row sm:justify-end">
        <button type="button" className="secondary-button" onClick={onCancel}>
          キャンセル
        </button>
        <button type="submit" className="primary-button" disabled={saving || !company.name.trim()}>
          <Save size={18} />
          {saving ? "保存中..." : "保存する"}
        </button>
      </div>
    </form>
  );
}
