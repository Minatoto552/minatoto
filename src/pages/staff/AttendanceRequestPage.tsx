import React, { useMemo, useState } from 'react';
import { CalendarCheck, CheckCircle2, Clock, Edit3, Send, UserRound } from 'lucide-react';
import { cn, formatDateTime, getBusinessDate } from '../../lib/utils';
import { useVrcBarApp, type AttendanceRequest, type ShiftRequest } from '../../lib/VrcBarAppContext';

const STATUS_OPTIONS: { value: AttendanceRequest['status']; label: string; hint: string }[] = [
  { value: 'present', label: '出勤', hint: '通常出勤' },
  { value: 'absent', label: '休み', hint: '欠勤/休み' },
  { value: 'late', label: '遅刻', hint: '到着予定あり' },
  { value: 'leave_early', label: '早退', hint: '退勤予定あり' },
];

const ROLE_OPTIONS: { value: NonNullable<AttendanceRequest['attendanceRole']>; label: string }[] = [
  { value: 'admin', label: '運営' },
  { value: 'staff', label: 'スタッフ' },
  { value: 'cast', label: 'キャスト' },
  { value: 'off', label: '休み扱い' },
];

export function AttendanceRequestPage() {
  const {
    currentUser,
    shiftRequests,
    attendanceRequests,
    submitAttendanceRequest,
  } = useVrcBarApp();

  const [selectedShiftId, setSelectedShiftId] = useState('');
  const [status, setStatus] = useState<AttendanceRequest['status']>('present');
  const [time, setTime] = useState('');
  const [memo, setMemo] = useState('');
  const [attendanceRole, setAttendanceRole] = useState<NonNullable<AttendanceRequest['attendanceRole']>>(
    currentUser?.role === 'admin' ? 'admin' : currentUser?.role === 'cast' ? 'cast' : 'staff',
  );
  const [toast, setToast] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const openShifts = useMemo(() => {
    return (shiftRequests || [])
      .filter(shift => !shift.isDeleted && shift.status === 'open')
      .sort((a, b) => a.businessDate.localeCompare(b.businessDate));
  }, [shiftRequests]);

  const selectedShift = openShifts.find(shift => shift.id === selectedShiftId) || openShifts[0] || null;
  const myRequests = useMemo(() => {
    return (attendanceRequests || [])
      .filter(request => request.userId === currentUser?.id)
      .sort((a, b) => b.businessDate.localeCompare(a.businessDate));
  }, [attendanceRequests, currentUser?.id]);

  React.useEffect(() => {
    if (!selectedShiftId && openShifts[0]) setSelectedShiftId(openShifts[0].id);
  }, [openShifts, selectedShiftId]);

  React.useEffect(() => {
    if (status === 'absent') setAttendanceRole('off');
    else if (attendanceRole === 'off') {
      setAttendanceRole(currentUser?.role === 'admin' ? 'admin' : currentUser?.role === 'cast' ? 'cast' : 'staff');
    }
  }, [attendanceRole, currentUser?.role, status]);

  const existingRequest = selectedShift
    ? myRequests.find(request => request.shiftRequestId === selectedShift.id)
    : null;

  const handleSubmit = async () => {
    if (!selectedShift || !currentUser || isSubmitting) return;
    setToast('');
    setErrorMsg('');
    setIsSubmitting(true);

    try {
      await submitAttendanceRequest({
        shiftRequestId: selectedShift.id,
        businessDate: selectedShift.businessDate,
        status,
        time: time || undefined,
        memo: memo || undefined,
        attendanceRole,
      });
      setToast(existingRequest ? 'シフト提出を更新しました。' : 'シフトを提出しました。');
      setTimeout(() => setToast(''), 3000);
    } catch (error) {
      setErrorMsg(error instanceof Error ? error.message : 'シフト提出に失敗しました。');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="app-home-space animate-in fade-in">
      <section className="iphone-card relative overflow-hidden p-5">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#d4af37]/80 to-transparent" />
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.3em] text-[#d4af37]">Shift Request</p>
            <h1 className="mt-2 text-2xl font-black text-white">シフト提出</h1>
            <p className="mt-2 text-sm leading-6 text-gray-400">
              運営・スタッフ・キャストが自分の出勤予定を提出できます。
            </p>
          </div>
          <div className="home-hero-icon">
            <CalendarCheck size={24} />
          </div>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-2">
          <MiniStat label="TODAY" value={getBusinessDate()} />
          <MiniStat label="OPEN" value={`${openShifts.length}件`} />
          <MiniStat label="MINE" value={`${myRequests.length}件`} />
        </div>
      </section>

      {toast && (
        <div className="iphone-card border-emerald-400/30 bg-emerald-500/10 p-4 text-sm font-bold text-emerald-200">
          <CheckCircle2 className="mr-2 inline" size={18} />
          {toast}
        </div>
      )}
      {errorMsg && (
        <div className="iphone-card neon-alert bg-red-500/10 p-4 text-sm font-bold text-red-200">
          {errorMsg}
        </div>
      )}

      {openShifts.length === 0 ? (
        <div className="iphone-card p-8 text-center">
          <CalendarCheck className="mx-auto text-gray-500" size={36} />
          <h2 className="mt-4 text-lg font-black text-white">募集中のシフトはありません</h2>
          <p className="mt-2 text-sm text-gray-500">
            管理者がシフト募集を作成すると、ここから提出できます。
          </p>
        </div>
      ) : (
        <>
          <section className="iphone-card p-4 space-y-4">
            <label className="block space-y-2">
              <span className="text-xs font-bold text-gray-400">提出するシフト募集</span>
              <select
                value={selectedShift?.id || ''}
                onChange={event => setSelectedShiftId(event.target.value)}
                className="min-h-[52px] w-full rounded-2xl border border-white/10 bg-black/45 px-4 text-base font-bold text-white outline-none focus:border-[#d4af37]"
              >
                {openShifts.map(shift => (
                  <option key={shift.id} value={shift.id}>
                    {shift.businessDate} / {shift.title}
                  </option>
                ))}
              </select>
            </label>

            {selectedShift && (
              <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
                <p className="text-sm font-black text-white">{selectedShift.title}</p>
                <p className="mt-1 text-xs leading-5 text-gray-400">{selectedShift.description || '説明はありません。'}</p>
                <p className="mt-2 text-[11px] text-gray-500">
                  締切: {selectedShift.deadlineAt ? formatDateTime(selectedShift.deadlineAt) : '未設定'}
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2">
              {STATUS_OPTIONS.map(option => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setStatus(option.value)}
                  className={cn(
                    'min-h-[72px] rounded-3xl border p-3 text-left transition',
                    status === option.value
                      ? 'border-[#d4af37]/70 bg-[#d4af37]/15 text-[#f8e7a2]'
                      : 'border-white/10 bg-white/[0.04] text-gray-400',
                  )}
                >
                  <span className="block text-sm font-black">{option.label}</span>
                  <span className="mt-1 block text-xs opacity-70">{option.hint}</span>
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="space-y-2">
                <span className="text-xs font-bold text-gray-400">予定時刻</span>
                <input
                  type="time"
                  value={time}
                  onChange={event => setTime(event.target.value)}
                  className="min-h-[52px] w-full rounded-2xl border border-white/10 bg-black/45 px-4 text-base font-bold text-white outline-none focus:border-[#d4af37]"
                />
              </label>
              <label className="space-y-2">
                <span className="text-xs font-bold text-gray-400">当日の扱い</span>
                <select
                  value={attendanceRole}
                  onChange={event => setAttendanceRole(event.target.value as NonNullable<AttendanceRequest['attendanceRole']>)}
                  className="min-h-[52px] w-full rounded-2xl border border-white/10 bg-black/45 px-4 text-base font-bold text-white outline-none focus:border-[#d4af37]"
                >
                  {ROLE_OPTIONS
                    .filter(option => currentUser?.role === 'admin' || option.value === currentUser?.role || option.value === 'off')
                    .map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
                </select>
              </label>
            </div>

            <label className="block space-y-2">
              <span className="text-xs font-bold text-gray-400">備考</span>
              <textarea
                value={memo}
                onChange={event => setMemo(event.target.value)}
                placeholder="遅刻理由、早退予定、補足など"
                className="min-h-[96px] w-full rounded-2xl border border-white/10 bg-black/45 p-4 text-sm text-white outline-none focus:border-[#d4af37]"
              />
            </label>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={!selectedShift || isSubmitting}
              className="btn-gold flex w-full items-center justify-center gap-3 rounded-[24px] py-4 text-sm font-black tracking-widest disabled:cursor-not-allowed disabled:opacity-50"
            >
              {existingRequest ? <Edit3 size={18} /> : <Send size={18} />}
              {isSubmitting ? '送信中...' : existingRequest ? '提出内容を更新' : 'シフトを提出'}
            </button>
          </section>

          <section className="space-y-3">
            <div>
              <p className="text-[11px] uppercase tracking-[0.28em] text-[#d4af37]">History</p>
              <h2 className="mt-1 text-lg font-black text-white">自分の提出履歴</h2>
            </div>
            {myRequests.length === 0 ? (
              <div className="iphone-card p-6 text-center text-sm text-gray-500">まだ提出履歴はありません。</div>
            ) : (
              myRequests.slice(0, 8).map(request => (
                <div key={request.id} className="iphone-card p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-black text-white">{request.businessDate}</p>
                      <p className="mt-1 text-xs text-gray-500">
                        {statusLabel(request.status)} / {roleLabel(request.attendanceRole)}
                      </p>
                      {request.memo && <p className="mt-2 line-clamp-2 text-xs text-gray-400">{request.memo}</p>}
                    </div>
                    <div className="metric-icon metric-icon-gold">
                      {request.status === 'late' || request.status === 'leave_early' ? <Clock size={18} /> : <UserRound size={18} />}
                    </div>
                  </div>
                </div>
              ))
            )}
          </section>
        </>
      )}
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-3">
      <p className="text-[10px] tracking-widest text-gray-500">{label}</p>
      <p className="mt-1 truncate text-sm font-black text-[#d4af37]">{value}</p>
    </div>
  );
}

function statusLabel(status: AttendanceRequest['status']) {
  return {
    present: '出勤',
    absent: '休み',
    late: '遅刻',
    leave_early: '早退',
  }[status];
}

function roleLabel(role?: AttendanceRequest['attendanceRole']) {
  return {
    admin: '運営',
    staff: 'スタッフ',
    cast: 'キャスト',
    off: '休み扱い',
    undefined: '未設定',
  }[String(role) as 'admin' | 'staff' | 'cast' | 'off' | 'undefined'];
}
