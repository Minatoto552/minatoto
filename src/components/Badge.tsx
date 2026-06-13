import type { ReactNode } from "react";

type BadgeTone = "blue" | "green" | "yellow" | "red" | "gray" | "purple";

const toneClass: Record<BadgeTone, string> = {
  blue: "border-blue-200 bg-blue-50 text-blue-700",
  green: "border-emerald-200 bg-emerald-50 text-emerald-700",
  yellow: "border-amber-200 bg-amber-50 text-amber-800",
  red: "border-rose-200 bg-rose-50 text-rose-700",
  gray: "border-slate-200 bg-slate-50 text-slate-600",
  purple: "border-violet-200 bg-violet-50 text-violet-700",
};

export function Badge({
  children,
  tone = "gray",
  className = "",
}: {
  children: ReactNode;
  tone?: BadgeTone;
  className?: string;
}) {
  return <span className={`badge ${toneClass[tone]} ${className}`}>{children}</span>;
}
