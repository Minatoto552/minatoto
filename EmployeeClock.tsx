import React, { useState, useEffect } from 'react';

export function EmployeeClock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex items-center gap-2 text-[#d4af37] font-mono font-bold text-sm bg-black/50 border border-[#d4af37]/30 px-3 py-1 rounded-full whitespace-nowrap shadow-[0_0_10px_rgba(212,175,55,0.1)]">
      <span>{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
    </div>
  );
}
