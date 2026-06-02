import React, { useState, useEffect } from 'react';
import { useMockApp, UserRole, ApprovalStatus } from '../../lib/MockAppContext';
import { Check, X, Lock, Unlock, Trash2, Undo, RefreshCw } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useDraggableScroll } from '../../hooks/useDraggableScroll';

export function UserManagerPage() {
  const { users, currentUser, updateUserPermission, deleteUser, restoreUser, hardDeleteUser, userDeleteLogs } = useMockApp();
  const [activeSubTab, setActiveSubTab] = useState<'pending' | 'active' | 'deleted' | 'logs'>('pending');
  const scrollRef = useDraggableScroll<HTMLDivElement>();
  const [deleteConfirmUser, setDeleteConfirmUser] = useState<string | null>(null);
  const [deleteReason, setDeleteReason] = useState('');
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [now, setNow] = useState<Date>(new Date());
  
  // Realtime mock updates
  useEffect(() => {
    const timer = setInterval(() => {
      setLastUpdated(new Date());
    }, 30000); // 30 seconds
    
    const ticker = setInterval(() => {
      setNow(new Date());
    }, 1000);
    
    return () => {
      clearInterval(timer);
      clearInterval(ticker);
    };
  }, []);

  const pendingUsers = users.filter(u => u.approvalStatus === 'pending' && !u.isDeleted && u.role !== 'customer');
  const activeUsers = users.filter(u => u.approvalStatus === 'approved' && !u.isDeleted && u.role !== 'customer');
  const deletedUsers = users.filter(u => u.isDeleted && u.role !== 'customer');

  const secondsAgo = Math.floor((now.getTime() - lastUpdated.getTime()) / 1000);

  const handleDelete = async (userId: string) => {
    if (!deleteReason.trim()) return;
    try {
      await deleteUser(userId, deleteReason);
      setDeleteConfirmUser(null);
      setDeleteReason('');
    } catch (e: any) {
      alert(e.message || '削除中にエラーが発生しました');
    }
  };

  const handleRestore = (userId: string) => {
    restoreUser(userId, 'pending', 'pending');
  };

  return (
    <div className="space-y-6 mt-6">
      <div className="flex justify-between items-end mb-4">
        <div ref={scrollRef} className="flex overflow-x-auto gap-2 scrollbar-none cursor-grab active:cursor-grabbing">
          {[
            { id: 'pending', label: `承認待ち (${pendingUsers.length})` },
            { id: 'active', label: '有効ユーザー' },
            { id: 'deleted', label: '削除済みユーザー' },
            { id: 'logs', label: '削除/復元ログ' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={cn(
                "px-4 py-2 rounded-lg text-sm whitespace-nowrap transition",
                activeSubTab === tab.id ? "bg-[#d4af37] text-black font-bold" : "bg-black/30 text-gray-400 hover:text-white border border-white/10"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="flex flex-col items-end gap-1">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-[10px] text-green-400">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
              リアルタイム同期中
            </span>
            <span className="text-[10px] text-gray-500">最終更新: {secondsAgo}秒前</span>
          </div>
          <button onClick={() => setLastUpdated(new Date())} className="flex items-center gap-1 text-[10px] text-[#d4af37] bg-[#d4af37]/10 px-2 py-1 rounded hover:bg-[#d4af37]/30 transition">
            <RefreshCw size={10} /> 手動更新
          </button>
        </div>
      </div>

      {activeSubTab === 'pending' && (
        <div className="space-y-3">
          {pendingUsers.map(user => (
            <div key={user.id} className="glass-panel p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 border border-[#d4af37]/30 relative overflow-hidden">
              <div>
                <div className="font-medium text-sm flex items-center gap-2">
                  {user.displayName} <span className="text-xs text-gray-500">(@{user.loginId})</span>
                </div>
                <div className="text-xs text-[#d4af37] mt-1 font-bold">希望ロール: {user.requestedRole}</div>
                <div className="text-[10px] text-gray-500 mt-0.5">申請: {new Date(user.createdAt).toLocaleString()}</div>
              </div>
              <div className="flex gap-2 relative z-10">
                <button 
                  onClick={() => {
                    updateUserPermission(user.id, { 
                      approvalStatus: 'approved', 
                      role: user.requestedRole || 'staff',
                      canCreateOrder: user.requestedRole === 'staff'
                    });
                  }}
                  className="flex items-center gap-1 px-3 py-1.5 rounded bg-green-500/20 text-green-400 hover:bg-green-500/40 transition text-xs font-bold"
                >
                  <Check size={14} /> 承認
                </button>
                <button 
                  onClick={() => {
                    updateUserPermission(user.id, { approvalStatus: 'rejected' });
                  }}
                  className="flex items-center gap-1 px-3 py-1.5 rounded bg-orange-500/20 text-orange-400 hover:bg-orange-500/40 transition text-xs font-bold"
                >
                  <X size={14} /> 拒否
                </button>
                <button 
                  onClick={() => setDeleteConfirmUser(user.id)}
                  disabled={user.userCode === 'minatoto' || user.loginId === 'minatoto1112'}
                  className="flex items-center gap-1 px-3 py-1.5 rounded bg-red-500/20 text-red-500 hover:bg-red-500/40 transition text-xs font-bold ml-2 disabled:opacity-30"
                >
                  <Trash2 size={14} /> 削除
                </button>
              </div>

              {deleteConfirmUser === user.id && (
                <div className="absolute inset-0 bg-black/90 p-4 rounded-xl flex flex-col justify-center items-center gap-3 z-10 border border-red-500/50">
                  <div className="text-red-400 text-sm font-bold text-center">
                    {user.displayName} の申請を削除しますか？<br/>
                    <span className="text-xs font-normal text-gray-400">この操作により、このユーザーは利用できなくなります。</span>
                  </div>
                  <input 
                    type="text" 
                    placeholder="削除理由を入力してください"
                    value={deleteReason}
                    onChange={e => setDeleteReason(e.target.value)}
                    className="w-full max-w-sm bg-black/50 border border-white/20 rounded px-3 py-2 text-sm text-white"
                  />
                  <div className="flex gap-3">
                    <button onClick={() => { setDeleteConfirmUser(null); setDeleteReason(''); }} className="px-4 py-2 text-xs bg-gray-600 rounded">キャンセル</button>
                    <button 
                      onClick={() => handleDelete(user.id)} 
                      disabled={!deleteReason.trim()}
                      className="px-4 py-2 text-xs bg-red-600 text-white font-bold rounded disabled:opacity-50"
                    >
                      削除実行
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
          {pendingUsers.length === 0 && (
            <p className="text-xs text-gray-500 p-8 border border-dashed border-white/10 rounded-xl text-center">承認待ちのユーザーはいません</p>
          )}
        </div>
      )}

      {activeSubTab === 'active' && (
        <div className="grid gap-3">
          {activeUsers.map(user => (
            <div key={user.id} className="glass-panel p-4 rounded-xl border-l-2 border-[#d4af37] relative">
              <div className="flex justify-between items-start mb-3 border-b border-white/10 pb-3">
                <div>
                  <div className="font-medium text-sm flex items-center gap-2">
                    {user.displayName}
                    {user.id === currentUser?.id && <span className="text-[9px] bg-white/20 px-1.5 py-0.5 rounded text-white uppercase tracking-wider">You</span>}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">@{user.loginId}</div>
                </div>
                
                <select 
                  value={user.role} 
                  onChange={(e) => updateUserPermission(user.id, { role: e.target.value as UserRole })}
                  disabled={user.id === currentUser?.id}
                  className="bg-black/50 border border-[#d4af37]/30 text-xs text-[#d4af37] px-2 py-1 rounded outline-none w-24"
                >
                  <option value="staff">スタッフ</option>
                  <option value="cast">キャスト</option>
                  <option value="admin">運営</option>
                </select>
              </div>

              <div className="flex items-center justify-between pt-1 relative z-10">
                <div className="flex items-center gap-4">
                  <div className="text-xs text-gray-400 flex items-center gap-1">
                    注文権限 {user.canCreateOrder ? <Unlock size={12} className="text-green-500"/> : <Lock size={12} className="text-gray-500"/>}
                  </div>
                  <button 
                    onClick={() => {
                      updateUserPermission(user.id, { canCreateOrder: !user.canCreateOrder });
                    }}
                    disabled={user.id === currentUser?.id && user.role === 'admin'}
                    className={cn(
                      "px-3 py-1 rounded text-[10px] transition",
                      user.canCreateOrder 
                        ? "bg-[#7b1113]/30 text-[#ff8c8c] border border-[#7b1113] hover:bg-[#7b1113]/50" 
                        : "bg-green-500/10 text-green-500 border border-green-500/50 hover:bg-green-500/30"
                    )}
                  >
                    {user.canCreateOrder ? '権限を剥奪' : '権限を付与'}
                  </button>
                </div>
                
                <button 
                  onClick={() => setDeleteConfirmUser(user.id)}
                  disabled={
                    (user.id === currentUser?.id && activeUsers.filter(u => u.role === 'admin').length === 1) ||
                    (user.userCode === 'minatoto' || user.loginId === 'minatoto1112')
                  }
                  className="text-[10px] text-red-500 hover:bg-red-500/20 px-2 py-1 rounded transition disabled:opacity-50"
                >
                  退会処理 (削除)
                </button>
              </div>

              {deleteConfirmUser === user.id && (
                <div className="absolute inset-0 bg-black/95 p-4 rounded-xl flex flex-col justify-center items-center gap-3 z-10 border border-red-500/50">
                  <div className="text-red-400 text-sm font-bold text-center">
                    {user.displayName} を退会・削除処理しますか？<br/>
                    <span className="text-[10px] font-normal text-gray-400 mt-1 block">物理削除ではなく、論理削除（利用不可）になります。<br/>過去の履歴は維持されます。</span>
                  </div>
                  <input 
                    type="text" 
                    placeholder="削除理由を入力してください"
                    value={deleteReason}
                    onChange={e => setDeleteReason(e.target.value)}
                    className="w-full max-w-sm bg-black/50 border border-white/20 rounded px-3 py-2 text-sm text-white"
                  />
                  <div className="flex gap-3">
                    <button onClick={() => { setDeleteConfirmUser(null); setDeleteReason(''); }} className="px-4 py-2 text-xs bg-gray-600 hover:bg-gray-500 rounded text-white">キャンセル</button>
                    <button 
                      onClick={() => handleDelete(user.id)} 
                      disabled={!deleteReason.trim()}
                      className="px-4 py-2 text-xs bg-red-600 hover:bg-red-500 text-white font-bold rounded disabled:opacity-50"
                    >
                      削除実行
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {activeSubTab === 'deleted' && (
        <div className="space-y-3">
          {deletedUsers.map(user => (
            <div key={user.id} className="glass-panel p-4 rounded-xl border border-red-500/30 bg-red-900/10 flex flex-col gap-2 relative">
              <div className="flex items-center justify-between">
                <div className="font-bold text-red-400">{user.displayName} <span className="text-xs text-gray-500">(@{user.loginId})</span></div>
                <span className="text-[10px] bg-red-500 text-white px-2 py-0.5 rounded uppercase font-bold tracking-widest">Deleted</span>
              </div>
              <div className="text-xs text-gray-400 space-y-1 bg-black/40 p-3 rounded-lg border border-red-500/10">
                <div className="text-[#e5c158] font-bold">理由: {user.deleteReason}</div>
                <div>削除日時: {user.deletedAt ? new Date(user.deletedAt).toLocaleString() : '-'}</div>
                <div>削除者: {users.find(u => u.id === user.deletedBy)?.displayName || user.deletedBy}</div>
                <div>元の権限: {user.role}</div>
              </div>
              <div className="flex justify-end mt-2">
                <button 
                  onClick={() => handleRestore(user.id)}
                  className="flex items-center gap-1 text-xs px-3 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded transition"
                >
                  <Undo size={14} /> 復元（承認待ちへ戻す）
                </button>
                <button 
                  onClick={() => setDeleteConfirmUser(user.id)}
                  className="flex items-center gap-1 text-xs px-3 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/30 rounded transition ml-2"
                >
                  <Trash2 size={14} /> 完全削除
                </button>
              </div>

              {deleteConfirmUser === user.id && (
                <div className="absolute inset-0 bg-black/95 p-4 rounded-xl flex flex-col justify-center items-center gap-3 z-10 border border-red-500/50">
                  <div className="text-red-400 text-sm font-bold text-center">
                    {user.displayName} を完全に削除しますか？<br/>
                    <span className="text-[10px] font-normal text-gray-400 mt-1 block">この操作は取り消せません。ユーザーデータはデータベースから完全に消去されます。</span>
                  </div>
                  <input 
                    type="text" 
                    placeholder="完全削除を実行するには「削除」と入力してください"
                    value={deleteReason}
                    onChange={e => setDeleteReason(e.target.value)}
                    className="w-full max-w-sm bg-black/50 border border-red-500/50 rounded px-3 py-2 text-sm text-white"
                  />
                  <div className="flex gap-3">
                    <button onClick={() => { setDeleteConfirmUser(null); setDeleteReason(''); }} className="px-4 py-2 text-xs bg-gray-600 hover:bg-gray-500 rounded text-white">キャンセル</button>
                    <button 
                      onClick={async () => {
                        try {
                          await hardDeleteUser(user.id);
                          setDeleteConfirmUser(null);
                          setDeleteReason('');
                        } catch (e: any) {
                          alert(e.message || '完全削除に失敗しました');
                        }
                      }} 
                      disabled={deleteReason !== '削除'}
                      className="px-4 py-2 text-xs bg-red-600 hover:bg-red-500 text-white font-bold rounded disabled:opacity-50"
                    >
                      完全削除を実行
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
          {deletedUsers.length === 0 && (
            <p className="text-xs text-gray-500 p-8 border border-dashed border-white/10 rounded-xl text-center">削除済みユーザーはいません</p>
          )}
        </div>
      )}
      {activeSubTab === 'logs' && (
        <div className="space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-white/5 border-b border-white/10 text-gray-400 uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3 font-medium">日時</th>
                  <th className="px-4 py-3 font-medium">アクション</th>
                  <th className="px-4 py-3 font-medium">対象ユーザー</th>
                  <th className="px-4 py-3 font-medium">理由/詳細</th>
                  <th className="px-4 py-3 font-medium">実行者</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {userDeleteLogs.map(log => (
                  <tr key={log.id} className="hover:bg-white/5 transition">
                    <td className="px-4 py-3 text-gray-500">{new Date(log.createdAt).toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className={cn(
                        "px-2 py-0.5 rounded-full font-bold uppercase text-[9px]",
                        log.actionType === 'delete' ? "bg-red-500/20 text-red-500" : "bg-blue-500/20 text-blue-400"
                      )}>
                        {log.actionType === 'delete' ? '削除' : '復元'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-white">{log.targetUserNameSnapshot}</div>
                      <div className="text-gray-500">ID: {log.targetUserId}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-400 max-w-xs truncate">{log.deleteReason}</td>
                    <td className="px-4 py-3 text-gray-500">{users.find(u => u.id === log.deletedBy)?.displayName || log.deletedBy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {userDeleteLogs.length === 0 && (
            <p className="text-xs text-center py-12 text-gray-500 border border-dashed border-white/10 rounded-xl">ログはありません</p>
          )}
        </div>
      )}
    </div>
  );
}
