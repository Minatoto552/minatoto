import React, { useState } from 'react';
import { useVrcBarApp, Announcement } from '../../lib/VrcBarAppContext';
import { Megaphone, Search, Filter, Calendar, ChevronLeft, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../../lib/utils';

export function AnnouncementsPage() {
  const { announcements } = useVrcBarApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  const filteredAnnouncements = announcements
    .filter(a => {
      const matchesSearch = a.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          a.body.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'all' || a.type === filterType;
      return matchesSearch && matchesType;
    })
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  const getBadgeStyles = (type: string) => {
    switch (type) {
      case 'emergency': return 'bg-red-500/20 text-red-500 border-red-500/30';
      case 'important': return 'bg-[#d4af37]/20 text-[#d4af37] border-[#d4af37]/30';
      default: return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 pb-24 animate-in fade-in duration-500">
      <div className="mb-8 flex items-center gap-4">
        <button onClick={() => window.history.back()} className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white transition">
          <ChevronLeft size={20} />
        </button>
        <div>
          <h2 className="text-2xl font-lux gold-gradient-text tracking-widest uppercase">Announcements</h2>
          <p className="text-xs text-gray-500 uppercase tracking-widest">History of updates and notifications</p>
        </div>
      </div>

      <div className="space-y-4 mb-8">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input 
              type="text" 
              placeholder="アナウンスを検索..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm outline-none focus:border-[#d4af37] transition"
            />
          </div>
          <div className="flex gap-2">
            {['all', 'normal', 'important', 'emergency'].map(type => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={cn(
                  "px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap border",
                  filterType === type 
                    ? "bg-[#d4af37] text-black border-[#d4af37]" 
                    : "bg-white/5 text-gray-400 border-white/10 hover:border-white/20"
                )}
              >
                {type === 'all' ? 'すべて' : 
                 type === 'normal' ? '通常' : 
                 type === 'important' ? '重要' : '緊急'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {filteredAnnouncements.length > 0 ? (
          filteredAnnouncements.map(a => (
            <div key={a.id} className="glass-panel p-6 rounded-2xl border border-white/10 group transition-all hover:border-[#d4af37]/30">
              <div className="flex justify-between items-start mb-3">
                <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-widest", getBadgeStyles(a.type))}>
                  {a.type}
                </span>
                <span className="text-[10px] text-gray-500 flex items-center gap-1">
                  <Calendar size={10} />
                  {a.createdAt.toLocaleString()}
                </span>
              </div>
              <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                {a.type === 'emergency' && <AlertTriangle size={18} className="text-red-500" />}
                {a.title}
              </h3>
              <p className="text-sm text-gray-400 leading-relaxed whitespace-pre-wrap">
                {a.body}
              </p>
              {!a.isActive && (
                <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                  <span className="text-[10px] text-gray-600 italic">このアナウンスは現在非表示に設定されています</span>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-20 bg-black/20 rounded-3xl border border-dashed border-white/10">
            <Megaphone className="mx-auto text-gray-700 mb-4" size={48} />
            <p className="text-gray-500">該当するアナウンスが見つかりませんでした</p>
          </div>
        )}
      </div>
    </div>
  );
}
