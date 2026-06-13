import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useMockApp } from '../../lib/MockAppContext';
import { BookOpen, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '../../lib/utils';
import { canShowRecipeForProduct } from '../../lib/orderUtils';

export function RecipeListPage() {
  const { products } = useMockApp();
  const [searchParams] = useSearchParams();
  const [expanded, setExpanded] = useState<string | null>(null);
  const selectedProductId = searchParams.get('product');

  const recipeProducts = React.useMemo(
    () => (products || []).filter(p => canShowRecipeForProduct(p) && !p.isDeleted),
    [products],
  );

  React.useEffect(() => {
    if (selectedProductId && recipeProducts.some(product => product.id === selectedProductId)) {
      setExpanded(selectedProductId);
      window.setTimeout(() => {
        document.getElementById(`recipe-${selectedProductId}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 80);
    }
  }, [selectedProductId, recipeProducts]);

  return (
    <div className="space-y-6 animate-in fade-in p-4">
      <div className="flex items-center gap-3 mb-2">
        <BookOpen className="text-[#d4af37]" size={24} />
        <h2 className="text-xl font-bold text-white tracking-wider">レシピ一覧</h2>
      </div>

      {recipeProducts.length === 0 ? (
        <div className="text-center py-16 text-gray-500 glass-panel rounded-2xl border border-white/10">
          <BookOpen size={40} className="mx-auto mb-3 text-gray-700" />
          <p>レシピが登録されていません</p>
        </div>
      ) : (
        <div className="space-y-3">
          {recipeProducts.map(p => {
            const isSelected = selectedProductId === p.id;
            return (
            <div
              key={p.id}
              id={`recipe-${p.id}`}
              className={cn(
                'glass-panel rounded-xl border overflow-hidden scroll-mt-28',
                isSelected ? 'border-[#d4af37]/70 shadow-[0_0_34px_rgba(212,175,55,0.16)]' : 'border-white/10',
              )}
            >
              <button
                className="w-full p-4 flex justify-between items-center text-left hover:bg-white/5 transition"
                onClick={() => setExpanded(expanded === p.id ? null : p.id)}
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-white">{p.name}</span>
                    {isSelected && (
                      <span className="rounded-full border border-[#d4af37]/40 bg-[#d4af37]/12 px-2 py-0.5 text-[10px] font-black text-[#f8e7a2]">
                        注文から表示中
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">{p.category}</div>
                </div>
                {expanded === p.id
                  ? <ChevronUp size={18} className="text-gray-400 shrink-0" />
                  : <ChevronDown size={18} className="text-gray-400 shrink-0" />
                }
              </button>
              {expanded === p.id && (
                <div className="px-4 pb-4 border-t border-white/10">
                  <pre className="text-sm text-gray-300 whitespace-pre-wrap mt-3 font-sans leading-relaxed">
                    {p.recipeText}
                  </pre>
                  {p.notes && (
                    <div className="mt-3 text-xs text-gray-500 border-t border-white/5 pt-3">
                      <span className="font-bold text-gray-400">備考: </span>{p.notes}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
          })}
        </div>
      )}
    </div>
  );
}
