import { useCallback, useEffect, useMemo, useState } from "react";
import type { Company, CompanyFormValues } from "../types/company";
import { deleteCompany as deleteCompanyDocument, saveCompany as saveCompanyDocument, subscribeCompanies } from "../lib/companyService";
import { firebaseConfigError } from "../lib/firebase";

export const useCompanies = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(firebaseConfigError);

  useEffect(() => {
    if (firebaseConfigError) {
      setLoading(false);
      setError(firebaseConfigError);
      return;
    }

    setLoading(true);
    try {
      const unsubscribe = subscribeCompanies(
        (items) => {
          setCompanies(items);
          setError(null);
          setLoading(false);
        },
        () => {
          setCompanies([]);
          setError("Firestoreから企業データを読み込めませんでした。Firebase設定とFirestoreルールを確認してください。");
          setLoading(false);
        },
      );
      return unsubscribe;
    } catch {
      setError("Firestoreの初期化に失敗しました。.env のFirebase設定を確認してください。");
      setLoading(false);
    }
  }, []);

  const saveCompany = useCallback(async (values: CompanyFormValues) => {
    setSaving(true);
    try {
      const saved = await saveCompanyDocument(values);
      setError(null);
      return saved;
    } catch {
      setError("企業データの保存に失敗しました。Firestoreの書き込み権限を確認してください。");
      return null;
    } finally {
      setSaving(false);
    }
  }, []);

  const removeCompany = useCallback(async (id: string) => {
    setSaving(true);
    try {
      await deleteCompanyDocument(id);
      setError(null);
      return true;
    } catch {
      setError("企業データの削除に失敗しました。Firestoreの権限を確認してください。");
      return false;
    } finally {
      setSaving(false);
    }
  }, []);

  return useMemo(
    () => ({
      companies,
      loading,
      saving,
      error,
      saveCompany,
      removeCompany,
    }),
    [companies, error, loading, removeCompany, saveCompany, saving],
  );
};
