import React from 'react';
import { useMockApp, type OrderItem } from '../../lib/MockAppContext';
import { BookOpen, Crown, Dice1, Dice2, Dice3, Dice4, Dice5, Dice6, LayoutDashboard, ShoppingBag, Users, AlertTriangle, Star, Sparkles, X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Link } from 'react-router-dom';
import { formatOrderItemTitle } from '../../lib/orderUtils';

export function StaffDashboardPage() {
  const { orders, users, products, emergencyCalls, currentUser, updateOrderStatus, gameSessions, rollEmployeeChinchiro } = useMockApp();
  const [statusFilter, setStatusFilter] = React.useState<'active' | 'pending' | 'processing' | 'completed' | 'delivered' | 'all'>('active');
  const [rollingGameId, setRollingGameId] = React.useState<string | null>(null);
  const [recipePreview, setRecipePreview] = React.useState<{
    title: string;
    category?: string;
    recipeText: string;
    notes?: string;
    recommendationText?: string;
  } | null>(null);

  const pendingOrders = (orders || []).filter(o => !o.isDeleted && o.status === 'pending');
  const processingOrders = (orders || []).filter(o => !o.isDeleted && o.status === 'processing');
  const activeEmergencies = (emergencyCalls || []).filter(c => c.status === 'active');
  const staffUsers = (users || []).filter(u => u.approvalStatus === 'approved' && !u.isDeleted);
  const pendingGames = (gameSessions || []).filter(game =>
    game.status === 'employee_pending' && (game.employeeUserId === currentUser?.id || currentUser?.role === 'admin')
  );

  const stats = [
    { label: '未対応注文', value: pendingOrders.length, color: pendingOrders.length > 0 ? 'text-red-400' : 'text-gray-300', icon: ShoppingBag },
    { label: '対応中注文', value: processingOrders.length, color: 'text-yellow-400', icon: ShoppingBag },
    { label: '緊急ヘルプ', value: activeEmergencies.length, color: activeEmergencies.length > 0 ? 'text-red-500' : 'text-gray-300', icon: AlertTriangle },
    { label: '対戦待ち', value: pendingGames.length, color: pendingGames.length > 0 ? 'text-[#d4af37]' : 'text-gray-300', icon: Star },
    { label: 'スタッフ数', value: staffUsers.length, color: 'text-blue-400', icon: Users },
  ];

  const recentOrders = (orders || [])
    .filter(o => !o.isDeleted)
    .filter(o => {
      if (statusFilter === 'all') return true;
      if (statusFilter === 'active') return o.status === 'pending' || o.status === 'processing';
      return o.status === statusFilter;
    })
    .slice(0, 40);

  const handleRollEmployee = async (gameId: string) => {
    setRollingGameId(gameId);
    try {
      await rollEmployeeChinchiro(gameId);
    } finally {
      setTimeout(() => setRollingGameId(null), 900);
    }
  };

  const resolveProductForItem = (item: OrderItem) => {
    if (item.productId) {
      const productById = (products || []).find(product => product.id === item.productId);
      if (productById) return productById;
    }
    const itemName = (item.productName || '').trim();
    if (!itemName) return null;
    return (products || []).find(product => product.name.trim() === itemName) || null;
  };

  const resolveRecipeForItem = (item: OrderItem) => {
    const product = resolveProductForItem(item);
    const recipeText = (product?.recipeText || item.recipeTextSnapshot || '').trim();
    if (!recipeText) return null;

    return {
      title: product?.name || item.productName,
      category: product?.category || item.categorySnapshot,
      recipeText,
      notes: product?.notes || item.notesSnapshot,
      recommendationText: product?.recommendationText || item.recommendationTextSnapshot,
    };
  };

  return (
    <div className="space-y-6 animate-in fade-in p-1 sm:p-4">
      <div className="iphone-card p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="metric-icon metric-icon-gold">
              <LayoutDashboard size={20} />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.28em] text-[#d4af37]">Staff Console</p>
              <h2 className="mt-1 text-xl font-black text-white tracking-wide">注文管理</h2>
            </div>
          </div>
          <Link to="/app/order" className="btn-gold inline-flex min-h-[48px] items-center gap-2 rounded-2xl px-4 text-sm font-black">
            <ShoppingBag size={18} />
            注文登録
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {stats.map(s => (
          <div key={s.label} className="glass-panel rounded-xl border border-white/10 p-4 text-center">
            <s.icon size={20} className={cn("mx-auto mb-2", s.color)} />
            <div className={cn("text-3xl font-black", s.color)}>{s.value}</div>
            <div className="text-xs text-gray-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        <h3 className="text-xs font-bold tracking-widest text-[#d4af37] uppercase border-b border-[#d4af37]/20 pb-2">Casino Dice Battle</h3>
        {pendingGames.length === 0 ? (
          <div className="casino-panel relative overflow-hidden p-5">
            <div className="relative z-10 flex items-center gap-4">
              <div className="casino-roulette">
                <Dice5 size={26} />
              </div>
              <div className="min-w-0">
                <p className="text-base font-black text-white">対戦待ちはありません</p>
                <p className="mt-1 text-xs leading-5 text-gray-400">
                  お客様がDiceを開始すると、ここにロール待ちカードが表示されます。
                </p>
              </div>
            </div>
          </div>
        ) : (
          pendingGames.map(game => (
            <div key={game.id} className="casino-panel relative overflow-hidden p-4">
              <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <Crown size={18} className="text-[#d4af37]" />
                    <div className="truncate text-sm font-black text-white">{game.customerNameSnapshot} 様</div>
                    <span className="status-pill status-pill-gold">{game.betPoints}pt BET</span>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    {[game.customerDie1, game.customerDie2, game.customerDie3].map((value, index) => (
                      <DiceFace key={index} value={value} />
                    ))}
                    <div className="ml-2 min-w-0">
                      <p className="truncate text-sm font-black text-[#f8e7a2]">{game.customerHand}</p>
                      <p className="text-xs text-gray-500">次は従業員ロール</p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleRollEmployee(game.id)}
                  disabled={rollingGameId === game.id}
                  className="casino-roll-button min-h-[54px] rounded-2xl px-5 text-sm font-black tracking-widest disabled:opacity-70"
                >
                  <Sparkles size={18} className={cn(rollingGameId === game.id && 'animate-spin')} />
                  {rollingGameId === game.id ? 'ROLLING...' : 'スタッフロール'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Recent Orders */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-white/5 pb-2">
          <h3 className="text-xs font-bold tracking-widest text-gray-400 uppercase">注文管理</h3>
          <div className="flex gap-2 overflow-x-auto scrollbar-none">
            {[
              ['active', '未完了'],
              ['pending', '未対応'],
              ['processing', '対応中'],
              ['completed', '完了'],
              ['delivered', '提供済み'],
              ['all', '全履歴'],
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setStatusFilter(value as any)}
                className={cn(
                  'min-w-max rounded-full border px-3 py-1.5 text-[11px] font-bold transition',
                  statusFilter === value
                    ? 'border-[#d4af37] bg-[#d4af37]/15 text-[#d4af37]'
                    : 'border-white/10 bg-black/30 text-gray-500 hover:text-white'
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        {recentOrders.length === 0 ? (
          <div className="text-center py-8 text-gray-600 text-sm">注文はありません</div>
        ) : (
          recentOrders.map(order => (
            <div key={order.id} className={cn(
              "glass-panel rounded-xl border p-4 flex justify-between items-start gap-3",
              order.status === 'pending' ? 'border-red-500/30 bg-red-900/10' :
              order.status === 'processing' ? 'border-yellow-500/20' :
              'border-white/10'
            )}>
              <div className="flex-1 min-w-0">
                <div className="text-2xl font-black text-white leading-none">{order.tableNameSnapshot}卓</div>
                <div className="mt-3 space-y-2">
                  {order.items.map((item, index) => {
                    const recipe = resolveRecipeForItem(item);
                    return (
                      <div key={`${item.id}-${index}`} className="rounded-2xl border border-white/10 bg-black/30 px-3 py-2">
                        {recipe ? (
                          <button
                            type="button"
                            onClick={() => setRecipePreview(recipe)}
                            className="flex w-full items-center justify-between gap-3 text-left text-xs font-bold text-[#f8e7a2] transition hover:text-white"
                          >
                            <span className="min-w-0 truncate">{formatOrderItemTitle(item)} x{item.quantity}</span>
                            <BookOpen size={14} className="shrink-0 text-[#d4af37]" />
                          </button>
                        ) : (
                          <div className="text-xs font-bold text-gray-300">{formatOrderItemTitle(item)} x{item.quantity}</div>
                        )}
                        {item.itemType === 'normal_cocktail' && (
                          <div className="mt-1 text-[11px] text-gray-500">色指定の普通カクテルはレシピ対象外です</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="flex flex-col items-end gap-2 shrink-0">
                <span className={cn(
                  "text-xs px-2 py-1 rounded-full border",
                  order.status === 'pending' ? 'bg-red-900/40 text-red-300 border-red-500/30' :
                  order.status === 'processing' ? 'bg-yellow-900/30 text-yellow-300 border-yellow-500/20' :
                  order.status === 'completed' ? 'bg-green-900/20 text-green-400 border-green-500/20' :
                  'bg-blue-900/20 text-blue-400 border-blue-500/20'
                )}>
                  {order.status === 'pending' ? '未対応' :
                   order.status === 'processing' ? '対応中' :
                   order.status === 'completed' ? '完了' : '配膳済み'}
                </span>
                {order.status === 'pending' && (
                  <button
                    onClick={() => updateOrderStatus(order.id, 'processing')}
                    className="text-xs btn-gold px-3 py-1 rounded-lg"
                  >
                    受付
                  </button>
                )}
                {order.status === 'processing' && (
                  <button
                    onClick={() => updateOrderStatus(order.id, 'completed')}
                    className="text-xs bg-green-700/50 text-green-300 border border-green-500/30 px-3 py-1 rounded-lg hover:bg-green-700/70"
                  >
                    完了
                  </button>
                )}
                {order.status === 'completed' && (
                  <button
                    onClick={() => updateOrderStatus(order.id, 'delivered')}
                    className="text-xs bg-blue-700/40 text-blue-300 border border-blue-500/30 px-3 py-1 rounded-lg hover:bg-blue-700/60"
                  >
                    提供済み
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {recipePreview && (
        <div className="fixed inset-0 z-[90] flex items-end justify-center bg-black/70 p-3 backdrop-blur-sm sm:items-center">
          <div className="iphone-card max-h-[86vh] w-full max-w-lg overflow-hidden border-[#d4af37]/40">
            <div className="flex items-start justify-between gap-3 border-b border-white/10 p-4">
              <div className="min-w-0">
                <p className="text-[11px] font-black uppercase tracking-[0.25em] text-[#d4af37]">Recipe</p>
                <h3 className="mt-1 truncate text-lg font-black text-white">{recipePreview.title}</h3>
                {recipePreview.category && <p className="mt-1 text-xs text-gray-500">{recipePreview.category}</p>}
              </div>
              <button
                type="button"
                onClick={() => setRecipePreview(null)}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-gray-300"
                aria-label="レシピを閉じる"
              >
                <X size={18} />
              </button>
            </div>
            <div className="max-h-[68vh] space-y-4 overflow-y-auto p-4">
              {recipePreview.recommendationText && (
                <div className="rounded-2xl border border-[#d4af37]/30 bg-[#d4af37]/10 p-3 text-sm font-bold text-[#f8e7a2]">
                  {recipePreview.recommendationText}
                </div>
              )}
              <pre className="whitespace-pre-wrap rounded-2xl border border-white/10 bg-black/45 p-4 font-sans text-sm leading-7 text-gray-200">
                {recipePreview.recipeText}
              </pre>
              {recipePreview.notes && (
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-xs leading-6 text-gray-400">
                  <span className="font-bold text-gray-300">メモ: </span>{recipePreview.notes}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DiceFace({ value }: { value?: number }) {
  const icons = [Dice1, Dice2, Dice3, Dice4, Dice5, Dice6];
  const Icon = value ? icons[value - 1] || Dice1 : Dice5;
  return (
    <div className="dice-cube dice-cube-small">
      <Icon size={24} />
    </div>
  );
}
