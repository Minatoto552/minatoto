import React, { useState } from 'react';
import { useMockApp, UserProfile, UserRole, TABLES } from '../../lib/MockAppContext';
import { ShieldAlert, Users, Grid, History, Check, X, Shield, Lock, Unlock, List, Trash2, Undo, RefreshCw, ClipboardList, Megaphone, AlertTriangle, Database, Ticket, Star, Settings } from 'lucide-react';
import { cn } from '../../lib/utils';
import { MenuEditorPage } from './MenuEditorPage';
import { RotationManagerPage } from './RotationManagerPage';
import { StaffTaskManagerPage } from './StaffTaskManagerPage';
import { AnnouncementManagerPage } from './AnnouncementManagerPage';
import { TimedAnnouncementManagerPage } from './TimedAnnouncementManagerPage';
import { UserManagerPage } from './UserManagerPage';
import { EmergencyCallHistoryPage } from './EmergencyCallHistoryPage';
import { LotteryManagerPage } from './LotteryManagerPage';
import { MemberManagerPage } from './MemberManagerPage';
import { AttendanceManagerPage } from './AttendanceManagerPage';
import { TableNumberLabel } from '../../components/ui/TableNumberLabel';
import { Link } from 'react-router-dom';
import { useDraggableScroll } from '../../hooks/useDraggableScroll';
import { formatOrderItemLine } from '../../lib/orderUtils';

