import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getBusinessDate(date: Date = new Date()): string {
  const calcDate = new Date(date);
  if (calcDate.getHours() < 3) {
    calcDate.setDate(calcDate.getDate() - 1);
  }
  const yyyy = calcDate.getFullYear();
  const mm = String(calcDate.getMonth() + 1).padStart(2, '0');
  const dd = String(calcDate.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export const safeArray = <T,>(value: T[] | undefined | null): T[] => value ?? [];

export const formatDateTime = (date: any): string => {
  if (!date) return '-';
  if (date instanceof Date && !isNaN(date.getTime())) return date.toLocaleString();
  if (typeof date.toDate === 'function') return date.toDate().toLocaleString();
  try {
    const parsed = new Date(date);
    if (!isNaN(parsed.getTime())) return parsed.toLocaleString();
  } catch (e) {}
  return '日時不明';
};

