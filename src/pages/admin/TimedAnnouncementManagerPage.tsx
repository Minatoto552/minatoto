import React, { useState } from 'react';
import { useMockApp, AnnouncementTarget, RepeatType, AnnouncementType } from '../../lib/MockAppContext';
import { cn } from '../../lib/utils';
import { Clock, Plus, Trash2 } from 'lucide-react';

export function TimedAnnouncementManagerPage() {
  const { announcements, addAnnouncement, updateAnnouncement, deleteAnnouncement } = useMockApp();
  const scheduledAnnouncements = announcements.filter(a => a.announcementMode === 'scheduled');
  
  const [isCreating, setIsCreating] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [type, setType] = useState<AnnouncementType>('normal');
  const [targetRole, setTargetRole] = useState<AnnouncementTarget>('all');
  const [startAt, setStartAt] = useState('21:00');
  const [endAt, setEndAt] = useState('');
  const [displayDurationSeconds, setDisplayDurationSeconds] = useState<number | ''>('');
  const [repeatType, setRepeatType] = useState<RepeatType>('none');
  const [intervalMinutes, setIntervalMinutes] = useState<number | ''>('');

  const [filterActive, setFilterActive] = useState(true);

  const handleCreate = () => {
    if (!title || !body || !startAt) return;
    addAnnouncement({
      title, body, type, targetRole, announcementMode: 'scheduled', isActive: true, // true means enabled
      startAt, endAt: endAt || null, 
      displayDurationSeconds: typeof displayDurationSeconds === 'number' ? displayDurationSeconds : null,
      repeatType,
      intervalMinutes: typeof intervalMinutes === 'number' ? intervalMinutes : null,
    });
    setIsCreating(false);
    resetForm();
  };

  const resetForm = () => {
    setTitle(''); setBody(''); setType('normal'); setTargetRole('all');
    setStartAt('21:00'); setEndAt(''); setDisplayDurationSeconds(''); setRepeatType('none'); setIntervalMinutes('');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      <div className="flex items-center justify-between border-b border-[#d4af37]/20 pb-4">
        <div className="flex items-center gap-2">
          <Clock className="text-[#d4af37]" />
          <h2 className="font-lux text-2xl text-white tracking-widest">時間指定アナウンス</h2>
        </div>
        <button 
          onClick={() => setIsCreating(!isCreating)} 
          className="btn-gold px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2"
        >
          {isCreating ? 'キャンセル' : <><Plus size={16} /> 新規作成</>}
        </button>
      </div>

      {isCreating && (
        <div className="glass-panel p-6 rounded-xl border border-[#d4af37]/50 space-y-4 shadow-[0_0_15px_rgba(212,175,55,0.1)]">
          <h3 className="text-xl font-bold text-[#d4af37] mb-4">新規時間指定アナウンス</h3>
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
                <option value="admin">アドミン</option>
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

          <div className="border-t border-white/10 pt-4 mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs text-[#d4af37] font-bold block mb-1">表示開始時刻 (必須)</label>
              <input value={startAt} onChange={e => setStartAt(e.target.value)} type="time" className="w-full bg-black/50 border border-white/10 rounded p-2 text-sm text-white focus:border-[#d4af37] outline-none" />
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1">表示終了時刻 (任意)</label>
              <input value={endAt} onChange={e => setEndAt(e.target.value)} type="time" className="w-full bg-black/50 border border-white/10 rounded p-2 text-sm text-white focus:border-[#d4af37] outline-none" />
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1">表示時間 (秒) (任意)</label>
              <input value={displayDurationSeconds} onChange={e => setDisplayDurationSeconds(e.target.value ? Number(e.target.value) : '')} type="number" min="1" className="w-full bg-black/50 border border-white/10 rounded p-2 text-sm text-white focus:border-[#d4af37] outline-none" placeholder="例: 60" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-400 block mb-1">繰り返し設定</label>
              <select value={repeatType} onChange={e => setRepeatType(e.target.value as any)} className="w-full bg-black/50 border border-white/10 rounded p-2 text-sm text-white focus:border-[#d4af37] outline-none">
                <option value="none">なし</option>
                <option value="interval">一定間隔</option>
                <option value="before_rotation">毎ローテ前</option>
                <option value="after_rotation">毎ローテ後</option>
              </select>
            </div>
            {repeatType === 'interval' && (
              <div>
                <label className="text-xs text-gray-400 block mb-1">間隔 (分)</label>
                <input value={intervalMinutes} onChange={e => setIntervalMinutes(e.target.value ? Number(e.target.value) : '')} type="number" min="1" className="w-full bg-black/50 border border-white/10 rounded p-2 text-sm text-white focus:border-[#d4af37] outline-none" placeholder="例: 30" />
              </div>
            )}
          </div>

          <div className="pt-4 flex justify-end">
            <button onClick={handleCreate} disabled={!title || !body || !startAt} className="btn-gold py-2 px-8 rounded-lg font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed">
              保存
            </button>
          </div>
        </div>
      )}

      {/* List */}
      <div className="space-y-4">
        <div className="flex gap-2">
          <button onClick={() => setFilterActive(true)} className={cn("px-4 py-1.5 rounded-full text-xs font-bold transition", filterActive ? "bg-[#d4af37] text-black" : "bg-white/10 text-gray-400")}>有効のみ</button>
          <button onClick={() => setFilterActive(false)} className={cn("px-4 py-1.5 rounded-full text-xs font-bold transition", !filterActive ? "bg-[#d4af37] text-black" : "bg-white/10 text-gray-400")}>すべて</button>
        </div>

        <div className="grid gap-4">
          {scheduledAnnouncements.filter(a => filterActive ? a.isActive : true).map(a => (
            <div key={a.id} className={cn("glass-panel p-4 rounded-xl border flex flex-col md:flex-row justify-between gap-4", a.isActive ? "border-[#d4af37]/30" : "border-white/10 opacity-60")}>
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-3">
                  <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded", 
                    a.type === 'emergency' ? "bg-red-500 text-white" : 
                    a.type === 'important' ? "bg-yellow-500 text-black" : 
                    "bg-blue-500 text-white"
                  )}>{a.type}</span>
                  <span className="font-bold text-white text-lg">{a.title}</span>
                  <span className="text-xs text-gray-400 bg-white/10 px-2 py-0.5 rounded">対象: {a.targetRole}</span>
                </div>
                <p className="text-sm text-gray-300">{a.body}</p>
                <div className="flex flex-wrap gap-4 text-xs text-gray-400 pt-2">
                  <div className="flex items-center gap-1"><Clock size={12} className="text-[#d4af37]" /> 開始: {a.startAt}</div>
                  {a.endAt && <div>終了: {a.endAt}</div>}
                  {a.displayDurationSeconds && <div>表示時間: {a.displayDurationSeconds}秒</div>}
                  {a.repeatType !== 'none' && <div className="text-[#d4af37]">🔄 繰り返し: {a.repeatType}</div>}
                </div>
              </div>
              <div className="flex flex-row md:flex-col items-center justify-end gap-2 border-t md:border-t-0 md:border-l border-white/10 pt-3 md:pt-0 md:pl-4">
                <button 
                  onClick={() => updateAnnouncement(a.id, { isActive: !a.isActive })} 
                  className={cn("px-4 py-1.5 rounded text-xs font-bold w-full max-w-[120px] transition", a.isActive ? "bg-white/10 text-white hover:bg-red-500/20 hover:text-red-400" : "bg-[#d4af37]/20 text-[#d4af37] hover:bg-[#d4af37] hover:text-black")}
                >
                  {a.isActive ? '無効にする' : '有効にする'}
                </button>
                <button onClick={() => deleteAnnouncement(a.id)} className="p-1.5 text-gray-500 hover:text-red-500 transition rounded hover:bg-white/5">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
          {scheduledAnnouncements.length === 0 && (
            <p className="text-center text-gray-500 py-8">設定された時間指定アナウンスはありません。</p>
          )}
        </div>
      </div>
    </div>
  );
}
