import React from 'react';
import { BookOpen, CheckCircle2, MessageSquare, Minus, Palette, Plus, ShieldAlert, ShoppingBag, Sparkles, Trash2, Wine } from 'lucide-react';
import { cn } from '../../lib/utils';
import { TABLES, useMockApp, type OrderItem } from '../../lib/MockAppContext';
import {
  NORMAL_COCKTAIL_COLORS,
  NORMAL_COCKTAIL_COLOR_VALUES,
  type NormalCocktailColor,
  canShowRecipeForProduct,
  formatNormalCocktailOptions,
} from '../../lib/orderUtils';

const ORDER_CATEGORIES = ['通常カクテル', 'フード', 'キャストオリジナルカクテル', 'その他'] as const;

const normalizeCategory = (category: string) => {
  if (category.includes('フード')) return 'フード';
  if (category.includes('オリジナル')) return 'キャストオリジナルカクテル';
  if (category.includes('通常') || category.includes('カクテル')) return '通常カクテル';
  return 'その他';
};

type NormalCocktailDraft = {
  id: string;
  color1: NormalCocktailColor | '';
  color2: NormalCocktailColor | '';
  hasSoda: boolean;
  quantity: number;
};

const createNormalCocktailDraft = (): NormalCocktailDraft => ({
  id: `normal-${Date.now()}`,
  color1: '',
  color2: '',
  hasSoda: false,
  quantity: 1,
});

const normalizeColorPair = (colors: NormalCocktailColor[]) => {
  return [...colors].sort((a, b) => NORMAL_COCKTAIL_COLOR_VALUES.indexOf(a) - NORMAL_COCKTAIL_COLOR_VALUES.indexOf(b));
};

