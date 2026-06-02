import React, { useState } from 'react';
import { useMockApp } from '../../lib/MockAppContext';
import { BookOpen, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '../../lib/utils';

export function RecipeListPage() {
  const { products } = useMockApp();
  const [expanded, setExpanded] = useState<string | null>(null);

  const recipeProduts = (products || []).filter(p => p.recipeText && !p.isDeleted);

  return (
    <div className="space-y-6 animate-in fade-in p-4">
      <div className="flex items-center gap-3 mb-2">
        <BookOpen className="text-[#d4af37]" size={24} />
        <h2 className="text-xl font-bold text-white tracking-wider">レシピ一覧</h2>
      </div>

      {recipeProduts.length === 0 ? (
        <div className="text-center py-16 text-gray-500 glass-panel rounded-2xl border border-white/10">
          <BookOpen size={40} className="mx-auto mb-3 text-gray-700" />
          <p>レシピが登録されていません</p>
        </div>
      ) : (
        <div className="space-y-3">
          {recipeProduts.map(p => (
            <div key={p.id} className="glass-panel rounded-xl border border-white/10 overflow-hidden">
              <button
                className="w-full p-4 flex justify-between items-center text-left hover:bg-white/5 transition"
                onClick={() => setExpanded(expanded === p.id ? null : p.id)}
              >
                <div>
                  <div className="font-bold text-white">{p.name}</div>
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
          ))}
        </div>
      )}
    </div>
  );
}
