import React from 'react';
import { cn } from '../../lib/utils';

interface RotationLabelProps {
  rotationNumber: number | string;
  className?: string;
  isCurrent?: boolean;
}

export function RotationLabel({ rotationNumber, className, isCurrent }: RotationLabelProps) {
  const label = rotationNumber === 0 ? '営業前' : (typeof rotationNumber === 'number' || !isNaN(Number(rotationNumber)) 
    ? `第${rotationNumber}ローテ` 
    : rotationNumber);

  return (
    <span className={cn("font-sans font-black tracking-wider whitespace-nowrap flex items-center bg-black/40 px-3 py-1 rounded-lg border border-[#d4af37]/30", className)}>
      <span className="gold-gradient-text uppercase text-sm">{label}</span>
      {isCurrent && (
        <span className="text-[0.6em] bg-[#d4af37] text-black px-2 py-0.5 rounded font-bold ml-2 tracking-wider inline-flex items-center justify-center animate-pulse">
          現在
        </span>
      )}
    </span>
  );
}
