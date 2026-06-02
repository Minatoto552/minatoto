import React from 'react';
import { cn } from '../../lib/utils';

interface RotationTabProps {
  label: React.ReactNode;
  isActive: boolean;
  isCurrent?: boolean;
  onClick: () => void;
  key?: React.Key;
}

export function RotationTab({ label, isActive, isCurrent, onClick }: RotationTabProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative px-5 py-2.5 rounded-full border border-white/10 flex items-center justify-center gap-2 whitespace-nowrap transition-all font-sans shrink-0",
        isActive 
          ? "bg-gradient-to-b from-[#d4af37]/20 to-[#d4af37]/5 border-[#d4af37]/60 text-white shadow-[0_0_15px_rgba(212,175,55,0.15)]" 
          : "bg-black/60 text-gray-400 hover:bg-white/10 hover:text-gray-200",
      )}
    >
      <span className={cn("font-bold text-sm tracking-widest", isActive ? "text-[#d4af37]" : "")}>{label}</span>
      {isCurrent && (
        <span className="text-[10px] bg-red-600/80 border border-red-400/50 text-white px-1.5 py-0.5 rounded font-bold uppercase tracking-wider absolute -top-1.5 -right-1.5 shadow-lg shadow-red-900/50">
          現在
        </span>
      )}
    </button>
  );
}
