import React, { useState } from 'react';
import { useMockApp, LotteryItem } from '../../lib/MockAppContext';
import { Ticket, Plus, Trash2, Edit2, PlayCircle, Trophy, RefreshCcw } from 'lucide-react';
import { cn } from '../../lib/utils';

export function LotteryManagerPage() {
  const { lotteryItems, lotteryEntries, addLotteryItem, updateLotteryItem, deleteLotteryItem, executeLotteryDraw, currentUser } = useMockApp();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editForm, setEditForm] = useState<Partial<LotteryItem>>({});
  
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [drawConfirm, setDrawConfirm] = useState<{id: string, title: string} | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{id: string, title: string, entriesCount: number} | null>(null);
  const [showDeleted, setShowDeleted] = useState(false);

  const showToast = (msg: string, isError = false) => {
    if (isError) {
      setErrorMsg(msg);
      setTimeout(() => setErrorMsg(null), 3000);
    } else {
      setSuccessMsg(msg);
      setTimeout(() => setSuccessMsg(null), 3000);
    }
  };

  const handleAddNew = () => {
    setEditForm({
      title: '',
      description: '',
      prizeName: '',
      winnerCount: 1,
      requiredPoints: 1,
      status: 'draft',
      eventId: 'current'
    });
    setIsEditing(true);
  };

  const handleSaveLotteryItem = async () => {
    if (!currentUser || currentUser.role !== 'admin' || currentUser.approvalStatus !== 'approved' || currentUser.isDeleted) {
      showToast('権限がありません。抽選項目の保存は管理者のみ実行可能です。', true);
      return;
    }
    
    if (!editForm.title) {
      showToast('抽選名は必須です。', true);
      return;
    }

    if (!editForm.winnerCount || editForm.winnerCount <= 0 || isNaN(editForm.winnerCount)) {
      showToast('当選人数は1以上の整数で入力してください。', true);
      return;
    }
    
    if (!editForm.eventId) {
      showToast('イベントIDが取得できませんでした。', true);
      return;
    }

    setIsSaving(true);
    try {
      if (editForm.id) {
        await updateLotteryItem(editForm.id, editForm as Partial<LotteryItem>);
      } else {
        await addLotteryItem(editForm as Omit<LotteryItem, 'id' | 'createdAt'>);
      }
      setIsEditing(false);
      setEditForm({});
      showToast('抽選項目を保存しました');
    } catch (e: any) {
      console.error("Lottery save error:", e);
      showToast('保存に失敗しました: ' + e.message, true);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDraw = async (id: string, title: string) => {
    setDrawConfirm({ id, title });
  };

  const confirmDraw = async () => {
    if (!drawConfirm) return;
    try {
      await executeLotteryDraw(drawConfirm.id);
      showToast('抽選を実行しました');
      setDrawConfirm(null);
    } catch (e: any) {
      showToast(e.message || '抽選に失敗しました', true);
    }
  };

  const handleDeleteClick = (item: LotteryItem, entriesCount: number) => {
    setDeleteConfirm({ id: item.id, title: item.title, entriesCount });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await deleteLotteryItem(deleteConfirm.id);
      showToast('抽選を削除しました');
      setDeleteConfirm(null);
    } catch (e: any) {
      showToast(e.message || '削除に失敗しました', true);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Toast Notifications */}
      <div className="fixed top-4 right-4 z-[999] flex flex-col gap-2 pointer-events-none">
        {successMsg && (
          <div className="bg-green-500/90 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-green-500/20 pointer-events-auto flex items-center gap-2">
            ★ {successMsg}
          </div>
        )}
        {errorMsg && (
          <div className="bg-red-500/90 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-red-500/20 pointer-events-auto flex items-center gap-2">
            × {errorMsg}
          </div>
        )}
      </div>

      {deleteConfirm && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111] border border-red-500/30 p-6 rounded-2xl w-full max-w-sm space-y-4">
            <h3 className="text-lg font-bold text-red-500">抽選の削除確認</h3>
            <div className="text-sm text-gray-300 space-y-2">
              <p>この抽選項目を削除しますか？<br/>削除後、お客様画面には表示されません。</p>
              <p className="font-bold text-white">対象: {deleteConfirm.title}</p>
              {deleteConfirm.entriesCount > 0 && (
                <p className="text-red-400 mt-2 p-3 bg-red-900/20 border border-red-500/20 rounded-lg">
                  この抽選には応募者が {deleteConfirm.entriesCount} 人います。<br/>削除しても応募履歴は管理用に残します。<br/>本当に削除しますか？
                </p>
              )}
            </div>
            <div className="flex gap-3 pt-4">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 bg-white/5 py-2 rounded-lg text-sm hover:bg-white/10 transition">キャンセル</button>
              <button 
                onClick={confirmDelete} 
                className="flex-1 bg-red-600/80 hover:bg-red-500 py-2 rounded-lg text-sm text-white font-bold transition flex justify-center"
              >
                削除する
              </button>
            </div>
          </div>
        </div>
      )}

      {drawConfirm && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111] border border-[#d4af37]/30 p-6 rounded-2xl w-full max-w-sm space-y-4">
            <h3 className="text-lg font-bold text-[#d4af37]">抽選の実行確認</h3>
            <p className="text-sm text-gray-300">「{drawConfirm.title}」の抽選を実行しますか？</p>
            <div className="flex gap-3 pt-4">
              <button onClick={() => setDrawConfirm(null)} className="flex-1 bg-white/5 py-2 rounded-lg text-sm hover:bg-white/10 transition">キャンセル</button>
              <button 
                onClick={confirmDraw} 
                className="flex-1 btn-gold py-2 rounded-lg text-sm font-bold transition flex justify-center"
              >
                実行する
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mb-4 gap-2 flex-wrap">
        <h3 className="text-xl font-lux text-white flex items-center gap-2">
          <Ticket className="text-[#d4af37]" />
          抽選管理
        </h3>
        {!isEditing && (
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-xs text-gray-400 cursor-pointer">
              <input type="checkbox" checked={showDeleted} onChange={e => setShowDeleted(e.target.checked)} className="form-checkbox bg-black/50 border-white/20 text-[#d4af37] rounded" />
              削除済みを表示
            </label>
            <button onClick={handleAddNew} className="btn-gold px-4 py-2 rounded-full text-xs flex items-center gap-2">
              <Plus size={14} /> 新規作成
            </button>
          </div>
        )}
      </div>

      {isEditing ? (
        <div className="glass-panel p-6 rounded-2xl border border-[#d4af37]/30 space-y-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1">抽選名</label>
            <input type="text" value={editForm.title || ''} onChange={e => setEditForm({...editForm, title: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded p-2 text-sm text-white" />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">景品名</label>
            <input type="text" value={editForm.prizeName || ''} onChange={e => setEditForm({...editForm, prizeName: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded p-2 text-sm text-white" />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">当選人数</label>
            <input type="number" min="1" value={editForm.winnerCount || 1} onChange={e => setEditForm({...editForm, winnerCount: parseInt(e.target.value) || 1})} className="w-full bg-black/50 border border-white/10 rounded p-2 text-sm text-white" />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">必要ポイント数</label>
            <input type="number" min="0" value={editForm.requiredPoints ?? 1} onChange={e => setEditForm({...editForm, requiredPoints: parseInt(e.target.value) || 0})} className="w-full bg-black/50 border border-white/10 rounded p-2 text-sm text-white" />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">説明</label>
            <textarea value={editForm.description || ''} onChange={e => setEditForm({...editForm, description: e.target.value})} placeholder="抽選ルールの説明..." className="w-full bg-black/50 border border-white/10 rounded p-2 text-sm text-white min-h-[150px]" />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">ステータス</label>
            <select value={editForm.status || 'draft'} onChange={e => setEditForm({...editForm, status: e.target.value as any})} className="w-full bg-black/50 border border-white/10 rounded p-2 text-sm text-white">
              <option value="draft">下書き (Draft)</option>
              <option value="open">応募受付中 (Open)</option>
              <option value="closed">応募終了 (Closed)</option>
              <option value="published">結果公開中 (Published)</option>
            </select>
          </div>
          <div className="flex gap-3 justify-end pt-4">
            <button onClick={() => setIsEditing(false)} className="px-4 py-2 text-xs bg-gray-700 hover:bg-gray-600 rounded text-white transition">キャンセル</button>
            <button onClick={handleSaveLotteryItem} disabled={isSaving} className={cn("px-6 py-2 text-xs font-bold rounded transition", isSaving ? "bg-gray-600 text-gray-400" : "btn-gold")}>
              {isSaving ? '保存中...' : '保存'}
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {lotteryItems.filter(i => showDeleted ? true : !i.isDeleted).length === 0 ? (
            <div className="col-span-full text-center py-12 text-gray-500 glass-panel rounded-2xl">抽選項目はありません</div>
          ) : (
            lotteryItems.filter(i => showDeleted ? true : !i.isDeleted).map(item => {
              const entries = lotteryEntries.filter(e => e.lotteryItemId === item.id);
              const winners = entries.filter(e => e.status === 'won');
              return (
                <div key={item.id} className={cn("glass-panel p-4 rounded-xl border border-white/10 relative overflow-hidden", item.isDeleted && "opacity-60")}>
                   {item.isDeleted && (
                     <div className="absolute top-2 right-2 bg-red-900 text-red-100 text-[10px] px-2 py-0.5 rounded shadow-lg font-bold">削除済み</div>
                   )}
                   <div className="flex justify-between items-start mb-2 pt-2">
                     <h4 className="font-bold text-white text-lg pr-12">{item.title}</h4>
                     <div className="flex items-center gap-1 z-10 relative">
                       {!item.isDeleted && (
                         <>
                           <button onClick={() => { setEditForm(item); setIsEditing(true); }} className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded transition" title="編集">
                             <Edit2 size={16} />
                           </button>
                           <button onClick={() => handleDeleteClick(item, entries.length)} className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/20 rounded transition" title="削除">
                             <Trash2 size={16} />
                           </button>
                         </>
                       )}
                     </div>
                   </div>
                   <div className="text-xs text-gray-400 mb-4">{item.prizeName} (当選: {item.winnerCount}名)</div>
                   
                   <div className="flex items-center gap-2 mb-4">
                     <span className={cn(
                       "text-[10px] px-2 py-1 rounded font-bold tracking-wider uppercase",
                       item.status === 'open' ? "bg-green-500/20 text-green-400 border border-green-500/30" : 
                       item.status === 'published' ? "bg-[#d4af37]/20 text-[#d4af37] border border-[#d4af37]/30" :
                       item.status === 'draft' ? "bg-gray-800 text-gray-400 border border-gray-700" :
                       "bg-blue-900/20 text-blue-400 border border-blue-500/30"
                     )}>
                       {item.status}
                     </span>
                     <span className="text-xs text-gray-500">応募: {entries.length}件</span>
                   </div>

                   <div className="border-t border-white/10 pt-4 flex gap-2 justify-end">
                     {(item.status === 'closed' || item.status === 'drawn') && (
                       <button 
                         onClick={() => handleDraw(item.id, item.title)}
                         className="flex items-center gap-1 text-xs px-3 py-1.5 bg-[#d4af37] hover:bg-[#b89830] text-black font-bold rounded transition"
                       >
                         {item.status === 'drawn' ? <><RefreshCcw size={14} /> 再抽選</> : <><PlayCircle size={14} /> 抽選実行</>}
                       </button>
                     )}
                   </div>
                   
                   {item.status === 'drawn' || item.status === 'published' ? (
                     <div className="mt-4 bg-black/50 p-3 rounded-lg border border-white/5">
                        <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-1"><Trophy size={12} className="text-[#d4af37]" /> Winners</div>
                        {winners.length > 0 ? (
                          <div className="space-y-1">
                            {winners.map(w => (
                              <div key={w.id} className="text-xs text-[#d4af37]">{w.customerDisplayNameSnapshot || 'ゲスト'}</div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-xs text-gray-500">当選者なし</div>
                        )}
                     </div>
                   ) : null}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
