import React from 'react';
import { useMockApp } from '../../lib/MockAppContext';
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { cn } from '../../lib/utils';
import { TableNumberLabel } from './TableNumberLabel';

export function EmergencyCallNotification() {
  const { emergencyCalls, currentUser, handleEmergencyCall, cancelEmergencyCall } = useMockApp();
  const activeCalls = [...emergencyCalls]
    .filter(c => c.status === 'active')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  if (activeCalls.length === 0) return null;

  return (
    <div className="fixed top-24 left-1/2 -translate-x-1/2 w-[95%] max-w-xl z-[100] space-y-3 pointer-events-none">
      {activeCalls.map(call => (
        <div 
          key={call.id} 
          className="bg-red-600/95 backdrop-blur-xl border-2 border-white/40 text-white rounded-2xl shadow-[0_20px_50px_rgba(220,38,38,0.5)] p-5 pointer-events-auto relative overflow-hidden"
        >
          {/* Decorative background alert icon */}
          <AlertTriangle className="absolute -right-4 -bottom-4 text-white/10 w-32 h-32 rotate-12" />
          
          <div className="flex items-start gap-4 relative z-10">
            <div className="bg-white/20 p-2.5 rounded-full flex-shrink-0 animate-pulse">
              <AlertTriangle className="text-white" size={28} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-2">
                <span className="font-sans font-black text-xl tracking-widest uppercase flex items-center gap-2">
                  <span className="inline-block w-2 h-2 rounded-full bg-white animate-ping"></span>
                  緊急ヘルプ発生
                </span>
                <span className="text-xs font-mono bg-black/20 px-2 py-0.5 rounded-full border border-white/10">
                  {new Date(call.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 my-3">
                <div className="bg-white/10 p-3 rounded-xl border border-white/10 backdrop-blur-sm">
                  <div className="text-[10px] uppercase font-bold tracking-widest opacity-60 mb-1">卓番号 (Table)</div>
                  <div className="text-3xl font-sans font-black leading-none flex items-baseline gap-1">
                    <TableNumberLabel tableId={call.tableId} showPrefix={false} className="text-white font-sans font-black" />
                    <span className="text-xs font-bold opacity-60">卓</span>
                  </div>
                </div>
                <div className="bg-white/10 p-3 rounded-xl border border-white/10 backdrop-blur-sm">
                  <div className="text-[10px] uppercase font-bold tracking-widest opacity-60 mb-1">キャスト (Cast)</div>
                  <div className="text-xl font-sans font-black truncate leading-tight pt-1">
                    {call.castNameSnapshot}
                  </div>
                </div>
              </div>

              {call.message && (
                <div className="bg-black/30 p-3 rounded-xl text-sm mb-4 border border-white/5 font-medium">
                  {call.message}
                </div>
              )}
              
              <div className="flex gap-2">
                {(currentUser?.role === 'admin' || currentUser?.role === 'staff') && (
                  <button 
                    onClick={() => handleEmergencyCall(call.id, currentUser.id)}
                    className="flex-1 bg-white text-red-600 font-black py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-100 transition active:scale-95 shadow-lg text-sm uppercase tracking-wider"
                  >
                    <CheckCircle size={20} /> 対応済みにする
                  </button>
                )}
                {currentUser?.id === call.castUserId && (
                  <button 
                    onClick={() => cancelEmergencyCall(call.id, 'Self-canceled')}
                    className="flex-1 bg-red-900/40 text-white font-black py-3 rounded-xl border border-white/30 flex items-center justify-center gap-2 hover:bg-red-900/60 transition active:scale-95 text-sm uppercase tracking-wider"
                  >
                    <XCircle size={20} /> 取り消す
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
