import React from 'react';
import { cn } from '../../lib/utils';

interface TableNumberLabelProps {
  tableId: string;
  className?: string;
  showPrefix?: boolean;
}

export function TableNumberLabel({ tableId, className, showPrefix = true }: TableNumberLabelProps) {
  return (
    <span className={cn("font-sans font-black tracking-normal text-white whitespace-nowrap bg-white/10 px-4 py-1.5 rounded border border-white/20 inline-flex items-center justify-center", className)}>
      {showPrefix && <span className="mr-1.5 text-[0.7em] text-[#d4af37] font-bold opacity-90">卓</span>}
      <span className="leading-none">{tableId}</span>
    </span>
  );
}