export function AdminPage() {
  const { orders, users, updateUserPermission, currentUser, restoreOrder, emergencyCalls, chinchiroSettings, updateChinchiroSettings } = useMockApp();
  const [activeTab, setActiveTab] = useState<'overview' | 'staff' | 'member' | 'rotation' | 'attendance' | 'staff_tasks' | 'announcement' | 'timed_announcement' | 'menu' | 'lottery' | 'history' | 'deleted' | 'emergency' | 'maintenance' | 'settings'>('overview');
  const scrollRef = useDraggableScroll<HTMLDivElement>();

  const activeOrders = orders.filter(o => !o.isDeleted);
  const deletedOrders = orders.filter(o => o.isDeleted);
  const pendingUsersCount = users.filter(u => u.approvalStatus === 'pending' && !u.isDeleted).length;
  const activeEmergencyCallsCount = emergencyCalls.filter(c => c.status === 'active').length;

  const pendingCount = activeOrders.filter(o => o.status === 'pending').length;
  const processingCount = activeOrders.filter(o => o.status === 'processing').length;
  const completedCount = activeOrders.filter(o => o.status === 'completed').length;
  const deliveredCount = activeOrders.filter(o => o.status === 'delivered').length;

  const [newChinchiroLimit, setNewChinchiroLimit] = useState(chinchiroSettings?.maxChallengesPer24h ?? 4);
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  const saveChinchiroSettings = async () => {
    setIsSavingSettings(true);
    try {
      await updateChinchiroSettings({ maxChallengesPer24h: newChinchiroLimit });
      alert('設定を保存しました。');
    } catch(e) {
      alert('保存に失敗しました');
    } finally {
      setIsSavingSettings(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-2 border-b border-[#d4af37]/20 pb-4">
        <ShieldAlert className="text-[#d4af37]" />
        <h2 className="font-lux text-2xl text-white">運営管理 (Admin)</h2>
      </div>

      <div ref={scrollRef} className="flex overflow-x-auto gap-2 pb-2 scrollbar-none cursor-grab active:cursor-grabbing">
        {[
          { id: 'overview', label: '全体状況', icon: Grid, badge: null },
          { id: 'staff', label: '従業員管理', icon: Users, badge: pendingUsersCount > 0 ? pendingUsersCount : null },
          { id: 'member', label: '会員様/スタンプ管理', icon: Star, badge: null },
          { id: 'attendance', label: 'シフト管理', icon: Check, badge: null },
          { id: 'rotation', label: 'ローテ管理', icon: RefreshCw, badge: null },
          { id: 'staff_tasks', label: 'スタッフ担当', icon: ClipboardList, badge: null },
          { id: 'announcement', label: '手動アナウンス', icon: Megaphone, badge: null },
          { id: 'timed_announcement', label: '時間指定アナウンス', icon: Megaphone, badge: null },
          { id: 'menu', label: 'メニュー管理', icon: List, badge: null },
          { id: 'lottery', label: '抽選管理', icon: Ticket, badge: null },
          { id: 'history', label: '注文履歴', icon: History, badge: null },
          { id: 'deleted', label: '削除済み注文', icon: Trash2, badge: null },
          { id: 'emergency', label: '緊急履歴', icon: AlertTriangle, badge: activeEmergencyCallsCount > 0 ? activeEmergencyCallsCount : null },
          { id: 'settings', label: 'ゲーム設定', icon: Settings, badge: null },
          { id: 'maintenance', label: 'データ保守', icon: Database, badge: null },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
               "flex items-center gap-2 px-4 py-2 rounded-full text-xs transition min-w-max relative",
               activeTab === tab.id ? "bg-[#d4af37] text-black font-semibold" : "glass-panel text-gray-400 hover:text-white"
            )}
          >
            <tab.icon size={14} />
            {tab.label}
            {tab.badge !== null && (
              <span className="absolute -top-1 -right-1 min-w-[16px] h-4 bg-red-600 text-white rounded-full flex items-center justify-center text-[10px] px-1 animate-pulse">
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mt-6">
          <StatCard title="申請待ち" count={pendingUsersCount} color="text-yellow-400" />
          <StatCard title="緊急ヘルプ" count={activeEmergencyCallsCount} color="text-red-600 animate-pulse font-black" />
          <StatCard title="未対応注文" count={pendingCount} color="text-red-400" />
          <StatCard title="対応中" count={processingCount} color="text-blue-400" />
          <StatCard title="作成完了" count={completedCount} color="text-green-400" />
          <StatCard title="お届け済み" count={deliveredCount} color="text-gray-400" />
        </div>
      )}

      {activeTab === 'menu' && (
        <MenuEditorPage />
      )}

      {activeTab === 'staff' && (
        <UserManagerPage />
      )}

      {activeTab === 'member' && (
        <MemberManagerPage />
      )}

      {activeTab === 'attendance' && (
        <div className="mt-6">
          <AttendanceManagerPage />
        </div>
      )}

      {activeTab === 'rotation' && (

        <div className="mt-6">
          <RotationManagerPage />
        </div>
      )}

      {activeTab === 'staff_tasks' && (
        <div className="mt-6">
          <StaffTaskManagerPage />
        </div>
      )}

      {activeTab === 'announcement' && (
        <div className="mt-6">
          <AnnouncementManagerPage />
        </div>
      )}

      {activeTab === 'timed_announcement' && (
        <div className="mt-6">
          <TimedAnnouncementManagerPage />
        </div>
      )}

      {activeTab === 'lottery' && (
        <div className="mt-6">
          <LotteryManagerPage />
        </div>
      )}

      {activeTab === 'history' && (
        <div className="space-y-4 mt-6">
          <h3 className="text-lg font-medium text-[#d4af37] mb-4">通常注文履歴</h3>
          {activeOrders.length === 0 ? (
             <p className="text-xs text-gray-400 text-center py-8 bg-black/30 rounded-xl border border-white/5">注文履歴はありません</p>
          ) : (
             <div className="space-y-3">
               {activeOrders.map(order => (
                  <div key={order.id} className="glass-panel p-4 rounded-xl border border-white/10 flex justify-between gap-4">
                     <div>
                       <div className="font-bold text-white mb-2"><TableNumberLabel tableId={order.tableId} /></div>
                       <div className="text-xs text-gray-400 space-y-1">
                         {order.items.map((item, idx) => (
                           <div key={idx}>- {formatOrderItemLine(item)}</div>
                         ))}
                       </div>
                     </div>
                     <div className="text-right flex flex-col justify-between">
                       <span className="text-xs bg-white/10 px-2 py-1 rounded text-white">{new Date(order.createdAt).toLocaleString()}</span>
                       <div className="text-xs text-gray-400 mt-2">注文者ID: {order.creatorId}</div>
                     </div>
                  </div>
               ))}
             </div>
          )}
        </div>
      )}

      {activeTab === 'deleted' && (
        <div className="space-y-4 mt-6">
          <h3 className="text-lg font-medium text-red-500 mb-4">削除済み注文履歴</h3>
          {deletedOrders.length === 0 ? (
             <p className="text-xs text-gray-400 text-center py-8 bg-black/30 rounded-xl border border-white/5">削除された注文はありません</p>
          ) : (
             <div className="space-y-3">
               {deletedOrders.map(order => (
                  <div key={order.id} className="glass-panel p-4 rounded-xl border border-red-500/30 bg-red-900/10 flex flex-col md:flex-row justify-between gap-4 relative">
                     <div className="flex-1">
                       <div className="flex items-center gap-3 mb-2">
                         <div className="font-bold text-red-400"><TableNumberLabel tableId={order.tableId} /></div>
                         <span className="text-[10px] bg-red-500 text-white px-2 py-0.5 rounded uppercase font-bold tracking-widest">Deleted</span>
                       </div>
                       <div className="text-xs text-gray-400 space-y-1 mb-3">
                         {order.items.map((item, idx) => (
                           <div key={idx} className="line-through opacity-70">- {formatOrderItemLine(item)}</div>
                         ))}
                       </div>
                       
                       <div className="bg-black/40 p-3 rounded text-xs space-y-1 border border-red-500/10">
                         <div className="text-[#e5c158]">削除理由: {order.deleteReason}</div>
                         <div className="text-gray-500 flex gap-2">
                           <span>削除者: <span className="text-gray-400">{users.find(u => u.id === order.deletedBy)?.displayName || order.deletedBy}</span></span>
                           <span>日時: <span className="text-gray-400">{order.deletedAt ? new Date(order.deletedAt).toLocaleString() : '-'}</span></span>
                         </div>
                       </div>
                     </div>
                     <div className="text-right flex flex-col items-end gap-3">
                       <span className="text-xs text-gray-500">注文日時:<br/>{new Date(order.createdAt).toLocaleString()}</span>
                       <button 
                         onClick={() => {
                           if(window.confirm('この注文を復元しますか？')) {
                             restoreOrder(order.id);
                           }
                         }}
                         className="flex items-center gap-1 text-xs px-3 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded mt-auto transition"
                       >
                         <Undo size={14} /> 復元する
                       </button>
                     </div>
                  </div>
               ))}
             </div>
          )}
        </div>
      )}

      {activeTab === 'emergency' && (
        <EmergencyCallHistoryPage />
      )}

      {activeTab === 'settings' && (
        <div className="space-y-6 mt-6">
          <div className="glass-panel p-6 rounded-xl border border-white/10 space-y-6">
            <h3 className="text-lg font-bold text-[#d4af37] border-b border-[#d4af37]/20 pb-2">ゲーム設定 (Game Settings)</h3>
            
            <div className="space-y-4 max-w-md">
              <div className="space-y-2">
                <label className="text-sm text-gray-300 font-bold block">チンチロ挑戦回数上限 (24時間あたり)</label>
                <div className="flex gap-4 items-center">
                  <input
                    type="number"
                    min="1"
                    value={newChinchiroLimit}
                    onChange={(e) => setNewChinchiroLimit(Number(e.target.value) || 1)}
                    className="flex-1 bg-black/50 border border-white/10 rounded-lg p-3 outline-none focus:border-[#d4af37] text-white"
                  />
                  <span className="text-gray-400">回</span>
                </div>
                <p className="text-xs text-gray-500">※ お客様一人あたりのデフォルト設定になります。ユーザー管理から個別の上限設定も可能です。</p>
              </div>

              <button
                onClick={saveChinchiroSettings}
                disabled={isSavingSettings || newChinchiroLimit < 1}
                className={cn(
                  "w-full btn-gold py-3 rounded-xl font-bold flex justify-center items-center",
                  isSavingSettings && "opacity-50 cursor-not-allowed"
                )}
              >
                {isSavingSettings ? '保存中...' : '設定を保存'}
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'maintenance' && (
        <div className="mt-8 flex flex-col items-center justify-center py-20 bg-black/40 border border-white/10 rounded-3xl space-y-6">
           <Database size={64} className="text-[#d4af37] opacity-20" />
           <div className="text-center">
             <h3 className="text-xl font-lux gold-gradient-text uppercase tracking-widest mb-2">System Maintenance</h3>
             <p className="text-sm text-gray-500 max-w-md mx-auto">履歴のリセット、データベースの最適化などの保守ツールを開きます。</p>
           </div>
           <Link to="/app/maintenance" className="btn-gold px-10 py-3 rounded-full flex items-center gap-3">
             <ShieldAlert size={20} /> メンテナンスツールを起動
           </Link>
        </div>
      )}
    </div>
  );
}

function StatCard({title, count, color}: {title: string, count: number, color: string}) {
  return (
    <div className="glass-panel p-4 rounded-xl flex flex-col items-center justify-center gap-2">
      <div className="text-xs text-gray-400 uppercase tracking-wider">{title}</div>
      <div className={cn("text-4xl font-light font-lux", color)}>{count}</div>
    </div>
  );
}
