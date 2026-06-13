import React, { useState } from 'react';
import { useMockApp, EmergencyCall } from '../../lib/MockAppContext';
import { History, Table, User, Clock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { cn } from '../../lib/utils';
import { TableNumberLabel } from '../../components/ui/TableNumberLabel';
import { useDraggableScroll } from '../../hooks/useDraggableScroll';

export function EmergencyCallHistoryPage() {
  const { emergencyCalls, users } = useMockApp();
  const [filter, setFilter] = useState<'all' | 'active' | 'handled' | 'canceled'>('all');
  const scrollRef = useDraggableScroll<HTMLDivElement>();

  const filteredCalls = emergencyCalls.filter(c => filter === 'all' || c.status === filter);

  const getStatusBadge = (status: EmergencyCall['status']) => {
    switch (status) {
      case 'active':
        return <span className="bg-red-600 text-white text-[10px] px-2 py-0.5 rounded font-black uppercase animate-pulse">Active</span>;
      case 'handled':
        return <span className="bg-green-600 text-white text-[10px] px-2 py-0.5 rounded font-black uppercase text-xs">Handled</span>;
      case 'canceled':
        return <span className="bg-gray-600 text-white text-[10px] px-2 py-0.5 rounded font-black uppercase text-xs">Canceled</span>;
    }
  };

  return (
    <div className="space-y-6 mt-6">
      <div ref={scrollRef} className="flex items-center justify-between gap-4 overflow-x-auto pb-2 scrollbar-none cursor-grab active:cursor-grabbing">
        <div className="flex gap-2">
          {(['all', 'active', 'handled', 'canceled'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap",
                filter === f ? "bg-white text-black" : "bg-white/5 text-gray-400 hover:bg-white/10"
              )}
            >
              {f === 'all' ? '全て' : f === 'active' ? '未対応' : f === 'handled' ? '対応済み' : '取り消し'}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {filteredCalls.map(call => (
          <div 
            key={call.id} 
            className={cn(
              "glass-panel p-4 rounded-2xl border transition relative overflow-hidden",
              call.status === 'active' ? "border-red-500/50 bg-red-900/5" : "border-white/10"
            )}
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "p-2 rounded-lg",
                  call.status === 'active' ? "bg-red-600 text-white" : "bg-white/10 text-gray-400"
                )}>
                  <AlertTriangle size={18} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <TableNumberLabel tableId={call.tableId} className="font-sans font-black text-white" />
                    {getStatusBadge(call.status)}
                  </div>
                  <div className="text-[10px] text-gray-500 font-mono mt-0.5">
                    {new Date(call.createdAt).toLocaleString()}
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="flex items-center gap-1.5 text-xs font-bold mb-1">
                  <User size={12} className="text-[#d4af37]" />
                  {call.castNameSnapshot}
                </div>
                <div className="text-[10px] text-gray-500">
                  第{call.rotationNumberSnapshot}ローテ
                </div>
              </div>
            </div>

            {call.message && (
              <div className="bg-black/30 p-3 rounded-xl text-xs text-gray-300 border border-white/5 mb-3 italic">
                "{call.message}"
              </div>
            )}

            {(call.handledAt || call.canceledAt) && (
              <div className="border-t border-white/5 pt-3 mt-3 grid grid-cols-2 gap-4">
                {call.status === 'handled' && (
                  <>
                    <div className="space-y-1">
                      <div className="text-[10px] text-gray-500 uppercase tracking-tighter">Handled By</div>
                      <div className="text-xs font-bold text-green-400">
                        {users.find(u => u.id === call.handledBy)?.displayName || call.handledBy}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-[10px] text-gray-500 uppercase tracking-tighter">Handled At</div>
                      <div className="text-xs text-gray-400">
                        {new Date(call.handledAt!).toLocaleTimeString()}
                      </div>
                    </div>
                  </>
                )}
                {call.status === 'canceled' && (
                  <>
                    <div className="space-y-1">
                      <div className="text-[10px] text-gray-500 uppercase tracking-tighter">Canceled At</div>
                      <div className="text-xs text-gray-400">
                        {new Date(call.canceledAt!).toLocaleTimeString()}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-[10px] text-gray-500 uppercase tracking-tighter">Reason</div>
                      <div className="text-xs text-gray-400 truncate">
                        {call.cancelReason || '-'}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        ))}

        {filteredCalls.length === 0 && (
          <div className="text-center py-12 border border-dashed border-white/10 rounded-2xl">
            <History size={40} className="mx-auto text-gray-600 mb-2 opacity-20" />
            <p className="text-xs text-gray-500">履歴が見つかりません</p>
          </div>
        )}
      </div>
    </div>
  );
}
