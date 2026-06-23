import React, { useState, useEffect } from 'react';
import { useVrcBarApp, StaffTaskType, STAFF_TASK_LABELS, EventStatus } from '../../lib/VrcBarAppContext';
import { Users, CheckCircle, Copy } from 'lucide-react';
import { cn } from '../../lib/utils';
import { ProfileAvatar } from '../../components/ui/ProfileAvatar';

export function StaffTaskManagerPage() {
  const { users, staffTasks, updateStaffTasks } = useVrcBarApp();
  const staffs = users.filter(u => (u.role === 'staff' || u.role === 'admin') && !u.isDeleted);

  const TABS: { id: EventStatus, label: string }[] = [
    { id: 'before_open', label: '営業前' },
    { id: 'rotation_1', label: '第1ローテ' },
    { id: 'rotation_2', label: '第2ローテ' },
    { id: 'rotation_3', label: '第3ローテ' },
    { id: 'rotation_4', label: '第4ローテ' },
  ];

  const [activeTab, setActiveTab] = useState<EventStatus>('before_open');
  const [localTasks, setLocalTasks] = useState<Record<string, StaffTaskType[]>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync tasks for the current active tab
  useEffect(() => {
    const tasksForTab = staffs.reduce((acc, staff) => {
      acc[staff.id] = staffTasks.find(st => st.staffId === staff.id && st.statusType === activeTab)?.tasks || [];
      return acc;
    }, {} as Record<string, StaffTaskType[]>);
    setLocalTasks(tasksForTab);
  }, [activeTab, staffTasks, staffs.length]); // Intentionally omitting staffs reference to avoid re-renders

  const toggleTask = (staffId: string, task: StaffTaskType) => {
    setLocalTasks(prev => {
      const tasks = prev[staffId] || [];
      if (tasks.includes(task)) {
        return { ...prev, [staffId]: tasks.filter(t => t !== task) };
      } else {
        return { ...prev, [staffId]: [...tasks, task] };
      }
    });
  };

  const handleSave = () => {
    Object.keys(localTasks).forEach(staffId => {
      updateStaffTasks(activeTab, staffId, localTasks[staffId]);
    });
    setToastMessage(`${TABS.find(t => t.id === activeTab)?.label} のスタッフ担当を保存しました`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleCopyFrom = (fromStatus: EventStatus) => {
    if (confirm(`${TABS.find(t => t.id === fromStatus)?.label} の設定をコピーしますか？\n（保存ボタンを押すまで確定されません）`)) {
      const tasksToCopy = staffs.reduce((acc, staff) => {
        acc[staff.id] = staffTasks.find(st => st.staffId === staff.id && st.statusType === fromStatus)?.tasks || [];
        return acc;
      }, {} as Record<string, StaffTaskType[]>);
      setLocalTasks(tasksToCopy);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-[#111] border border-[#d4af37]/30 text-white px-6 py-3 rounded-full text-sm font-medium shadow-lg flex items-center gap-2 animate-in slide-in-from-top-4">
          <CheckCircle size={16} className="text-[#d4af37]" />
          {toastMessage}
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-black/30 p-4 rounded-xl border border-[#d4af37]/20">
        <h3 className="text-xl font-lux text-white flex items-center gap-2 w-full md:w-auto">
          <Users size={20} className="text-[#d4af37]" />
          スタッフ担当管理
        </h3>
        <button onClick={handleSave} className="w-full md:w-auto btn-gold px-6 py-2 text-sm font-bold rounded-full">
          保存する
        </button>
      </div>

      <div className="flex overflow-x-auto custom-scrollbar border-b border-white/10 pb-1">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "px-6 py-3 text-sm font-bold whitespace-nowrap border-b-2 transition-all",
              activeTab === tab.id
                ? "border-[#d4af37] text-[#d4af37] bg-[#d4af37]/5"
                : "border-transparent text-gray-500 hover:text-gray-300 hover:bg-white/5"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex justify-end gap-2 mb-4 overflow-x-auto">
        <span className="text-xs text-gray-500 self-center whitespace-nowrap">他からコピー：</span>
        {TABS.filter(t => t.id !== activeTab).map(tab => (
          <button
            key={tab.id}
            onClick={() => handleCopyFrom(tab.id)}
            className="flex items-center gap-1 text-[10px] px-2 py-1 bg-white/5 hover:bg-white/10 rounded border border-white/10 transition whitespace-nowrap"
          >
            <Copy size={12} /> {tab.label}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {staffs.length === 0 ? (
          <div className="text-center py-10 text-gray-500">スタッフ・アドミン権限のユーザーがいません</div>
        ) : (
          staffs.map(staff => {
            const selectedTasks = localTasks[staff.id] || [];
            return (
              <div key={staff.id} className="glass-panel p-5 rounded-xl border border-white/10">
                <div className="flex items-center gap-3 mb-4">
                  <ProfileAvatar
                    src={staff.iconUrl}
                    name={staff.displayName}
                    version={staff.profileImageUpdatedAt}
                    className="h-10 w-10 rounded-full border border-[#d4af37]/50 bg-black"
                    fallbackClassName="text-xs text-gray-500"
                  />
                  <div>
                    <h4 className="font-bold text-white text-lg">{staff.displayName}</h4>
                    <p className="text-xs text-gray-400">@{staff.userCode}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  {(Object.entries(STAFF_TASK_LABELS) as [StaffTaskType, string][]).map(([taskKey, label]) => {
                    const isSelected = selectedTasks.includes(taskKey);
                    return (
                      <button
                        key={taskKey}
                        onClick={() => toggleTask(staff.id, taskKey)}
                        className={cn(
                          "px-4 py-2 rounded-lg text-sm border transition flex items-center gap-2",
                          isSelected 
                            ? "bg-[#d4af37]/20 border-[#d4af37] text-[#d4af37]" 
                            : "bg-black/50 border-white/10 text-gray-400 hover:text-white hover:bg-white/5"
                        )}
                      >
                        <div className={cn(
                          "w-4 h-4 rounded-full border flex items-center justify-center",
                          isSelected ? "border-[#d4af37] bg-[#d4af37]" : "border-gray-500"
                        )}>
                          {isSelected && <div className="w-2 h-2 rounded-full bg-black"></div>}
                        </div>
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
