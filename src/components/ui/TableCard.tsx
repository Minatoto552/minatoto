import React from 'react';
import { Users } from 'lucide-react';
import { cn } from '../../lib/utils';
import { TableNumberLabel } from './TableNumberLabel';

interface TableCardProps {
  tableId: string;
  badge?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  active?: boolean;
  key?: React.Key;
}

export function TableCard({ tableId, badge, children, className, active }: TableCardProps) {
  return (
    <div className={cn("glass-panel rounded-xl border overflow-hidden", active ? "border-[#d4af37]/50 bg-[#d4af37]/5" : "border-white/10", className)}>
      <div className={cn("px-4 py-3 border-b flex justify-between items-center", active ? "bg-black/80 border-[#d4af37]/20" : "bg-black/60 border-white/10")}>
        <div className="flex items-center gap-2">
          <TableNumberLabel tableId={tableId} className={active ? "text-[#d4af37] text-xl" : "text-white text-xl"} />
        </div>
        {badge ? badge : <Users size={16} className={active ? "text-[#d4af37]" : "text-gray-500"} />}
      </div>
      <div className="p-4 space-y-3">
        {children}
      </div>
    </div>
  );
}
