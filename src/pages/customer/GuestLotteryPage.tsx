import React from 'react';
import { Gift, Sparkles, Ticket, Trophy } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useMockApp } from '../../lib/MockAppContext';

export function GuestLotteryPage() {
  const { lotteryItems, lotteryEntries, currentUser, enterLottery, customerStamps } = useMockApp();
  const [message, setMessage] = React.useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const openItems = (lotteryItems || []).filter(item => item.status === 'open' && !item.isDeleted);
  const myPoints = (customerStamps || [])
    .filter(stamp => stamp.customerMemberId === currentUser?.id)
    .reduce((sum, stamp) => sum + (stamp.points ?? (stamp.type === 'spend' ? -1 : 1)), 0);
  const myEntries = new Set((lotteryEntries || [])
    .filter(entry => entry.customerMemberId === currentUser?.id)
    .map(entry => entry.lotteryItemId));
  const myResultEntries = (lotteryEntries || [])
    .filter(entry => entry.customerMemberId === currentUser?.id && entry.status !== 'entered');

  const handleEnter = async (itemId: string) => {
    try {
      await enterLottery(itemId);
      setMessage({ type: 'success', text: '抽選に応募しました。結果発表をお待ちください。' });
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : '応募に失敗しました。' });
    }
  };

  return (
    <div className="app-home-space animate-in fade-in">
      <section className="casino-hero relative overflow-hidden p-5">
        <div className="relative z-10 flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.34em] text-[#d4af37]">Premium Lottery</p>
            <h1 className="mt-2 text-3xl font-black text-white">抽選</h1>
            <p className="mt-2 text-sm leading-6 text-gray-300">
              ポイントで応募できるプレミアム抽選です。
            </p>
          </div>
          <div className="casino-roulette">
            <Ticket size={28} />
          </div>
        </div>
        <div className="relative z-10 mt-5 grid grid-cols-2 gap-2">
          <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-3">
            <p className="text-[10px] tracking-widest text-gray-500">POINT</p>
            <p className="mt-1 text-lg font-black text-[#d4af37]">{myPoints}pt</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-3">
            <p className="text-[10px] tracking-widest text-gray-500">OPEN</p>
            <p className="mt-1 text-lg font-black text-fuchsia-300">{openItems.length}件</p>
          </div>
        </div>
      </section>

      {message && (
        <div className={cn(
          'iphone-card p-4 text-center text-sm font-bold',
          message.type === 'success' ? 'border-green-500/40 bg-green-900/20 text-green-300' : 'border-red-500/40 bg-red-900/20 text-red-300',
        )}>
          {message.text}
        </div>
      )}

      {myResultEntries.length > 0 && (
        <section className="casino-panel p-5 space-y-3">
          <h2 className="text-sm font-bold tracking-widest text-[#d4af37]">あなたの抽選結果</h2>
          {myResultEntries.map(entry => {
            const item = lotteryItems.find(lotteryItem => lotteryItem.id === entry.lotteryItemId);
            return (
              <div
                key={entry.id}
                className={cn(
                  'flex items-center justify-between gap-3 rounded-3xl border p-4',
                  entry.status === 'won' ? 'border-[#d4af37]/40 bg-[#d4af37]/10 casino-win-glow' : 'border-white/10 bg-black/40',
                )}
              >
                <span className="flex min-w-0 items-center gap-2 text-sm text-white">
                  {entry.status === 'won' ? <Trophy size={16} className="shrink-0 text-[#d4af37]" /> : <Sparkles size={16} className="shrink-0 text-gray-500" />}
                  <span className="truncate">{item?.title || '抽選'}</span>
                </span>
                <span className={cn(
                  'rounded-full border px-3 py-1 text-xs font-black',
                  entry.status === 'won'
                    ? 'border-[#d4af37]/40 bg-[#d4af37]/20 text-[#d4af37]'
                    : 'border-white/10 bg-gray-800 text-gray-400',
                )}>
                  {entry.status === 'won' ? '当選' : '落選'}
                </span>
              </div>
            );
          })}
        </section>
      )}

      {openItems.length === 0 ? (
        <div className="iphone-card py-16 text-center text-gray-500">
          <Gift size={40} className="mx-auto mb-3 text-gray-700" />
          <p>現在開催中の抽選はありません。</p>
        </div>
      ) : (
        <div className="space-y-4">
          {openItems.map(item => {
            const hasEntered = myEntries.has(item.id);
            const requiredPoints = item.requiredPoints ?? 0;
            const canEnter = !hasEntered && requiredPoints <= myPoints;
            return (
              <div key={item.id} className="casino-panel p-5 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="truncate text-lg font-black text-white">{item.title}</h3>
                    <p className="mt-1 line-clamp-2 text-xs leading-5 text-gray-400">{item.description}</p>
                  </div>
                  <span className="status-pill status-pill-gold">{requiredPoints}pt</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="min-w-0 truncate text-sm text-gray-300">景品: {item.prizeName}</span>
                  <button
                    disabled={hasEntered || !canEnter}
                    onClick={() => handleEnter(item.id)}
                    className={cn(
                      'min-h-[46px] rounded-2xl px-4 text-xs font-black tracking-widest transition',
                      hasEntered ? 'bg-gray-700 text-gray-400 cursor-not-allowed' :
                      canEnter ? 'casino-roll-button' :
                      'bg-gray-800 text-gray-500 cursor-not-allowed',
                    )}
                  >
                    {hasEntered ? '応募済み' : canEnter ? '応募する' : 'ポイント不足'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
