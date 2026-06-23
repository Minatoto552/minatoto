import type { OrderItem, Product } from './VrcBarAppContext';

export const NORMAL_COCKTAIL_COLORS = [
  { value: '赤', label: '赤', className: 'border-red-400/60 bg-red-500/18 text-red-100 shadow-[0_0_20px_rgba(239,68,68,0.18)]' },
  { value: '青', label: '青', className: 'border-sky-300/60 bg-sky-500/18 text-sky-100 shadow-[0_0_20px_rgba(14,165,233,0.18)]' },
  { value: '緑', label: '緑', className: 'border-emerald-300/60 bg-emerald-500/18 text-emerald-100 shadow-[0_0_20px_rgba(16,185,129,0.18)]' },
  { value: '白', label: '白', className: 'border-white/70 bg-white/18 text-white shadow-[0_0_20px_rgba(255,255,255,0.12)]' },
  { value: '黒', label: '黒', className: 'border-zinc-400/60 bg-zinc-950/80 text-zinc-100 shadow-[0_0_20px_rgba(0,0,0,0.35)]' },
] as const;

export type NormalCocktailColor = (typeof NORMAL_COCKTAIL_COLORS)[number]['value'];

export const NORMAL_COCKTAIL_COLOR_VALUES = NORMAL_COCKTAIL_COLORS.map(color => color.value);

export const canShowRecipeForProduct = (product?: Pick<Product, 'category' | 'recipeText'> | null) => {
  return Boolean(product?.recipeText?.trim());
};

export const formatNormalCocktailOptions = (item: Pick<OrderItem, 'color1' | 'color2' | 'hasSoda'>) => {
  const colors = [item.color1, item.color2].filter(Boolean).join(' x ');
  const soda = item.hasSoda ? '炭酸あり' : '炭酸なし';
  return [colors || '色未指定', soda].join(' / ');
};

export const formatOrderItemTitle = (item: OrderItem) => {
  if (item.itemType === 'normal_cocktail') {
    return `通常カクテル（${formatNormalCocktailOptions(item)}）`;
  }
  return item.productName || '商品名未設定';
};

export const formatOrderItemLine = (item: OrderItem) => {
  return `${formatOrderItemTitle(item)} x${item.quantity}`;
};
