import React, { useState } from 'react';
import { useVrcBarApp, HistoryResetLog } from '../../lib/VrcBarAppContext';
import { Database, AlertTriangle, ShieldAlert, History, ChevronLeft, Trash2, Calendar, CheckCircle2, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { ProfileAvatar } from '../../components/ui/ProfileAvatar';

export function DataMaintenancePage() {
  const { resetHistory, historyResetLogs, orders, announcements, emergencyCalls, rotationStatusHistory, users } = useVrcBarApp();
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [resetOptions, setResetOptions] = useState<{
    type: HistoryResetLog['resetType'],
    beforeDate: string,
    memo: string
  }>({
    type: 'all',
    beforeDate: '',
    memo: ''
  });

  const getTargetCount = (type: HistoryResetLog['resetType']) => {
    let count = 0;
    const beforeDate = resetOptions.beforeDate ? new Date(resetOptions.beforeDate) : null;
    
    const filterByDate = (items: any[]) => {
      if (!beforeDate) return items;
      return items.filter(item => {
        const createdAt = item.createdAt instanceof Date ? item.createdAt : null;
        return createdAt && createdAt < beforeDate;
      });
    };

    const filterActive = (collName: string, items: any[]) => {
      return items.filter(item => {
        if (collName === 'announcements' && item.isActive === true) return false;
        if (collName === 'emergencyCalls' && item.status === 'active') return false;
        if (collName === 'orders' && (item.status === 'pending' || item.status === 'processing')) return false;
        return true;
      });
    };

    if (type === 'all' || type === 'orders') count += filterActive('orders', filterByDate(orders)).length;
    if (type === 'all' || type === 'announcements') count += filterActive('announcements', filterByDate(announcements)).length;
    if (type === 'all' || type === 'emergency_calls') count += filterActive('emergencyCalls', filterByDate(emergencyCalls)).length;
    if (type === 'all' || type === 'rotation_history') count += filterByDate(rotationStatusHistory).length;

    return count;
  };

  const handleResetClick = () => {
  const count = getTargetCount(resetOptions.type);

  if (count === 0) {
    alert('削除対象のデータがありません');
    return;
  }

  setShowResetConfirm(true);
};

const executeReset = async () => {
  const count = getTargetCount(resetOptions.type);

  if (count === 0) {
    alert('削除対象のデータがありません');
    setShowResetConfirm(false);
    return;
  }

  setIsResetting(true);

  try {
    await resetHistory({
      type: resetOptions.type,
      beforeDate: resetOptions.beforeDate ? new Date(resetOptions.beforeDate) : null,
      memo: resetOptions.memo
    });

    alert('リセットが正常に完了しました');
    setResetOptions({ ...resetOptions, memo: '' });
    setShowResetConfirm(false);
  } catch (e: any) {
    console.error('[RESET HISTORY ERROR]', e);
    alert(`エラーが発生しました: ${e?.message || String(e)}`);
  } finally {
    setIsResetting(false);
  }
};

  const getSafeTime = (date: any) => {
  if (date instanceof Date) return date.getTime();
  return 0;
};

const formatSafeDate = (date: any) => {
  if (date instanceof Date) return date.toLocaleDateString();
  return '日時未確定';
};

const formatSafeTime = (date: any) => {
  if (date instanceof Date) return date.toLocaleTimeString();
  return '--:--';
};

const sortedLogs = [...historyResetLogs].sort(
  (a, b) => getSafeTime(b.executedAt) - getSafeTime(a.executedAt)
);

  return (
    <div className="max-w-4xl mx-auto px-4 pb-24 animate-in fade-in duration-500">
      <div className="mb-8 flex items-center gap-4">
        <Link to="/app/admin" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white transition">
          <ChevronLeft size={20} />
        </Link>
        <div>
          <h2 className="text-2xl font-lux gold-gradient-text tracking-widest uppercase">Data Maintenance</h2>
          <p className="text-xs text-gray-500 uppercase tracking-widest">History Management & Database Cleanup</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Reset Form */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-2 opacity-10">
              <ShieldAlert size={80} />
            </div>

            <div className="flex items-center gap-2 text-red-500 font-bold mb-4 uppercase tracking-tighter">
              <AlertTriangle size={18} /> Danger Zone
            </div>

            <div className="space-y-4 relative z-10">
              <div>
                <label className="text-xs text-gray-400 block mb-1">リセット対象を選択</label>
                <select
                  value={resetOptions.type}
                  onChange={e => setResetOptions({ ...resetOptions, type: e.target.value as any })}
                  className="w-full bg-black border border-white/10 rounded-xl p-3 text-sm outline-none focus:border-red-500 transition"
                >
                  <option value="all">すべての履歴 (注文・アナウンス・緊急ヘルプ・ローテ)</option>
                  <option value="orders">注文履歴のみ</option>
                  <option value="announcements">アナウンス履歴のみ</option>
                  <option value="emergency_calls">緊急ヘルプ履歴のみ</option>
                  <option value="rotation_history">ローテーション変更履歴のみ</option>
                </select>
                <p className="text-[10px] text-gray-500 mt-1">
                  ※ 現在進行中の注文や有効なアナウンス、アクティブな緊急ヘルプは保護されます。
                </p>
              </div>

              <div>
                <label className="text-xs text-gray-400 block mb-1">指定日以前を削除 (任意)</label>
                <input
                  type="datetime-local"
                  value={resetOptions.beforeDate}
                  onChange={e => setResetOptions({ ...resetOptions, beforeDate: e.target.value })}
                  className="w-full bg-black border border-white/10 rounded-xl p-3 text-sm outline-none focus:border-red-500 transition"
                />
                <p className="text-[10px] text-gray-500 mt-1">
                  指定しない場合は、条件に合うすべての履歴が対象となります。
                </p>
              </div>

              <div>
                <label className="text-xs text-gray-400 block mb-1">実行メモ</label>
                <input
                  type="text"
                  placeholder="理由: イベント終了後の整理, テストデータの削除 etc."
                  value={resetOptions.memo}
                  onChange={e => setResetOptions({ ...resetOptions, memo: e.target.value })}
                  className="w-full bg-black border border-white/10 rounded-xl p-3 text-sm outline-none focus:border-red-500 transition"
                />
              </div>

              <div className="bg-black/30 p-4 rounded-xl border border-white/5 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-400 uppercase tracking-widest">Target Items Found:</span>
                  <span className={cn(
                    "font-black text-xl px-3 py-1 rounded bg-black/50 border",
                    getTargetCount(resetOptions.type) > 0
                      ? "text-red-500 border-red-500/30"
                      : "text-gray-600 border-white/10"
                  )}>
                    {getTargetCount(resetOptions.type)} <span className="text-sm font-normal">items</span>
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleResetClick}
                disabled={isResetting}
                className={cn(
                  "w-full py-4 rounded-xl text-lg font-black tracking-[0.3em] uppercase flex items-center justify-center gap-3 transition-all",
                  isResetting
                    ? "bg-gray-800 text-gray-600 cursor-not-allowed"
                    : "bg-red-600 hover:bg-red-700 text-white shadow-[0_0_20px_rgba(220,38,38,0.3)]"
                )}
              >
                {isResetting ? (
                  <>実行中... <History className="animate-spin" /></>
                ) : (
                  <><Trash2 size={24} /> Reset History</>
                )}
              </button>

              {showResetConfirm && (
                <div className="mt-4 rounded-xl border border-red-500/40 bg-red-950/30 p-4 space-y-4">
                  <div className="text-red-400 font-bold text-sm flex items-center gap-2">
                    <AlertTriangle size={16} />
                    履歴リセットの確認
                  </div>

                  <div className="text-sm text-gray-300 space-y-1">
                    <p>対象データ：{resetOptions.type}</p>
                    <p>削除見込み件数：{getTargetCount(resetOptions.type)}件</p>
                    <p className="text-red-300 font-bold">
                      この操作は取り消せません。本当に実行しますか？
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setShowResetConfirm(false)}
                      disabled={isResetting}
                      className="flex-1 rounded-lg bg-white/10 hover:bg-white/20 text-white py-3 text-sm font-bold transition"
                    >
                      キャンセル
                    </button>

                    <button
                      type="button"
                      onClick={executeReset}
                      disabled={isResetting}
                      className="flex-1 rounded-lg bg-red-600 hover:bg-red-700 text-white py-3 text-sm font-bold transition disabled:bg-gray-700 disabled:text-gray-400"
                    >
                      {isResetting ? '実行中...' : 'リセットを実行'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Reset Logs */}
        <div className="lg:col-span-5 space-y-4">
          <h3 className="font-bold text-[#d4af37] flex items-center gap-2 px-2 uppercase tracking-widest text-sm">
            <History size={16} /> Activity Log
          </h3>

          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar pb-32">
            {sortedLogs.length > 0 ? (
              sortedLogs.map(log => {
                const executor = users.find(u => u.id === log.executedBy);

                return (
                  <div key={log.id} className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3 transition hover:bg-white/10">
                    <div className="flex justify-between items-start">
                      <div className="flex flex-col">
                        <span className="text-[10px] uppercase font-bold text-red-400 bg-red-400/10 px-2 py-0.5 rounded-full border border-red-400/20 w-fit">
                          {log.resetType}
                        </span>
                        <h4 className="text-white text-xs font-bold mt-2 flex items-center gap-1">
                          <CheckCircle2 size={12} className="text-green-500" />
                          {log.deletedCount} items deleted
                        </h4>
                      </div>

                      <div className="text-right text-[10px] text-gray-500 font-mono">
                        <div className="flex items-center justify-end gap-1">
                          <Calendar size={10} />{formatSafeDate(log.executedAt)}
                        </div>
                        <div className="flex items-center justify-end gap-1">
                          <Clock size={10} />{formatSafeTime(log.executedAt)}
                        </div>
                      </div>
                    </div>

                    {log.memo && (
                      <div className="text-[10px] bg-black/40 p-2 rounded border border-white/5 text-gray-400">
                        {log.memo}
                      </div>
                    )}

                    <div className="flex items-center gap-2 pt-1 border-t border-white/5 mt-1">
                      <ProfileAvatar
                        src={executor?.iconUrl}
                        name={executor?.displayName}
                        version={executor?.profileImageUpdatedAt}
                        className="h-5 w-5 rounded-full border border-white/20 bg-white/10"
                        fallbackClassName="text-[8px]"
                      />
                      <span className="text-[10px] text-gray-500">
                        Executed by <span className="text-white">{executor?.displayName || 'Unknown'}</span>
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-10 bg-black/20 rounded-2xl border border-dashed border-white/10">
                <Database className="mx-auto text-gray-800 mb-2" size={32} />
                <p className="text-[10px] text-gray-600 px-4">クリーンアップの履歴はありません</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
