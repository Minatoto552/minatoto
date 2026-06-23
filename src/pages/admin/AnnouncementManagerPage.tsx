import React, { useState } from 'react';
import { useVrcBarApp, Announcement, AnnouncementTarget, AnnouncementType } from '../../lib/VrcBarAppContext';
import { Bell, Megaphone, Clock, Trash2, Edit } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useDraggableScroll } from '../../hooks/useDraggableScroll';

export function AnnouncementManagerPage() {
  const { announcements, addAnnouncement, updateAnnouncement, deleteAnnouncement } = useVrcBarApp();
  
  const [activeTab, setActiveTab] = useState<'create' | 'active'>('create');
  const scrollRef = useDraggableScroll<HTMLDivElement>();
  
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [type, setType] = useState<AnnouncementType>('normal');
  const [targetRole, setTargetRole] = useState<AnnouncementTarget>('all');

  const handleAddManual = () => {
    if (!title || !body) return;
    addAnnouncement({
      title, body, type, targetRole, announcementMode: 'manual', isActive: true
    });
    setTitle('');
    setBody('');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      <div className="flex items-center gap-2 border-b border-[#d4af37]/20 pb-4 mb-4">
        <Megaphone className="text-[#d4af37]" />
        <h2 className="font-lux text-2xl text-white tracking-widest">手動アナウンス</h2>
      </div>

      <div ref={scrollRef} className="flex p-1 bg-black/40 rounded-lg w-fit border border-[#d4af37]/20 mb-4 overflow-x-auto scrollbar-none cursor-grab active:cursor-grabbing">
        <button onClick={() => setActiveTab('create')} className={cn("px-4 py-2 rounded-md text-sm font-medium transition", activeTab === 'create' ? "bg-[#d4af37] text-black" : "text-gray-400 hover:text-white")}>新規作成</button>
        <button onClick={() => setActiveTab('active')} className={cn("px-4 py-2 rounded-md text-sm font-medium transition", activeTab === 'active' ? "bg-[#d4af37] text-black" : "text-gray-400 hover:text-white")}>表示中の管理</button>
      </div>

      {activeTab === 'create' && (
        <div className="space-y-4">
          <div className="glass-panel p-6 rounded-xl border border-white/10 space-y-4">
            <h3 className="text-xl font-lux text-[#d4af37]">新規手動アナウンス</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-400 block mb-1">タイトル</label>
                <input value={title} onChange={e => setTitle(e.target.value)} type="text" className="w-full bg-black/50 border border-white/10 rounded p-2 text-sm text-white focus:border-[#d4af37] outline-none" />
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-1">対象</label>
                <select value={targetRole} onChange={e => setTargetRole(e.target.value as any)} className="w-full bg-black/50 border border-white/10 rounded p-2 text-sm text-white focus:border-[#d4af37] outline-none">
                  <option value="all">全員</option>
                  <option value="staff">スタッフ</option>
                  <option value="cast">キャスト</option>
                  <option value="customer">お客様</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1">本文</label>
              <textarea value={body} onChange={e => setBody(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded p-2 text-sm text-white h-24 focus:border-[#d4af37] outline-none" placeholder="アナウンス内容..." />
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1">種別</label>
              <div className="flex gap-2">
                {(['normal', 'important', 'emergency'] as const).map(t => (
                  <button key={t} onClick={() => setType(t)} className={cn("px-4 py-1.5 rounded text-xs border transition", type === t ? "border-[#d4af37] text-white bg-[#d4af37]/20" : "border-white/10 text-gray-400")}>
                    {t === 'normal' ? '通常' : t === 'important' ? '重要 (ゴールド)' : '緊急 (レッド)'}
                  </button>
                ))}
              </div>
            </div>
            <button onClick={handleAddManual} className="btn-gold py-2 px-6 rounded-lg font-bold text-sm">作成＆表示開始</button>
          </div>
        </div>
      )}

      {activeTab === 'active' && (
        <div className="space-y-3">
          {announcements.filter(a => a.announcementMode === 'manual' && a.isActive).map(a => (
            <div key={a.id} className="bg-black/40 border border-[#d4af37]/30 p-4 rounded-xl flex justify-between items-center">
              <div>
                <span className={cn("text-xs px-2 py-0.5 rounded mr-3", 
                  a.type === 'normal' ? 'bg-blue-500/20 text-blue-300' :
                  a.type === 'important' ? 'bg-yellow-500/20 text-yellow-300' : 'bg-red-500/20 text-red-300'
                )}>{a.type}</span>
                <span className="font-bold">{a.title}</span>
                <p className="text-sm text-gray-400 mt-1">{a.body}</p>
              </div>
              <button onClick={() => updateAnnouncement(a.id, { isActive: false })} className="text-xs border border-white/20 px-3 py-1 rounded hover:bg-white/10">
                表示終了
              </button>
            </div>
          ))}
          {announcements.filter(a => a.announcementMode === 'manual' && a.isActive).length === 0 && <p className="text-gray-500 text-sm text-center">現在表示中の手動アナウンスはありません</p>}
        </div>
      )}
    </div>
  );
}
