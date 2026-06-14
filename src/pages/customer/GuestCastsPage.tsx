import React from 'react';
import { useMockApp } from '../../lib/MockAppContext';
import { Users } from 'lucide-react';
import { cn, getBusinessDate } from '../../lib/utils';
import { RotationLabel } from '../../components/ui/RotationLabel';
import { ProfileAvatar } from '../../components/ui/ProfileAvatar';

export function GuestCastsPage() {
  const { users, rotationAssignments, getCastCurrentTable, eventStatus, currentRotationNumber, attendanceRequests, shiftRequests } = useMockApp();

  const isEventOpen = eventStatus !== 'closed';

  const today = getBusinessDate();
  
  // Find the valid shift for today
  const targetShift = shiftRequests.find(s => s.businessDate === today && !s.isDeleted && s.status !== 'canceled');
  const validShiftsForToday = targetShift ? [targetShift.id] : [];

  const currentWorkingUsers = new Set(
    attendanceRequests
      .filter(a => validShiftsForToday.includes(a.shiftRequestId) && (a.status === 'present' || a.status === 'late' || a.status === 'leave_early'))
      .map(a => a.userId)
  );

  const todayCasts = users.filter(u => {
    if (u.isDeleted || u.approvalStatus !== 'approved') return false;
    if (!currentWorkingUsers.has(u.id)) return false;
    // They must be natively 'cast' OR an 'admin' with attendanceRole === 'cast'
    if (u.role === 'cast') return true;
    
    // Check if admin is working as cast today
    const req = attendanceRequests.find(a => a.userId === u.id && validShiftsForToday.includes(a.shiftRequestId));
    return req?.attendanceRole === 'cast';
  });

  const getCastStatus = (castId: string) => {
    if (!isEventOpen) return 'done';
    const currentTable = getCastCurrentTable(castId);
    if (currentTable) return 'working';
    const futureAssignments = rotationAssignments.filter(a => 
      (currentRotationNumber !== null && a.rotationNumber > currentRotationNumber) && 
      (a.castId1 === castId || a.castId2 === castId || a.castId3 === castId)
    );
    if (futureAssignments.length > 0) return 'break';
    if (eventStatus === 'before_open') return 'wait';
    return 'done';
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="text-center py-6 space-y-4">
        <h2 className="text-2xl font-lux text-white flex items-center justify-center gap-2">
          <Users className="text-[#d4af37]" />
          CASTS
        </h2>
        <p className="text-gray-400 text-xs mt-2 tracking-widest">本日の出勤キャスト</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {todayCasts.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500 border border-white/5 rounded-2xl bg-white/5">
            本日の出勤キャストはまだ登録されていません
          </div>
        ) : (
          todayCasts.map(cast => {
            const status = getCastStatus(cast.id);
            return (
              <div key={cast.id} className={cn(
                "glass-panel rounded-2xl border transition-all overflow-hidden flex flex-col relative",
                status === 'working' ? "border-[#d4af37]/50 shadow-[0_0_20px_rgba(212,175,55,0.15)] bg-gradient-to-b from-[#d4af37]/10 to-black/50" : "border-white/10"
              )}>
                {status === 'working' && (
                  <div className="absolute top-4 right-4 flex items-center gap-2 bg-black/60 px-3 py-1 rounded-full border border-[#d4af37]/30 z-10">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#d4af37] opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-[#d4af37]"></span>
                    </span>
                    <span className="text-[10px] text-[#d4af37] font-bold tracking-widest">接客中</span>
                  </div>
                )}
                <div className="aspect-square bg-black border-b border-white/10 relative overflow-hidden group">
                  <ProfileAvatar
                    src={cast.iconUrl}
                    name={cast.displayName}
                    version={cast.profileImageUpdatedAt}
                    className="h-full w-full rounded-none bg-gray-900 transition-transform duration-700 group-hover:scale-105"
                    fallbackClassName="text-5xl text-[#d4af37]/50"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent"></div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="font-bold text-white text-2xl drop-shadow-md">{cast.displayName}</h3>
                  </div>
                </div>
                
                <div className="p-4 flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] bg-white/10 text-gray-300 px-2 py-1 rounded-full whitespace-nowrap">
                      {status === 'break' ? '休憩中' : status === 'done' ? '本日の出番終了' : status === 'wait' ? '待機中' : '稼働中'}
                    </span>
                  </div>
                  
                  {cast.vrcName && (
                    <div className="text-xs text-gray-400">
                      <span className="opacity-60">VRChat:</span> {cast.vrcName}
                    </div>
                  )}
                  
                  <div className="space-y-2 mt-2 pt-2 border-t border-white/5">
                    <div className="flex gap-2 text-xs">
                      <span className="text-gray-500 w-16 shrink-0">現在:</span>
                      <span className="text-gray-300 font-medium">
                        {eventStatus === 'closed' ? '営業終了' :
                         status === 'working' ? `${currentRotationNumber === 0 ? '営業前' : `第${currentRotationNumber}ローテ`} / ${getCastCurrentTable(cast.id)}卓` :
                         status === 'break' ? '休憩中' :
                         status === 'done' ? '出番終了' : '現在卓なし'}
                      </span>
                    </div>

                    {status === 'working' && (() => {
                      const tableId = getCastCurrentTable(cast.id);
                      if (!tableId || currentRotationNumber === null) return null;
                      const a = rotationAssignments.find(a => a.rotationNumber === currentRotationNumber && a.tableId === tableId);
                      if (!a) return null;
                      
                      const cowokers = [a.castId1, a.castId2, a.castId3]
                        .filter(Boolean)
                        .filter(id => id !== cast.id)
                        .map(id => users.find(u => u.id === id)?.displayName)
                        .filter(Boolean);
                        
                      if (cowokers.length === 0) return null;

                      return (
                        <div className="flex gap-2 text-xs">
                          <span className="text-gray-500 w-16 shrink-0">同卓:</span>
                          <span className="text-gray-400">{cowokers.join('、')}</span>
                        </div>
                      );
                    })()}

                    <div className="flex gap-2 text-xs">
                      <span className="text-gray-500 w-16 shrink-0">参加:</span>
                      <div className="flex flex-wrap gap-1">
                        {Array.from(new Set(
                          rotationAssignments
                            .filter(a => a.castId1 === cast.id || a.castId2 === cast.id || a.castId3 === cast.id)
                            .map(a => a.rotationNumber)
                        ))
                          .sort((x, y) => (x as number) - (y as number))
                          .map(rot => (
                            <span key={rot} className="text-[10px] bg-white/5 text-gray-400 px-1.5 py-0.5 rounded">
                              {rot === 0 ? '営業前' : `第${rot}`}
                            </span>
                          ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
