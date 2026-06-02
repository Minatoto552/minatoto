import React from 'react';
import { BookOpen, CheckCircle2, MessageSquare, Minus, Plus, ShieldAlert, ShoppingBag, Sparkles, Wine } from 'lucide-react';
import { cn } from '../../lib/utils';
import { TABLES, useMockApp } from '../../lib/MockAppContext';

const ORDER_CATEGORIES = ['通常カクテル', 'フード', 'キャストオリジナルカクテル', 'その他'] as const;

const normalizeCategory = (category: string) => {
  if (category.includes('フード')) return 'フード';
  if (category.includes('オリジナル')) return 'キャストオリジナルカクテル';
  if (category.includes('通常') || category.includes('カクテル')) return '通常カクテル';
  return 'その他';
};

export function CustomerOrderPage() {
  const { products, addOrder, currentUser } = useMockApp();
  const [cart, setCart] = React.useState<Record<string, number>>({});
  const [activeCategory, setActiveCategory] = React.useState<string>('通常カクテル');
  const [tableId, setTableId] = React.useState(currentUser?.assignedTableId || TABLES[0]);
  const [customerMemo, setCustomerMemo] = React.useState('');
  const [staffMemo, setStaffMemo] = React.useState('');
  const [customDrinkEnabled, setCustomDrinkEnabled] = React.useState(false);
  const [customDrink, setCustomDrink] = React.useState({ color1: '', color2: '', hasSoda: false, quantity: 1 });
  const [toast, setToast] = React.useState('');
  const [errorMsg, setErrorMsg] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const canCreateOrder = Boolean(
    currentUser &&
    (currentUser.role === 'admin' || currentUser.role === 'staff' || (currentUser.role === 'cast' && currentUser.canCreateOrder)),
  );
  const canViewRecipes = currentUser ? ['admin', 'staff', 'cast'].includes(currentUser.role) : false;

  const available = (products || []).filter(product => product.isAvailable && !product.isDeleted);
  const grouped = ORDER_CATEGORIES.reduce<Record<string, typeof available>>((acc, category) => {
    acc[category] = available.filter(product => normalizeCategory(product.category) === category);
    return acc;
  }, {});

  const visibleItems = grouped[activeCategory] || [];
  const totalItems = Object.values(cart).reduce((sum, quantity) => sum + quantity, 0) + (customDrinkEnabled ? customDrink.quantity : 0);
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

  const handleOrder = async () => {
    if (!currentUser || !canCreateOrder || totalItems === 0 || isSubmitting) return;
    setIsSubmitting(true);
    setErrorMsg('');
    setToast('');

    try {
      const productItems = Object.entries(cart)
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
        .filter(Boolean);

      const customItems = customDrinkEnabled ? [{
        id: `normal-${Date.now()}`,
        itemType: 'normal_cocktail' as const,
        productName: '通常ドリンク',
        priceSnapshot: 0,
        quantity: customDrink.quantity,
        color1: customDrink.color1,
        color2: customDrink.color2,
        hasSoda: customDrink.hasSoda,
      }] : [];

      await addOrder({
        tableId,
        creatorId: currentUser.id,
        castId: null,
        items: [...productItems, ...customItems],
        memo: [
          customerMemo ? `お客様: ${customerMemo}` : '',
          staffMemo ? `メモ: ${staffMemo}` : '',
        ].filter(Boolean).join('\n'),
        tableNameSnapshot: tableId,
      });

      setCart({});
      setCustomDrinkEnabled(false);
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
            お客様はメニュー閲覧のみ可能です。キャストの注文作成は管理者設定で許可された場合のみ利用できます。
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
              スタッフが卓番号を確認して注文を登録します。
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
        <button
          type="button"
          onClick={() => setCustomDrinkEnabled(value => !value)}
          className={cn(
            'flex min-h-[54px] w-full items-center justify-between rounded-2xl border px-4 text-left transition',
            customDrinkEnabled ? 'border-[#d4af37]/60 bg-[#d4af37]/12' : 'border-white/10 bg-white/[0.04]',
          )}
        >
          <span className="flex items-center gap-3">
            <Wine className="text-[#d4af37]" size={20} />
            <span>
              <span className="block text-sm font-bold text-white">通常ドリンクを追加</span>
              <span className="block text-xs text-gray-500">色・炭酸をスタッフが入力</span>
            </span>
          </span>
          <Sparkles className="text-[#d4af37]" size={18} />
        </button>

        {customDrinkEnabled && (
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <input
              value={customDrink.color1}
              onChange={event => setCustomDrink(value => ({ ...value, color1: event.target.value }))}
              placeholder="色1"
              className="min-h-[48px] rounded-2xl border border-white/10 bg-black/45 px-4 text-sm text-white outline-none focus:border-[#d4af37]"
            />
            <input
              value={customDrink.color2}
              onChange={event => setCustomDrink(value => ({ ...value, color2: event.target.value }))}
              placeholder="色2"
              className="min-h-[48px] rounded-2xl border border-white/10 bg-black/45 px-4 text-sm text-white outline-none focus:border-[#d4af37]"
            />
            <label className="flex min-h-[48px] items-center justify-center gap-2 rounded-2xl border border-white/10 bg-black/45 text-sm text-gray-300">
              <input
                type="checkbox"
                checked={customDrink.hasSoda}
                onChange={event => setCustomDrink(value => ({ ...value, hasSoda: event.target.checked }))}
              />
              炭酸
            </label>
            <input
              type="number"
              min={1}
              value={customDrink.quantity}
              onChange={event => setCustomDrink(value => ({ ...value, quantity: Math.max(1, Number(event.target.value) || 1) }))}
              className="min-h-[48px] rounded-2xl border border-white/10 bg-black/45 px-4 text-sm text-white outline-none focus:border-[#d4af37]"
            />
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
                {canViewRecipes && product.recipeText && (
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
