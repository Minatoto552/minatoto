import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Info, Sparkles, AlertCircle, Clock, Book } from 'lucide-react';
import { Product, useMockApp } from '../../lib/MockAppContext';
import { formatDateTime } from '../../lib/utils';

interface RecipeDetailOverlayProps {
  product: Product | null;
  onClose: () => void;
}

export function RecipeDetailOverlay({ product, onClose }: RecipeDetailOverlayProps) {
  const { users } = useMockApp();
  
  if (!product) return null;

  const cast = users.find(u => u.id === product.castId);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/90 backdrop-blur-md"
        />
        
        <motion.div 
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="relative w-full max-w-2xl max-h-[90vh] bg-[#111] border border-[#d4af37]/30 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(212,175,55,0.2)] flex flex-col"
        >
          {/* Header Image */}
          <div className="relative h-48 sm:h-64 flex-shrink-0">
            <img 
              src={product.imageUrl || 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=800&q=80'} 
              alt={product.name} 
              className="w-full h-full object-cover" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#111] via-transparent to-transparent"></div>
            <button 
              onClick={onClose} 
              className="absolute top-4 right-4 text-white bg-black/50 p-2 rounded-full hover:bg-black/80 transition"
            >
              <X size={24} />
            </button>
          </div>

          <div className="p-6 sm:p-8 overflow-y-auto custom-scrollbar space-y-8">
            {/* Title Section */}
            <div className="border-b border-white/10 pb-6">
              <h3 className="text-3xl font-lux gold-gradient-text uppercase tracking-widest leading-loose">{product.name}</h3>
              <div className="flex flex-wrap items-center gap-3 mt-2">
                <span className="text-[10px] text-gray-400 uppercase tracking-[0.2em]">{product.category}</span>
                {cast && (
                  <>
                    <span className="w-1 h-1 bg-gray-700 rounded-full"></span>
                    <span className="text-xs text-[#d4af37] font-bold">By {cast.displayName}</span>
                  </>
                )}
                {product.updatedAt && (
                   <>
                    <span className="w-1 h-1 bg-gray-700 rounded-full"></span>
                    <div className="flex items-center gap-1 text-[10px] text-gray-500 uppercase tracking-widest">
                      <Clock size={10} />
                      {formatDateTime(product.updatedAt)}
                    </div>
                   </>
                )}
              </div>
            </div>

            {/* Description */}
            {product.description && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-gray-400">
                  <Info size={16} />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em]">Description</span>
                </div>
                <p className="text-sm text-gray-300 leading-relaxed italic">
                  {product.description}
                </p>
              </div>
            )}

            {/* Recommendation */}
            {product.recommendationText && (
               <div className="bg-[#d4af37]/5 border border-[#d4af37]/20 p-4 rounded-xl space-y-1">
                  <div className="flex items-center gap-2 text-[#d4af37]">
                    <Sparkles size={14} />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Recommended Point</span>
                  </div>
                  <p className="text-xs text-gray-300">
                    {product.recommendationText}
                  </p>
               </div>
            )}

            {/* Recipe Content */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-[#d4af37]">
                <Book size={18} />
                <span className="text-xs font-black uppercase tracking-[0.3em]">Recipe / Preparation</span>
              </div>
              <div className="bg-black/60 p-6 rounded-2xl border border-[#d4af37]/10 text-gray-200 whitespace-pre-wrap leading-relaxed font-mono shadow-inner">
                {product.recipeText || 'レシピ情報はありません'}
              </div>
            </div>

            {/* Notes */}
            {product.notes && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-red-400/70">
                  <AlertCircle size={16} />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em]">Caution / Notes</span>
                </div>
                <div className="text-xs text-gray-500 bg-white/5 p-4 rounded-xl border border-white/5">
                  {product.notes}
                </div>
              </div>
            )}

            <button 
              onClick={onClose} 
              className="w-full bg-[#d4af37] text-black py-4 rounded-xl text-sm transition font-black uppercase tracking-widest shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:brightness-110 active:scale-95"
            >
              Close recipe
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