export function CustomerOrderPage() {
  const { products, addOrder, currentUser } = useMockApp();
  const [cart, setCart] = React.useState<Record<string, number>>({});
  const [activeCategory, setActiveCategory] = React.useState<string>('通常カクテル');
  const [tableId, setTableId] = React.useState(currentUser?.assignedTableId || TABLES[0]);
  const [customerMemo, setCustomerMemo] = React.useState('');
  const [staffMemo, setStaffMemo] = React.useState('');
  const [normalCocktailDraft, setNormalCocktailDraft] = React.useState<NormalCocktailDraft>(() => createNormalCocktailDraft());
  const [normalCocktails, setNormalCocktails] = React.useState<NormalCocktailDraft[]>([]);
  const [toast, setToast] = React.useState('');
  const [errorMsg, setErrorMsg] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const canCreateOrder = Boolean(
    currentUser &&
    (currentUser.role === 'admin' || currentUser.role === 'staff' || currentUser.role === 'cast'),
  );
  const canViewRecipes = currentUser ? ['admin', 'staff', 'cast'].includes(currentUser.role) : false;

  const available = (products || []).filter(product => product.isAvailable && !product.isDeleted);
  const grouped = ORDER_CATEGORIES.reduce<Record<string, typeof available>>((acc, category) => {
    acc[category] = available.filter(product => normalizeCategory(product.category) === category);
    return acc;
  }, {});

  const visibleItems = grouped[activeCategory] || [];
  const totalItems = Object.values(cart).reduce((sum, quantity) => sum + quantity, 0)
    + normalCocktails.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = Object.entries(cart).reduce((sum, [productId, quantity]) => {
    const product = available.find(item => item.id === productId);
    return sum + ((product?.price || 0) * quantity);
  }, 0);

  const addToCart = (id: string) => setCart(current => ({ ...current, [id]: (current[id] || 0) + 1 }));
  const removeFromCart = (id: string) => setCart(current => {
    const next = { ...current };
    if ((next[id] || 0) <= 1) delete next[id];
    else next[id] -= 1;
    return next;
  });

  const selectedDraftColors = [normalCocktailDraft.color1, normalCocktailDraft.color2]
    .filter(Boolean) as NormalCocktailColor[];

  const toggleDraftColor = (color: NormalCocktailColor) => {
    setNormalCocktailDraft(current => {
      const selected = [current.color1, current.color2].filter(Boolean) as NormalCocktailColor[];
      const next = selected.includes(color)
        ? selected.filter(value => value !== color)
        : selected.length < 2
          ? [...selected, color]
          : [selected[1], color];
      return {
        ...current,
        color1: next[0] || '',
        color2: next[1] || '',
      };
    });
  };

  const addNormalCocktail = () => {
    const selected = normalizeColorPair(selectedDraftColors);
    if (selected.length !== 2) {
      setErrorMsg('通常カクテルは赤・青・緑・白・黒から2色を選択してください。');
      setTimeout(() => setErrorMsg(''), 3000);
      return;
    }

    const normalizedDraft: NormalCocktailDraft = {
      ...normalCocktailDraft,
      id: `normal-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      color1: selected[0],
      color2: selected[1],
      quantity: Math.max(1, normalCocktailDraft.quantity || 1),
    };
    const signature = `${normalizedDraft.color1}-${normalizedDraft.color2}-${normalizedDraft.hasSoda}`;

    setNormalCocktails(current => {
      const existing = current.find(item => `${item.color1}-${item.color2}-${item.hasSoda}` === signature);
      if (!existing) return [...current, normalizedDraft];
      return current.map(item => item.id === existing.id ? { ...item, quantity: item.quantity + normalizedDraft.quantity } : item);
    });
    setNormalCocktailDraft(createNormalCocktailDraft());
  };

  const updateNormalCocktailQuantity = (id: string, delta: number) => {
    setNormalCocktails(current => current
      .map(item => item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item)
      .filter(item => item.quantity > 0));
  };

  const removeNormalCocktail = (id: string) => {
    setNormalCocktails(current => current.filter(item => item.id !== id));
  };

  const handleOrder = async () => {
    if (!currentUser || !canCreateOrder || totalItems === 0 || isSubmitting) return;
    setIsSubmitting(true);
    setErrorMsg('');
    setToast('');

    try {
      const productItems: OrderItem[] = Object.entries(cart)
        .map(([productId, quantity]) => {
          const product = available.find(item => item.id === productId);
          if (!product) return null;
          return {
            id: productId,
            itemType: 'product' as const,
            productId,
            productName: product.name,
            priceSnapshot: product.price,
            quantity,
          };
        })
        .filter((item): item is OrderItem => item !== null);

      const customItems: OrderItem[] = normalCocktails.map(item => ({
        id: item.id,
        itemType: 'normal_cocktail' as const,
        productName: `通常カクテル（${formatNormalCocktailOptions(item)}）`,
        priceSnapshot: 0,
        quantity: item.quantity,
        color1: item.color1,
        color2: item.color2,
        hasSoda: item.hasSoda,
      }));

      await addOrder({
        tableId,
        creatorId: currentUser.id,
        castId: null,
        items: [...productItems, ...customItems],
        memo: [
          customerMemo ? `お客様: ${customerMemo}` : '',
          staffMemo ? `メモ: ${staffMemo}` : '',
        ].filter(Boolean).join('\n'),
      });

      setCart({});
      setNormalCocktails([]);
      setNormalCocktailDraft(createNormalCocktailDraft());
      setCustomerMemo('');
      setStaffMemo('');
      setToast('注文を登録しました。注文管理に反映されています。');
      setTimeout(() => setToast(''), 3000);
    } catch (error) {
      setErrorMsg(error instanceof Error ? error.message : '注文登録に失敗しました。');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!canCreateOrder) {
    return (
      <div className="app-home-space">
        <div className="iphone-card p-6 text-center">
          <ShieldAlert className="mx-auto mb-4 text-red-300" size={42} />
          <h2 className="text-xl font-black text-white">注文作成権限がありません</h2>
          <p className="mt-3 text-sm leading-6 text-gray-400">
            お客様はメニュー閲覧のみ可能です。注文登録はスタッフ・キャスト・管理者が行います。
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-home-space animate-in fade-in">
      <section className="iphone-card relative overflow-hidden p-5">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#d4af37]/80 to-transparent" />
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.3em] text-[#d4af37]">Order Register</p>
            <h1 className="mt-2 text-2xl font-black text-white">注文登録</h1>
            <p className="mt-2 text-sm leading-6 text-gray-400">
              スタッフ・キャストが卓番号と内容を確認して注文を登録します。
            </p>
          </div>
          <div className="home-hero-icon">
            <ShoppingBag size={24} />
          </div>
        </div>
      </section>

      {toast && (
        <div className="iphone-card border-emerald-400/30 bg-emerald-500/10 p-4 text-sm font-bold text-emerald-200">
          <CheckCircle2 className="mr-2 inline" size={18} />
          {toast}
        </div>
      )}
      {errorMsg && (
        <div className="iphone-card neon-alert bg-red-500/10 p-4 text-sm font-bold text-red-200">
          {errorMsg}
        </div>
      )}

      <section className="iphone-card p-4 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className="space-y-2">
            <span className="text-xs font-bold text-gray-400">卓番号</span>
            <select
              value={tableId}
              onChange={event => setTableId(event.target.value)}
              className="min-h-[50px] w-full rounded-2xl border border-white/10 bg-black/45 px-4 text-base font-bold text-white outline-none focus:border-[#d4af37]"
            >
              {TABLES.map(table => <option key={table} value={table}>{table} 卓</option>)}
            </select>
          </label>
          <label className="space-y-2">
            <span className="text-xs font-bold text-gray-400">お客様名メモ</span>
            <input
              value={customerMemo}
              onChange={event => setCustomerMemo(event.target.value)}
              placeholder="任意"
              className="min-h-[50px] w-full rounded-2xl border border-white/10 bg-black/45 px-4 text-base text-white outline-none focus:border-[#d4af37]"
            />
          </label>
        </div>
        <label className="space-y-2 block">
          <span className="text-xs font-bold text-gray-400">スタッフメモ</span>
          <textarea
            value={staffMemo}
            onChange={event => setStaffMemo(event.target.value)}
            placeholder="氷少なめ、後で提供など"
            className="min-h-[88px] w-full rounded-2xl border border-white/10 bg-black/45 p-4 text-sm text-white outline-none focus:border-[#d4af37]"
          />
        </label>
      </section>

      <section className="iphone-card p-4 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Palette className="text-[#d4af37]" size={19} />
              <h3 className="text-sm font-black text-white">普通カクテル</h3>
            </div>
            <p className="mt-1 text-xs leading-5 text-gray-500">
              赤・青・緑・白・黒から2色選択。別の組み合わせは別行で追加できます。
            </p>
          </div>
          <span className="rounded-full border border-[#d4af37]/35 bg-[#d4af37]/10 px-3 py-1 text-[11px] font-black text-[#f8e7a2]">
            {normalCocktails.length} 種
          </span>
        </div>

        <div className="grid grid-cols-5 gap-2">
          {NORMAL_COCKTAIL_COLORS.map(color => {
            const isSelected = selectedDraftColors.includes(color.value);
            return (
              <button
                key={color.value}
                type="button"
                onClick={() => toggleDraftColor(color.value)}
                className={cn(
                  'min-h-[48px] rounded-2xl border text-sm font-black transition',
                  isSelected ? color.className : 'border-white/10 bg-white/[0.04] text-gray-500 hover:text-white',
                )}
              >
                {color.label}
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_120px_140px]">
          <label className="flex min-h-[52px] items-center justify-between rounded-2xl border border-white/10 bg-black/45 px-4 text-sm text-gray-300">
            <span className="font-bold">炭酸</span>
            <input
              type="checkbox"
              checked={normalCocktailDraft.hasSoda}
              onChange={event => setNormalCocktailDraft(value => ({ ...value, hasSoda: event.target.checked }))}
              className="h-5 w-5 accent-[#d4af37]"
            />
          </label>
          <label className="min-h-[52px] rounded-2xl border border-white/10 bg-black/45 px-4 py-2">
            <span className="block text-[10px] font-bold text-gray-500">数量</span>
            <input
              type="number"
              min={1}
              value={normalCocktailDraft.quantity}
              onChange={event => setNormalCocktailDraft(value => ({ ...value, quantity: Math.max(1, Number(event.target.value) || 1) }))}
              className="w-full bg-transparent text-base font-black text-white outline-none"
            />
          </label>
          <button
            type="button"
            onClick={addNormalCocktail}
            className="btn-gold flex min-h-[52px] items-center justify-center gap-2 rounded-2xl text-sm font-black"
          >
            <Plus size={17} />
            追加
          </button>
        </div>

        {normalCocktails.length > 0 && (
          <div className="space-y-2 border-t border-white/10 pt-4">
            {normalCocktails.map(item => (
              <div key={item.id} className="flex items-center gap-3 rounded-2xl border border-[#d4af37]/25 bg-[#d4af37]/8 p-3">
                <Sparkles className="shrink-0 text-[#d4af37]" size={18} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-black text-white">{formatNormalCocktailOptions(item)}</p>
                  <p className="text-[11px] text-gray-500">普通カクテル</p>
                </div>
                <div className="flex items-center gap-1">
                  <button type="button" onClick={() => updateNormalCocktailQuantity(item.id, -1)} className="flex h-9 w-9 items-center justify-center rounded-2xl border border-white/10 bg-black/40 text-white">
                    <Minus size={15} />
                  </button>
                  <span className="min-w-8 text-center text-sm font-black text-white">{item.quantity}</span>
                  <button type="button" onClick={() => updateNormalCocktailQuantity(item.id, 1)} className="flex h-9 w-9 items-center justify-center rounded-2xl border border-white/10 bg-black/40 text-white">
                    <Plus size={15} />
                  </button>
                  <button type="button" onClick={() => removeNormalCocktail(item.id)} className="ml-1 flex h-9 w-9 items-center justify-center rounded-2xl border border-red-400/20 bg-red-500/10 text-red-300">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {ORDER_CATEGORIES.map(category => (
          <button
            key={category}
            type="button"
            onClick={() => setActiveCategory(category)}
            className={cn(
              'min-h-[44px] min-w-max rounded-2xl border px-4 text-xs font-black transition',
              activeCategory === category
                ? 'border-[#d4af37] bg-[#d4af37]/18 text-[#f8e7a2]'
                : 'border-white/10 bg-white/[0.04] text-gray-500',
            )}
          >
            {category}
            <span className="ml-2 opacity-60">{grouped[category]?.length || 0}</span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {visibleItems.map(product => {
          const quantity = cart[product.id] || 0;
          return (
            <div
              key={product.id}
              className={cn('iphone-card p-3 flex gap-3', quantity > 0 && 'ring-1 ring-[#d4af37]/60')}
            >
              {product.imageUrl ? (
                <img src={product.imageUrl} alt="" className="h-20 w-20 shrink-0 rounded-2xl object-cover" loading="lazy" />
              ) : (
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-white/[0.04]">
                  <Wine size={26} className="text-[#d4af37]/40" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-white">{product.name}</p>
                <p className="mt-1 truncate text-xs text-gray-500">{product.category}</p>
                <p className="mt-1 text-sm font-black text-[#d4af37]">{product.price.toLocaleString()} pt</p>
                {canViewRecipes && canShowRecipeForProduct(product) && (
                  <details className="mt-2 text-xs text-gray-300">
                    <summary className="inline-flex cursor-pointer items-center gap-1 text-[#d4af37]">
                      <BookOpen size={12} /> レシピ
                    </summary>
                    <pre className="mt-2 whitespace-pre-wrap rounded-2xl border border-white/10 bg-black/50 p-3 font-sans leading-relaxed">
                      {product.recipeText}
                    </pre>
                  </details>
                )}
              </div>
              <div className="flex shrink-0 flex-col items-center justify-center gap-2">
                <button onClick={() => addToCart(product.id)} className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#d4af37] text-black">
                  <Plus size={18} />
                </button>
                {quantity > 0 && (
                  <>
                    <span className="text-base font-black text-white">{quantity}</span>
                    <button onClick={() => removeFromCart(product.id)} className="flex h-9 w-9 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-white">
                      <Minus size={16} />
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {visibleItems.length === 0 && (
        <div className="iphone-card p-8 text-center text-sm text-gray-500">
          このカテゴリの商品はまだ登録されていません。
        </div>
      )}

      <div className="sticky bottom-28 z-20">
        <button
          onClick={handleOrder}
          disabled={isSubmitting || totalItems === 0}
          className="btn-gold flex w-full items-center justify-center gap-3 rounded-[24px] py-4 text-sm font-black tracking-widest disabled:cursor-not-allowed disabled:opacity-50"
        >
          <MessageSquare size={18} />
          {isSubmitting ? '登録中...' : `${totalItems}点 / ${totalAmount.toLocaleString()} pt 登録`}
        </button>
      </div>
    </div>
  );
}
