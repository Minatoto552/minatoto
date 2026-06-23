import React, { useState } from 'react';
import { useVrcBarApp, RotationNumber, EventStatus, TABLES } from '../../lib/VrcBarAppContext';
import { RefreshCw, Users, Settings, Save, AlertTriangle } from 'lucide-react';
import { cn } from '../../lib/utils';
import { RotationTab } from '../../components/ui/RotationTab';
import { TableCard } from '../../components/ui/TableCard';
import { RotationLabel } from '../../components/ui/RotationLabel';
import { useDraggableScroll } from '../../hooks/useDraggableScroll';

const EVENT_STATUS_LABELS: Record<EventStatus, string> = {
  before_open: '営業前',
  rotation_1: '第1ローテ',
  rotation_2: '第2ローテ',
  rotation_3: '第3ローテ',
  rotation_4: '第4ローテ',
  closed: '営業終了',
};

const getStatusLabel = (status: EventStatus) => EVENT_STATUS_LABELS[status];

export function RotationManagerPage() {
  const { eventStatus, currentRotationNumber, updateEventStatus, rotationAssignments, updateRotationAssignment, users } = useVrcBarApp();
  const [activeTab, setActiveTab] = useState<RotationNumber>(1);
  const [showConfirm, setShowConfirm] = useState<EventStatus | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const scrollRef = useDraggableScroll<HTMLDivElement>();

  const casts = users.filter(u => (u.role === 'cast' || u.role === 'admin') && !u.isDeleted);

  const handleUpdateEventStatus = (status: EventStatus) => {
    updateEventStatus(status);
    setShowConfirm(null);
    setToastMessage(`現在の状態を「${getStatusLabel(status)}」に更新しました`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Current Rotation Status */}
      <div className="glass-panel p-6 rounded-xl border-[#d4af37]/50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#d4af37] opacity-10 rounded-full blur-[80px] pointer-events-none"></div>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
          <div>
            <h3 className="text-xl font-sans gold-gradient-text flex items-center gap-2">
              <RefreshCw className={cn(eventStatus !== 'before_open' && eventStatus !== 'closed' ? "animate-spin-slow" : "")} size={20} />
              <span className="font-bold">現在：</span>
              {eventStatus.startsWith('rotation_') ? (
                <RotationLabel rotationNumber={eventStatus.replace('rotation_', '')} />
              ) : (
                <span className="font-bold">{getStatusLabel(eventStatus)}</span>
              )}
            </h3>
            <p className="text-xs text-gray-400 mt-1">現在の状態を切り替えると、全ユーザーの画面に即時反映されます。</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {(['before_open', 'rotation_1', 'rotation_2', 'rotation_3', 'rotation_4', 'closed'] as EventStatus[]).map(status => (
              <button
                key={status}
                onClick={() => setShowConfirm(status)}
                disabled={eventStatus === status}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm transition-all border",
                  eventStatus === status
                    ? "bg-[#d4af37]/20 border-[#d4af37] text-[#d4af37] font-bold cursor-default"
                    : "bg-black/50 border-white/10 text-gray-400 hover:bg-white/10 hover:text-white"
                )}
              >
                {status === 'before_open' ? '営業前にする' : status === 'closed' ? '営業終了にする' : `${getStatusLabel(status)}開始`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111] border border-[#d4af37]/50 p-6 rounded-2xl w-full max-w-sm space-y-4 shadow-[0_0_30px_rgba(212,175,55,0.2)]">
            <div className="flex items-center gap-3 text-[#d4af37] mb-2">
              <AlertTriangle size={24} />
              <h3 className="text-lg font-bold">営業状態を更新</h3>
            </div>
            <p className="text-sm text-gray-300">現在の状態を「{getStatusLabel(showConfirm)}」に変更しますか？<br/><br/>全ユーザーの画面表示や注文受付状態が切り替わります。</p>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setShowConfirm(null)} className="flex-1 bg-white/10 hover:bg-white/20 text-white py-2 rounded-lg text-sm transition">キャンセル</button>
              <button onClick={() => handleUpdateEventStatus(showConfirm)} className="flex-1 btn-gold py-2 rounded-lg text-sm transition font-bold">更新する</button>
            </div>
          </div>
        </div>
      )}

      {/* Rotation Settings */}
      <div className="space-y-4">
        <h4 className="text-lg font-medium text-[#d4af37] flex items-center gap-2">
          <Settings size={18} /> ローテーション設定
        </h4>
        
        {/* Tabs */}
        <div ref={scrollRef} className="flex gap-2 border-b border-white/10 pb-2 overflow-x-auto scrollbar-none cursor-grab active:cursor-grabbing">
          {([0, 1, 2, 3, 4] as RotationNumber[]).map(num => (
            <RotationTab
              key={num}
              label={<RotationLabel rotationNumber={num} className={cn(activeTab === num ? "text-[#d4af37]" : "text-gray-400 font-normal")} />}
              isActive={activeTab === num}
              isCurrent={currentRotationNumber === num && eventStatus.startsWith('rotation_')}
              onClick={() => setActiveTab(num)}
            />
          ))}
        </div>

        {/* Tab Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {TABLES.map(table => {
            const assignment = rotationAssignments.find(a => a.rotationNumber === activeTab && a.tableId === table);
            const hasCast = assignment?.castId1 || assignment?.castId2 || assignment?.castId3;
            
            return (
              <TableCard 
                key={table} 
                tableId={table} 
                active={!!hasCast}
                badge={hasCast ? <span className="text-[10px] bg-[#d4af37] text-black px-2 py-0.5 rounded-full font-bold">配置あり</span> : undefined}
              >
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-gray-400 block mb-1">担当キャスト1 (必須)</label>
                    <select
                      value={assignment?.castId1 || ''}
                      onChange={(e) => updateRotationAssignment(activeTab, table, { castId1: e.target.value || null })}
                      className="w-full bg-black/60 border border-white/10 rounded-lg p-2 text-sm outline-none focus:border-[#d4af37]"
                    >
                      <option value="">-- 未設定 --</option>
                      {casts.map(c => <option key={`c1-${c.id}`} value={c.id} disabled={assignment?.castId2 === c.id || assignment?.castId3 === c.id}>{c.displayName}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 block mb-1">担当キャスト2</label>
                    <select
                      value={assignment?.castId2 || ''}
                      onChange={(e) => updateRotationAssignment(activeTab, table, { castId2: e.target.value || null })}
                      className="w-full bg-black/60 border border-white/10 rounded-lg p-2 text-sm outline-none focus:border-[#d4af37]"
                    >
                      <option value="">-- 未設定 --</option>
                      {casts.map(c => <option key={`c2-${c.id}`} value={c.id} disabled={assignment?.castId1 === c.id || assignment?.castId3 === c.id}>{c.displayName}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 block mb-1">担当キャスト3</label>
                    <select
                      value={assignment?.castId3 || ''}
                      onChange={(e) => updateRotationAssignment(activeTab, table, { castId3: e.target.value || null })}
                      className="w-full bg-black/60 border border-white/10 rounded-lg p-2 text-sm outline-none focus:border-[#d4af37]"
                    >
                      <option value="">-- 未設定 --</option>
                      {casts.map(c => <option key={`c3-${c.id}`} value={c.id} disabled={assignment?.castId1 === c.id || assignment?.castId2 === c.id}>{c.displayName}</option>)}
                    </select>
                  </div>
                </div>
              </TableCard>
            );
          })}
        </div>
      </div>

      {toastMessage && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-[#d4af37] text-black px-6 py-3 rounded-full font-bold shadow-[0_0_20px_rgba(212,175,55,0.4)] animate-in slide-in-from-bottom-5 fade-in z-50">
          {toastMessage}
        </div>
      )}
    </div>
  );
}
