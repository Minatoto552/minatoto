import React, { useState } from 'react';
import { useMockApp, UserProfile } from '../../lib/MockAppContext';
import { Search, Star, Award, UserCheck, Shield, Check, Plus, Minus, Trash2, RotateCcw, AlertTriangle } from 'lucide-react';
import { cn } from '../../lib/utils';

export function MemberManagerPage() {
  const { users, customerStamps, giveStamp, adjustPoints, deleteCustomerMember, restoreCustomerMember, hardDeleteCustomerMember, currentUser, rotationAssignments, staffTasks, updateUserPermission } = useMockApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [stampConfirm, setStampConfirm] = useState<{id: string, name: string} | null>(null);
  const [tab, setTab] = useState<'active' | 'deleted'>('active');
  
  // Point adjustment state
  const [adjustState, setAdjustState] = useState<{id: string, name: string, type: 'add' | 'sub', totalPoints: number} | null>(null);
  const [adjustPointsValue, setAdjustPointsValue] = useState<number>(1);
  const [adjustMemo, setAdjustMemo] = useState('');
  const [isAdjusting, setIsAdjusting] = useState(false);

  // Game Plays Limit state
  const [gamePlaysState, setGamePlaysState] = useState<{id: string, name: string, currentLimit: number} | null>(null);
  const [newGamePlaysLimit, setNewGamePlaysLimit] = useState<number>(4);
  const [isSettingLimit, setIsSettingLimit] = useState(false);

  // Delete state
  const [deleteConfirm, setDeleteConfirm] = useState<{id: string, name: string, isHard: boolean} | null>(null);
  const [deleteReason, setDeleteReason] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const isAdmin = currentUser?.role === 'admin';
  const isScheduled = isAdmin ||
    (currentUser?.role === 'cast' && rotationAssignments.some(r => r.castId1 === currentUser?.id || r.castId2 === currentUser?.id || r.castId3 === currentUser?.id)) ||
    (currentUser?.role === 'staff' && staffTasks.some(t => t.staffId === currentUser?.id));

  const showToast = (msg: string, isError = false) => {
    if (isError) {
      setErrorMsg(msg);
      setTimeout(() => setErrorMsg(null), 3000);
    } else {
      setSuccessMsg(msg);
      setTimeout(() => setSuccessMsg(null), 3000);
    }
  };

  const activeMembers = users.filter(u => u.role === 'customer' && !u.isDeleted);
  const deletedMembers = users.filter(u => u.role === 'customer' && u.isDeleted);

  const displayedMembers = tab === 'active' ? activeMembers : deletedMembers;

  const getBusinessDate = (date: Date) => {
    const calcDate = new Date(date);
    if (calcDate.getHours() < 3) {
      calcDate.setDate(calcDate.getDate() - 1);
    }
    const yyyy = calcDate.getFullYear();
    const mm = String(calcDate.getMonth() + 1).padStart(2, '0');
    const dd = String(calcDate.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };
  
  const currentBusinessDate = getBusinessDate(new Date());

  const getMemberData = (member: UserProfile) => {
    const memberPoints = customerStamps.filter(s => s.customerMemberId === member.id);
    const memberGrants = memberPoints.filter(s => s.type !== 'spend');
    const totalPoints = memberPoints.reduce((acc, curr) => acc + (curr.points !== undefined ? curr.points : (curr.type === 'spend' ? -1 : 1)), 0);
    
    // Sort safely if createdAt exists
    const sortedGrants = [...memberGrants].sort((a, b) => {
      const timeA = a.createdAt ? a.createdAt.getTime() : 0;
      const timeB = b.createdAt ? b.createdAt.getTime() : 0;
      return timeB - timeA;
    });
    const latestGrant = sortedGrants[0];
    const hasGrantedToday = memberGrants.some(s => s.businessDate === currentBusinessDate);
    
    return { totalPoints, latestGrant, hasGrantedToday };
  };

  const filteredMembers = displayedMembers.filter(m => {
    const match = m.displayName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                  m.loginId.toLowerCase().includes(searchTerm.toLowerCase());
    return match;
  }).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  const handleGiveStamp = async (memberId: string, memberName: string) => {
    setStampConfirm({ id: memberId, name: memberName });
  };

  const confirmStamp = async () => {
    if (!stampConfirm) return;
    try {
      await giveStamp(stampConfirm.id);
      showToast('ポイントを付与しました。');
      setStampConfirm(null);
    } catch (e: any) {
      showToast(e.message || 'ポイントの付与に失敗しました。', true);
    }
  };

  const executeAdjust = async () => {
    if (!adjustState) return;
    if (adjustPointsValue < 1) {
      showToast('1以上の数値を入力してください。', true);
      return;
    }
    if (!adjustMemo) {
      showToast('調整理由を入力してください。', true);
      return;
    }
    
    const delta = adjustState.type === 'add' ? adjustPointsValue : -adjustPointsValue;
    if (adjustState.type === 'sub' && adjustState.totalPoints + delta < 0) {
      showToast('保有ポイントを超えて減算できません。', true);
      return;
    }

    setIsAdjusting(true);
    try {
      await adjustPoints(adjustState.id, delta, adjustMemo);
      showToast(`ポイントを${adjustState.type === 'add' ? '追加' : '減算'}しました。`);
      setAdjustState(null);
    } catch (e: any) {
      showToast(e.message || 'ポイント調整に失敗しました。', true);
    } finally {
      setIsAdjusting(false);
      setAdjustPointsValue(1);
      setAdjustMemo('');
    }
  };

  const executeSetGamePlaysLimit = async () => {
    if (!gamePlaysState) return;
    if (newGamePlaysLimit < 1) {
      showToast('1以上の数値を指定してください。', true);
      return;
    }
    setIsSettingLimit(true);
    try {
      updateUserPermission(gamePlaysState.id, { gamePlaysLimit: newGamePlaysLimit });
      showToast('挑戦回数上限を変更しました。');
      setGamePlaysState(null);
    } catch (e: any) {
      showToast(e.message || '挑戦回数の変更に失敗しました。', true);
    } finally {
      setIsSettingLimit(false);
    }
  };

  const executeDelete = async () => {
    if (!deleteConfirm) return;
    if (!deleteConfirm.isHard && !deleteReason) {
      showToast('削除理由を入力してください。', true);
      return;
    }
    
    setIsDeleting(true);
    try {
      if (deleteConfirm.isHard) {
        if (prompt('本当に完全削除する場合は DELETE と入力してください。') !== 'DELETE') {
          showToast('キャンセルされました。', true);
          return;
        }
        await hardDeleteCustomerMember(deleteConfirm.id);
        showToast('完全削除しました。');
      } else {
        await deleteCustomerMember(deleteConfirm.id, deleteReason);
        showToast('会員様を削除しました。');
      }
      setDeleteConfirm(null);
    } catch (e: any) {
      showToast(e.message || '削除に失敗しました。', true);
    } finally {
      setIsDeleting(false);
      setDeleteReason('');
    }
  };

  const handleRestore = async (id: string) => {
    if (confirm('この会員様を復元しますか？')) {
      try {
        await restoreCustomerMember(id);
        showToast('復元しました。');
      } catch (e: any) {
        showToast(e.message || '復元に失敗しました。', true);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notifications */}
      <div className="fixed top-4 right-4 z-[999] flex flex-col gap-2 pointer-events-none">
        {successMsg && (
          <div className="bg-green-500/90 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-green-500/20 pointer-events-auto flex items-center gap-2">
            <Check size={16} /> {successMsg}
          </div>
        )}
        {errorMsg && (
          <div className="bg-red-500/90 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-red-500/20 pointer-events-auto flex items-center gap-2">
            <Shield size={16} /> {errorMsg}
          </div>
        )}
      </div>

      {stampConfirm && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111] border border-[#d4af37]/30 p-6 rounded-2xl w-full max-w-sm space-y-4 shadow-[0_0_30px_rgba(212,175,55,0.1)]">
            <h3 className="text-lg font-bold text-[#d4af37]">ポイント付与の確認</h3>
            <p className="text-sm text-gray-300">
              <span className="font-bold text-white">{stampConfirm.name}</span> 様に本日のポイントを付与しますか？
            </p>
            <div className="flex gap-3 pt-4">
              <button 
                onClick={() => setStampConfirm(null)} 
                className="flex-1 bg-white/5 py-3 rounded-lg text-sm hover:bg-white/10 transition"
              >
                キャンセル
              </button>
              <button 
                onClick={confirmStamp} 
                className="flex-1 btn-gold py-3 rounded-lg text-sm font-bold transition flex justify-center"
              >
                付与する
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Adjust Points Dialog */}
      {adjustState && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111] border border-white/10 p-6 rounded-2xl w-full max-w-sm space-y-4">
            <h3 className={cn("text-lg font-bold", adjustState.type === 'add' ? "text-green-400" : "text-red-400")}>
              ポイント{adjustState.type === 'add' ? '追加' : '減算'}
            </h3>
            <p className="text-sm text-gray-300">
              <span className="font-bold text-white">{adjustState.name}</span> 様のポイントを{adjustState.type === 'add' ? '追加' : '減算'}します。
            </p>
            
            <div>
              <label className="text-xs text-gray-400 mb-1 block">ポイント数</label>
              <input 
                type="number" 
                min="1" 
                value={adjustPointsValue} 
                onChange={(e) => setAdjustPointsValue(parseInt(e.target.value) || 0)} 
                className="w-full bg-black border border-white/10 rounded-lg p-3 outline-none focus:border-white/30" 
              />
            </div>
            
            <div>
              <label className="text-xs text-gray-400 mb-1 block">調整理由 (必須)</label>
              <input 
                type="text" 
                value={adjustMemo} 
                onChange={(e) => setAdjustMemo(e.target.value)} 
                className="w-full bg-black border border-white/10 rounded-lg p-3 outline-none focus:border-white/30 text-sm" 
                placeholder="例: 会費支払いによる付与"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button 
                disabled={isAdjusting}
                onClick={() => setAdjustState(null)} 
                className="flex-1 bg-white/5 py-3 rounded-lg text-sm hover:bg-white/10 transition"
              >
                キャンセル
              </button>
              <button 
                disabled={isAdjusting || adjustPointsValue < 1 || !adjustMemo}
                onClick={executeAdjust} 
                className={cn(
                  "flex-1 py-3 rounded-lg text-sm font-bold transition flex justify-center",
                  adjustState.type === 'add' ? "bg-green-600 hover:bg-green-500 text-white" : "bg-red-600 hover:bg-red-500 text-white",
                  (isAdjusting || adjustPointsValue < 1 || !adjustMemo) && "opacity-50 cursor-not-allowed"
                )}
              >
                {isAdjusting ? '処理中...' : (adjustState.type === 'add' ? '追加する' : '減算する')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Game Plays Limit Dialog */}
      {gamePlaysState && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111] border border-[#d4af37]/30 p-6 rounded-2xl w-full max-w-sm space-y-4 shadow-[0_0_30px_rgba(212,175,55,0.1)]">
            <h3 className="text-lg font-bold text-[#d4af37]">ゲーム挑戦回数上限の変更</h3>
            <p className="text-sm text-gray-300">
              <span className="font-bold text-white">{gamePlaysState.name}</span> 様の24時間以内の挑戦回数上限を変更します。
              （現在の設定: {gamePlaysState.currentLimit}回）
            </p>
            
            <div>
              <label className="text-xs text-gray-400 mb-1 block">新しい回数上限</label>
              <input 
                type="number" 
                min="1" 
                value={newGamePlaysLimit} 
                onChange={(e) => setNewGamePlaysLimit(parseInt(e.target.value) || 4)} 
                className="w-full bg-black border border-[#d4af37]/30 rounded-lg p-3 outline-none focus:border-[#d4af37] text-white" 
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button 
                disabled={isSettingLimit}
                onClick={() => setGamePlaysState(null)} 
                className="flex-1 bg-white/5 py-3 rounded-lg text-sm hover:bg-white/10 transition text-white"
              >
                キャンセル
              </button>
              <button 
                disabled={isSettingLimit || newGamePlaysLimit < 1}
                onClick={executeSetGamePlaysLimit} 
                className={cn(
                  "flex-1 btn-gold py-3 rounded-lg text-sm font-bold transition flex justify-center",
                  (isSettingLimit || newGamePlaysLimit < 1) && "opacity-50 cursor-not-allowed"
                )}
              >
                {isSettingLimit ? '処理中...' : '変更する'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111] border border-red-500/30 p-6 rounded-2xl w-full max-w-sm space-y-4">
            <h3 className="text-lg font-bold text-red-500 flex items-center gap-2">
              <AlertTriangle size={20} />
              {deleteConfirm.isHard ? '会員履歴の完全削除' : '会員様の削除'}
            </h3>
            <p className="text-sm text-gray-300">
              <span className="font-bold text-white">{deleteConfirm.name}</span> 様を{deleteConfirm.isHard ? 'システムから完全に削除' : '削除'}します。
              {!deleteConfirm.isHard && '（削除後はログインできなくなります。履歴は残ります。）'}
            </p>
            
            {!deleteConfirm.isHard && (
              <div>
                <label className="text-xs text-gray-400 mb-1 block">削除理由 (必須)</label>
                <input 
                  type="text" 
                  value={deleteReason} 
                  onChange={(e) => setDeleteReason(e.target.value)} 
                  className="w-full bg-black border border-white/10 rounded-lg p-3 outline-none focus:border-red-500 text-sm" 
                  placeholder="例: 退会申請のため"
                />
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <button 
                disabled={isDeleting}
                onClick={() => setDeleteConfirm(null)} 
                className="flex-1 bg-white/5 py-3 rounded-lg text-sm hover:bg-white/10 transition"
              >
                キャンセル
              </button>
              <button 
                disabled={isDeleting || (!deleteConfirm.isHard && !deleteReason)}
                onClick={executeDelete} 
                className="flex-1 bg-red-600 hover:bg-red-500 text-white py-3 rounded-lg text-sm font-bold transition flex justify-center disabled:opacity-50"
              >
                {isDeleting ? '処理中...' : '削除する'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center bg-black/40 p-4 rounded-2xl border border-[#d4af37]/20 gap-4">
        <div className="space-y-1">
          <h3 className="font-bold text-[#d4af37] flex items-center gap-2">
            <UserCheck size={18} />
            会員情報・ポイント管理
          </h3>
          <p className="text-xs text-gray-400">会員様の情報とポイント状況を管理します。</p>
        </div>

        {isAdmin && (
          <div className="flex bg-black/50 p-1 rounded-lg border border-white/10">
            <button
              onClick={() => setTab('active')}
              className={cn("px-4 py-1.5 rounded-md text-sm transition-all", tab === 'active' ? "bg-white/10 text-white font-bold" : "text-gray-500 hover:text-white")}
            >
              有効会員様
            </button>
            <button
              onClick={() => setTab('deleted')}
              className={cn("px-4 py-1.5 rounded-md text-sm transition-all", tab === 'deleted' ? "bg-white/10 text-white font-bold" : "text-gray-500 hover:text-white")}
            >
              削除済み
            </button>
          </div>
        )}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
        <input 
          type="text" 
          placeholder="会員名またはログインIDで検索..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-black/50 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white focus:border-[#d4af37] outline-none"
        />
      </div>

      <div className="space-y-3">
        {filteredMembers.length === 0 ? (
           <div className="text-center py-8 text-gray-500 bg-black/30 rounded-xl border border-white/5 text-sm">
             該当する会員は見つかりませんでした。
           </div>
        ) : (
           filteredMembers.map(member => {
             const { totalPoints, latestGrant, hasGrantedToday } = getMemberData(member);
             return (
               <div key={member.id} className={cn("glass-panel p-4 rounded-xl border flex flex-col sm:flex-row justify-between gap-4", member.isDeleted ? "border-red-500/20 opacity-80" : "border-white/10")}>
                 <div className="flex items-start gap-4">
                   <div className="w-12 h-12 bg-black border border-white/20 rounded-full overflow-hidden flex items-center justify-center shrink-0">
                     {member.iconUrl ? <img src={member.iconUrl} alt="icon" className="w-full h-full object-cover" /> : <span className="text-gray-500">M</span>}
                   </div>
                   <div>
                     <div className="flex items-center gap-2 mb-1">
                       <span className="font-bold text-white text-lg">{member.displayName}</span>
                       <span className="text-[10px] text-gray-500 font-mono tracking-wider bg-white/5 px-2 py-0.5 rounded">ID: {member.loginId}</span>
                       {member.isDeleted && <span className="text-[10px] text-red-400 bg-red-400/10 px-2 py-0.5 rounded border border-red-400/20">削除済み</span>}
                     </div>
                     <div className="text-xs text-gray-400 space-y-1">
                       <div>入会日時: {member.createdAt.toLocaleString()}</div>
                       {!member.isDeleted && latestGrant && <div>最終ポイント付与: {latestGrant.createdAt?.toLocaleString() || '処理中...'} ({latestGrant.stampedByNameSnapshot})</div>}
                       {member.isDeleted && member.deleteReason && <div>削除理由: {member.deleteReason}</div>}
                     </div>
                   </div>
                 </div>

                 <div className="flex sm:items-center flex-wrap gap-4 sm:ml-auto">
                   <div className="bg-black/50 border border-[#d4af37]/30 rounded-lg p-2 flex flex-col items-center justify-center min-w-[70px]">
                     <span className="text-[10px] text-[#d4af37] uppercase tracking-widest leading-none mb-1">Points</span>
                     <span className="text-2xl font-lux text-white leading-none">{totalPoints}</span>
                   </div>
                   
                   {!member.isDeleted ? (
                     <div className="flex flex-col gap-2">
                       <div className="flex flex-wrap gap-2 justify-end">
                         {isAdmin && (
                           <div className="flex gap-2">
                             <button
                               onClick={() => setAdjustState({id: member.id, name: member.displayName, type: 'add', totalPoints})}
                               className="w-10 h-10 flex items-center justify-center bg-gray-800 hover:bg-gray-700 rounded-lg transition"
                               title="ポイント追加"
                             >
                               <Plus size={16} className="text-green-400" />
                             </button>
                             <button
                               onClick={() => setAdjustState({id: member.id, name: member.displayName, type: 'sub', totalPoints})}
                               className="w-10 h-10 flex items-center justify-center bg-gray-800 hover:bg-gray-700 rounded-lg transition"
                               title="ポイント減算"
                             >
                               <Minus size={16} className="text-red-400" />
                             </button>
                             <button
                               onClick={() => setGamePlaysState({id: member.id, name: member.displayName, currentLimit: member.gamePlaysLimit ?? 4})}
                               className="px-3 h-10 flex items-center justify-center bg-blue-900/30 border border-blue-500/30 hover:bg-blue-900/50 rounded-lg transition text-blue-400 text-xs font-bold"
                               title="挑戦回数上限の変更"
                             >
                               上限設定
                             </button>
                           </div>
                         )}

                         <button
                           disabled={hasGrantedToday || !isScheduled}
                           onClick={() => handleGiveStamp(member.id, member.displayName)}
                           className={cn(
                             "px-4 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1",
                             (hasGrantedToday || !isScheduled)
                               ? "bg-[#d4af37]/20 border border-[#d4af37]/50 text-[#d4af37] cursor-not-allowed" 
                               : "btn-gold"
                           )}
                         >
                           {hasGrantedToday ? <><Check size={14} /> 本日付与済</> : <><Star size={14} /> 本日分</>}
                         </button>
                         
                         {isAdmin && (
                            <button
                               onClick={() => setDeleteConfirm({id: member.id, name: member.displayName, isHard: false})}
                               className="px-3 py-2 rounded-lg text-xs font-bold bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/30 transition flex items-center justify-center"
                               title="削除"
                            >
                               <Trash2 size={14} />
                            </button>
                         )}
                       </div>
                       {!isScheduled && !hasGrantedToday && !isAdmin && (
                         <div className="text-[10px] text-red-400 text-right">本日の出勤登録がありません</div>
                       )}
                     </div>
                   ) : (
                     <div className="flex gap-2">
                        {isAdmin && (
                           <>
                             <button
                               onClick={() => handleRestore(member.id)}
                               className="px-4 py-2 rounded-lg text-xs font-bold bg-green-500/10 hover:bg-green-500/20 text-green-500 border border-green-500/30 transition flex items-center justify-center gap-1"
                             >
                               <RotateCcw size={14} /> 復元
                             </button>
                             <button
                               onClick={() => setDeleteConfirm({id: member.id, name: member.displayName, isHard: true})}
                               className="px-4 py-2 rounded-lg text-xs font-bold bg-red-500 hover:bg-red-600 text-white transition flex items-center justify-center gap-1"
                             >
                               <Trash2 size={14} /> 完全削除
                             </button>
                           </>
                        )}
                     </div>
                   )}
                 </div>
               </div>
             );
           })
        )}
      </div>
    </div>
  );
}
