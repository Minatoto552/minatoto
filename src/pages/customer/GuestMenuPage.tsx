import React from 'react';
import { useVrcBarApp } from '../../lib/VrcBarAppContext';
import { BookOpen, MessageCircle, Wine } from 'lucide-react';
import { cn } from '../../lib/utils';

export function GuestMenuPage() {
  const { products } = useVrcBarApp();

  const available = (products || []).filter(p => p.isAvailable && !p.isDeleted);
  const byCategory: Record<string, typeof available> = {};
  for (const p of available) {
    const cat = p.category || 'その他';
    if (!byCategory[cat]) byCategory[cat] = [];
    byCategory[cat].push(p);
  }

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="text-center py-4">
        <h2 className="text-2xl font-lux text-white flex items-center justify-center gap-2">
          <BookOpen className="text-[#d4af37]" />
          MENU
        </h2>
        <p className="text-gray-400 text-xs mt-2 tracking-widest">ドリンク & フードメニュー</p>
        <div className="iphone-card mt-4 p-4 text-left">
          <div className="flex items-start gap-3">
            <div className="metric-icon metric-icon-gold shrink-0">
              <MessageCircle size={18} />
            </div>
            <div>
              <p className="text-sm font-bold text-white">ご注文はスタッフにお声がけください</p>
              <p className="mt-1 text-xs leading-5 text-gray-400">
                お客様画面からの注文送信はできません。メニューを見ながら、スタッフが卓番号を確認して注文登録します。
              </p>
            </div>
          </div>
        </div>
      </div>

      {Object.entries(byCategory).map(([cat, items]) => (
        <div key={cat} className="space-y-3">
          <h3 className="text-xs font-bold tracking-widest text-[#d4af37] uppercase border-b border-[#d4af37]/20 pb-2">{cat}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {items.map(p => (
              <div key={p.id} className="iphone-card overflow-hidden flex gap-3 p-3">
                {p.imageUrl ? (
                  <img src={p.imageUrl} alt={p.name} className="w-20 h-20 object-cover rounded-lg shrink-0" loading="lazy" />
                ) : (
                  <div className="w-20 h-20 bg-gray-900 rounded-lg flex items-center justify-center shrink-0">
                    <Wine size={24} className="text-[#d4af37]/30" />
                  </div>
                )}
                <div className="flex flex-col justify-center min-w-0">
                  <div className="font-bold text-white text-sm truncate">{p.name}</div>
                  {p.description && <div className="text-xs text-gray-400 mt-1 line-clamp-2">{p.description}</div>}
                  {p.isRecommended && (
                    <span className="mt-1 text-[10px] bg-[#d4af37]/20 text-[#d4af37] px-2 py-0.5 rounded-full w-fit border border-[#d4af37]/30">おすすめ</span>
                  )}
                  <span className="mt-2 text-[10px] text-gray-500">注文はスタッフへ</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {available.length === 0 && (
        <div className="text-center py-12 text-gray-500">メニューを読み込み中...</div>
      )}
    </div>
  );
}
