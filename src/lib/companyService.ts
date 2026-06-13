import { collection, deleteDoc, doc, onSnapshot, setDoc, type Unsubscribe } from "firebase/firestore";
import { db } from "./firebase";
import {
  defaultCompanyFormValues,
  type AptitudeTestStatus,
  type Company,
  type CompanyFormValues,
  type DesireLevel,
  type DifficultyLevel,
  type EsStatus,
  type InternshipStatus,
  type SelectionStatus,
} from "../types/company";
import { withDerivedCompanyFields } from "./scoreUtils";

const collectionName = "companies";

const requireDb = () => {
  if (!db) throw new Error("Firebaseが設定されていません。.env を確認してください。");
  return db;
};

const asString = (value: unknown) => (typeof value === "string" ? value : "");
const asBoolean = (value: unknown) => (typeof value === "boolean" ? value : false);
const asTags = (value: unknown) => (Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : []);

const normalizeCompany = (id: string, data: Partial<Company>): Company =>
  withDerivedCompanyFields({
    id,
    ...defaultCompanyFormValues,
    name: asString(data.name),
    industry: asString(data.industry),
    jobType: asString(data.jobType),
    desireLevel: (data.desireLevel || "未設定") as DesireLevel,
    difficultyLevel: (data.difficultyLevel || "未設定") as DifficultyLevel,
    priority: data.priority || "低",
    status: (data.status || "未対応") as SelectionStatus,
    myPageRegistered: asBoolean(data.myPageRegistered),
    esStatus: (data.esStatus || "未着手") as EsStatus,
    aptitudeTestStatus: (data.aptitudeTestStatus || "未定") as AptitudeTestStatus,
    interviewSchedule: asString(data.interviewSchedule),
    internshipStatus: (data.internshipStatus || "未対応") as InternshipStatus,
    applyDate: asString(data.applyDate),
    esDeadline: asString(data.esDeadline),
    internshipDeadline: asString(data.internshipDeadline),
    nextDeadline: asString(data.nextDeadline),
    nextAction: asString(data.nextAction),
    companyMemo: asString(data.companyMemo),
    motivationMemo: asString(data.motivationMemo),
    esMemo: asString(data.esMemo),
    interviewMemo: asString(data.interviewMemo),
    questionMemo: asString(data.questionMemo),
    myPageUrl: asString(data.myPageUrl),
    recruitUrl: asString(data.recruitUrl),
    tags: asTags(data.tags),
    createdAt: asString(data.createdAt) || new Date().toISOString(),
    updatedAt: asString(data.updatedAt) || new Date().toISOString(),
  });

const buildCompanyPayload = (values: CompanyFormValues, id: string): Company => {
  const now = new Date().toISOString();
  return withDerivedCompanyFields({
    id,
    ...defaultCompanyFormValues,
    ...values,
    name: values.name.trim(),
    industry: values.industry.trim(),
    jobType: values.jobType.trim(),
    nextAction: values.nextAction.trim(),
    myPageUrl: values.myPageUrl.trim(),
    recruitUrl: values.recruitUrl.trim(),
    tags: values.tags.map((tag) => tag.trim()).filter(Boolean),
    createdAt: values.createdAt || now,
    updatedAt: now,
    priority: values.priority || "低",
  });
};

export const subscribeCompanies = (onNext: (companies: Company[]) => void, onError: (error: Error) => void): Unsubscribe => {
  const firestore = requireDb();
  return onSnapshot(
    collection(firestore, collectionName),
    (snapshot) => {
      const companies = snapshot.docs
        .map((document) => normalizeCompany(document.id, document.data() as Partial<Company>))
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
      onNext(companies);
    },
    onError,
  );
};

export const saveCompany = async (values: CompanyFormValues) => {
  const firestore = requireDb();
  const id = values.id || doc(collection(firestore, collectionName)).id;
  const payload = buildCompanyPayload(values, id);
  await setDoc(doc(firestore, collectionName, id), payload, { merge: true });
  return payload;
};

export const deleteCompany = async (id: string) => {
  const firestore = requireDb();
  await deleteDoc(doc(firestore, collectionName, id));
};
