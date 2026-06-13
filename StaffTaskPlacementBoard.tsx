import React from 'react';
import { useMockApp, STAFF_TASK_LABELS, StaffTaskType, UserProfile, EventStatus } from '../../lib/MockAppContext';
import { cn } from '../../lib/utils';
import { User } from 'lucide-react';

interface StaffTaskPlacementBoardProps {
  className?: string;
  highlightCurrentUserId?: string;
  activeStatus: EventStatus;
}

export function StaffTaskPlacementBoard({ className, highlightCurrentUserId, activeStatus }: StaffTaskPlacementBoardProps) {
  const { staffTasks, users } = useMockApp();

  const getStaffById = (id: string) => users.find(u => u.id === id);

  const tasks: StaffTaskType[] = ['drink', 'original_cocktail', 'delivery', 'food', 'announcement', 'check'];

  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", className)}>
      {tasks.map(taskType => {
        const assignedStaff = staffTasks
          .filter(st => st.statusType === activeStatus && st.tasks.includes(taskType))
          .map(st => getStaffById(st.staffId))
          .filter((s): s is UserProfile => !!s && !s.isDeleted);

        const isUserAssignedToThis = assignedStaff.some(s => s.id === highlightCurrentUserId);

        return (
          <div 
            key={taskType} 
            className={cn(
              "p-4 rounded-xl glass-panel border transition-all duration-300",
              isUserAssignedToThis 
                ? "border-[#d4af37] bg-[#d4af37]/10 shadow-[0_0_15px_rgba(212,175,55,0.1)]" 
                : "border-white/10"
            )}
          >
            <div className="flex justify-between items-center mb-3">
              <h4 className={cn(
                "font-bold text-sm",
                isUserAssignedToThis ? "text-[#d4af37]" : "text-gray-400"
              )}>
                {STAFF_TASK_LABELS[taskType]}
              </h4>
              {isUserAssignedToThis && (
                <span className="text-[10px] bg-[#d4af37] text-black px-1.5 py-0.5 rounded font-bold animate-pulse">
                  担当
                </span>
              )}
            </div>

            <div className="space-y-2">
              {assignedStaff.length > 0 ? (
                assignedStaff.map(staff => (
                  <div key={staff.id} className="flex items-center gap-3 bg-white/5 p-2 rounded-lg border border-white/5">
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center overflow-hidden border border-white/10 shrink-0">
                      {staff.iconUrl ? (
                        <img src={staff.iconUrl} alt={staff.displayName} className="w-full h-full object-cover" />
                      ) : (
                        <User size={16} className="text-gray-400" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium text-white truncate">{staff.displayName}</div>
                      <div className="text-[10px] text-gray-500 font-mono truncate">ID: {staff.userCode || staff.loginId}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-xs text-gray-600 italic py-2">未配置</div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
