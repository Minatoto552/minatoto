import React from 'react';
import { useMockApp } from '../../lib/MockAppContext';
import { Star, Trophy, Coins } from 'lucide-react';
import { cn } from '../../lib/utils';

export function GuestPointPage() {
  const { customerStamps, currentUser } = useMockApp();

  const myStamps = (customerStamps || []).filter(s => s.customerMemberId === currentUser?.id);

  const getPointDelta = (points?: number, type?: string) => {
    if (typeof points === 'number') return points;
    return type === 'spend' ? -1 : 1;
  };

  const totalPoints = myStamps.reduce((sum, s) => sum + getPointDelta(s.points, s.type), 0);

  const history = myStamps
    .slice()
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 20);

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="text-center py-4">
        <h2 className="text-2xl font-lux text-white flex items-center justify-center gap-2">
          <Star className="text-[#d4af37]" />
          ポイント
        </h2>
      </div>

      {/* Points Card */}
      <div className="glass-panel rounded-2xl border border-[#d4af37]/30 p-6 text-center bg-gradient-to-b from-[#d4af37]/10 to-transparent shadow-[0_0_30px_rgba(212,175,55,0.1)]">
        <div className="text-5xl font-black text-[#d4af37] mb-1">{totalPoints}</div>
        <div className="text-xs text-gray-400 tracking-widest uppercase">Current Points</div>
        {currentUser && (
          <div className="mt-3 text-sm text-gray-300">{currentUser.displayName}</div>
        )}
      </div>

      {/* History */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold tracking-widest text-gray-400 uppercase">履歴</h3>
        {history.length === 0 ? (
          <div className="text-center py-8 text-gray-600 text-sm">ポイント履歴がありません</div>
        ) : (
          history.map((s, i) => (
            <div key={s.id || i} className="glass-panel p-3 rounded-xl border border-white/10 flex justify-between items-center">
              <div>
                <div className="text-sm text-white">
                  {s.reason === 'daily_grant' ? 'デイリーボーナス' :
                   s.reason === 'lottery_entry' ? '抽選応募' :
                   s.reason === 'admin_adjustment' ? '管理者調整' :
                   s.reason === 'chinchiro_bet' ? 'チンチロ賭け' :
                   s.reason === 'chinchiro_payout' ? 'チンチロ払い出し' :
                   s.type === 'grant' ? '付与' :
                   s.type === 'spend' ? '使用' : 'ポイント変動'}
                </div>
                <div className="text-xs text-gray-500 mt-0.5">
                  {new Date(s.createdAt).toLocaleDateString('ja-JP')}
                </div>
              </div>
              <div className={cn(
                "font-bold text-lg",
                getPointDelta(s.points, s.type) < 0 ? 'text-red-400' : 'text-[#d4af37]'
              )}>
                {getPointDelta(s.points, s.type) > 0 ? '+' : ''}{getPointDelta(s.points, s.type)}pt
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
