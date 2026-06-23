import React, { useMemo, useState } from 'react';
import {
  useVrcBarApp,
  AttendanceRequest,
  ShiftRequest,
} from '../../lib/VrcBarAppContext';
import { getBusinessDate, cn } from '../../lib/utils';
import {
  Calendar as CalendarIcon,
  Users,
  Clock,
  Edit2,
  X,
  Plus,
  Trash2,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

type ShiftStatus = 'open' | 'closed' | 'canceled';

export function AttendanceManagerPage() {
  const app = useVrcBarApp() as any;

  const {
    users = [],
    shiftRequests = [],
    attendanceRequests = [],
    createShiftRequest,
    updateShiftRequest,
    deleteShiftRequest,
    cancelShiftRequest,
    updateAttendanceRequest,
  } = app;

  const publishShiftRequest = app.publishShiftRequest as
    | ((id: string) => Promise<void>)
    | undefined;

  const unpublishShiftRequest = app.unpublishShiftRequest as
    | ((id: string) => Promise<void>)
    | undefined;

  const employees = useMemo(
    () =>
      users.filter(
        (u: any) =>
          (u.role === 'cast' || u.role === 'staff' || u.role === 'admin') &&
          !u.isDeleted &&
          u.approvalStatus === 'approved'
      ),
    [users]
  );

  const [viewMode, setViewMode] = useState<'list' | 'detail'>('list');
  const [selectedShift, setSelectedShift] = useState<ShiftRequest | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [editingReq, setEditingReq] =
    useState<(Partial<AttendanceRequest> & { userId: string }) | null>(null);

  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [localShiftOverrides, setLocalShiftOverrides] = useState<
    Record<string, Partial<ShiftRequest>>
  >({});
  const [hiddenShiftIds, setHiddenShiftIds] = useState<string[]>([]);

  const [newShift, setNewShift] = useState({
    businessDate: getBusinessDate(),
    title: '',
    description: '',
    deadlineDate: '',
    deadlineTime: '23:59',
  });

  const mergedShiftRequests = useMemo(() => {
    return shiftRequests
      .map((shift: ShiftRequest) => ({
        ...shift,
        ...(localShiftOverrides[shift.id] || {}),
      }))
      .filter(
        (shift: any) => !shift.isDeleted && !hiddenShiftIds.includes(shift.id)
      );
  }, [shiftRequests, localShiftOverrides, hiddenShiftIds]);

  const updateLocalShift = (id: string, updates: Partial<ShiftRequest>) => {
    setLocalShiftOverrides((prev) => ({
      ...prev,
      [id]: {
        ...(prev[id] || {}),
        ...updates,
      },
    }));

    setSelectedShift((prev) => {
      if (!prev || prev.id !== id) return prev;
      return { ...prev, ...updates };
    });
  };

  const handleCreateShift = async () => {
    try {
      if (!newShift.businessDate) {
        alert('日付を指定してください');
        return;
      }

      const title = newShift.title || `${newShift.businessDate} のシフト`;

      let deadlineAt: Date | null = null;
      if (newShift.deadlineDate) {
        deadlineAt = new Date(
          `${newShift.deadlineDate}T${newShift.deadlineTime || '23:59'}`
        );
      }

      await createShiftRequest({
        businessDate: newShift.businessDate,
        title,
        description: newShift.description,
        status: 'open',
        deadlineAt,
      });

      setIsCreating(false);
      setNewShift({
        businessDate: getBusinessDate(),
        title: '',
        description: '',
        deadlineDate: '',
        deadlineTime: '23:59',
      });

      alert('シフト募集を作成しました');
    } catch (err: any) {
      console.error('[SHIFT CREATE ERROR]', err);
      alert(err?.message || 'シフト募集の作成に失敗しました');
    }
  };

  const handleCancelShift = async (id: string) => {
  const ok = window.confirm(
    'このシフト募集を取り消しますか？\n取り消すと従業員は提出できなくなり、お客様画面にも表示されません。'
  );

  if (!ok) {
    return;
  }

  try {
    setActionLoadingId(id);

    await cancelShiftRequest(id, '管理者による取り消し');

    updateLocalShift(id, {
      status: 'canceled' as any,
      isPublished: false,
    } as any);

    alert('シフト募集を取り消しました');
  } catch (err: any) {
    console.error('[SHIFT CANCEL ERROR]', err);
    alert(err?.message || 'シフト募集の取り消しに失敗しました');
  } finally {
    setActionLoadingId(null);
  }
};

  const handleDeleteShift = async (id: string) => {
    if (
      !window.confirm(
        'このシフト募集を削除しますか？\n提出済みの回答は管理用に残ります。'
      )
    ) {
      return;
    }

    try {
      setActionLoadingId(id);
      await deleteShiftRequest(id);

      setHiddenShiftIds((prev) => [...prev, id]);

      if (selectedShift?.id === id) {
        setSelectedShift(null);
        setViewMode('list');
      }

      alert('シフト募集を削除しました');
    } catch (err: any) {
      console.error('[SHIFT DELETE ERROR]', err);
      alert(err?.message || 'シフト募集の削除に失敗しました');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleCloseShift = async (id: string) => {
    try {
      setActionLoadingId(id);
      await updateShiftRequest(id, { status: 'closed' });
      updateLocalShift(id, { status: 'closed' as any });
    } catch (err: any) {
      console.error('[SHIFT CLOSE ERROR]', err);
      alert(err?.message || '募集の締切に失敗しました');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleReopenShift = async (id: string) => {
    try {
      setActionLoadingId(id);
      await updateShiftRequest(id, { status: 'open' });
      updateLocalShift(id, { status: 'open' as any });
    } catch (err: any) {
      console.error('[SHIFT REOPEN ERROR]', err);
      alert(err?.message || '募集の再開に失敗しました');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handlePublishShift = async (id: string) => {
    if (!publishShiftRequest) {
      alert(
        '公開機能がまだ接続されていません。VrcBarAppContext.tsx に publishShiftRequest を追加してください。'
      );
      return;
    }

    if (
      !window.confirm(
        'このシフトをお客様画面に公開しますか？\n現在公開中のシフトは自動的に非公開になります。'
      )
    ) {
      return;
    }

    try {
      setActionLoadingId(id);
      await publishShiftRequest(id);

      setLocalShiftOverrides((prev) => {
        const next: Record<string, Partial<ShiftRequest>> = {};

        shiftRequests.forEach((shift: ShiftRequest) => {
          next[shift.id] = {
            ...(prev[shift.id] || {}),
            isPublished: shift.id === id,
          } as any;
        });

        return next;
      });

      setSelectedShift((prev) =>
        prev ? ({ ...prev, isPublished: prev.id === id } as any) : prev
      );

      alert('シフトを公開しました');
    } catch (err: any) {
      console.error('[SHIFT PUBLISH ERROR]', err);
      alert(err?.message || 'シフトの公開に失敗しました');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleUnpublishShift = async (id: string) => {
    if (!unpublishShiftRequest) {
      alert(
        '公開解除機能がまだ接続されていません。VrcBarAppContext.tsx に unpublishShiftRequest を追加してください。'
      );
      return;
    }

    if (!window.confirm('このシフトの公開を解除しますか？')) return;

    try {
      setActionLoadingId(id);
      await unpublishShiftRequest(id);

      updateLocalShift(id, {
        isPublished: false,
        publishedAt: null,
        publishedBy: null,
      } as any);

      alert('シフトの公開を解除しました');
    } catch (err: any) {
      console.error('[SHIFT UNPUBLISH ERROR]', err);
      alert(err?.message || 'シフトの公開解除に失敗しました');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleSaveAttendance = async () => {
    if (!editingReq || !editingReq.id) return;

    try {
      await updateAttendanceRequest(editingReq.id, editingReq);
      setEditingReq(null);
      alert('提出内容を保存しました');
    } catch (err: any) {
      console.error('[ATTENDANCE SAVE ERROR]', err);
      alert(err?.message || '提出内容の保存に失敗しました');
    }
  };

  const getAttendanceLabel = (status?: string) => {
    switch (status) {
      case 'present':
      case 'attend':
        return <span className="text-green-400">出勤</span>;
      case 'absent':
      case 'off':
        return <span className="text-red-400">休み</span>;
      case 'late':
        return <span className="text-yellow-400">遅刻</span>;
      case 'leave_early':
      case 'early_leave':
        return <span className="text-orange-400">早退</span>;
      default:
        return <span className="text-gray-500">未提出</span>;
    }
  };

  const getShiftStatusLabel = (shift: any) => {
    if (shift.status === 'open') {
      return (
        <span className="flex items-center gap-1 text-[10px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full border border-green-500/30">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          募集中
        </span>
      );
    }

    if (shift.status === 'closed') {
      return (
        <span className="text-[10px] bg-gray-500/20 text-gray-400 px-2 py-0.5 rounded-full border border-gray-500/30">
          締切済
        </span>
      );
    }

    if (shift.status === 'canceled') {
      return (
        <span className="text-[10px] bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full border border-red-500/30">
          取消済
        </span>
      );
    }

    return null;
  };

  if (viewMode === 'detail' && selectedShift) {
    const shift = selectedShift as any;
    const activeRequests = attendanceRequests.filter(
      (a: any) => a.shiftRequestId === selectedShift.id
    );

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setViewMode('list')}
            className="text-gray-400 hover:text-white px-3 py-1.5 bg-white/5 rounded-lg border border-white/10 transition"
          >
            ← 戻る
          </button>

          <div>
            <h2 className="text-xl font-bold text-white tracking-widest">
              {selectedShift.title} ({selectedShift.businessDate})
            </h2>
            <div className="flex flex-wrap gap-2 mt-2">
              {shift.isPublished && (
                <span className="text-[10px] bg-[#d4af37]/20 text-[#d4af37] px-2 py-0.5 rounded-full border border-[#d4af37]/30">
                  公開中
                </span>
              )}
              {getShiftStatusLabel(shift)}
            </div>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-xl border border-white/10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 border-b border-[#d4af37]/30 pb-4">
            <div className="flex items-center gap-3">
              <Users className="text-[#d4af37]" size={24} />
              <div>
                <h3 className="font-bold text-white text-lg tracking-widest">
                  提出状況
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  提出数: {activeRequests.length} / {employees.length}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {shift.status === 'open' && (
                <button
                  disabled={actionLoadingId === selectedShift.id}
                  onClick={() => handleCloseShift(selectedShift.id)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded-lg text-sm disabled:opacity-50"
                >
                  <CheckCircle2 size={16} />
                  募集を締め切る
                </button>
              )}

              {shift.status === 'closed' && (
                <button
                  disabled={actionLoadingId === selectedShift.id}
                  onClick={() => handleReopenShift(selectedShift.id)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-green-500/20 text-green-400 border border-green-500/30 rounded-lg text-sm disabled:opacity-50"
                >
                  <Clock size={16} />
                  募集を再開する
                </button>
              )}

              {shift.status !== 'canceled' &&
                (shift.isPublished ? (
                  <button
                    disabled={actionLoadingId === selectedShift.id}
                    onClick={() => handleUnpublishShift(selectedShift.id)}
                    className="px-3 py-1.5 rounded-lg bg-[#d4af37]/20 text-[#d4af37] text-sm font-bold border border-[#d4af37]/30 disabled:opacity-50"
                  >
                    公開解除
                  </button>
                ) : (
                  <button
                    disabled={actionLoadingId === selectedShift.id}
                    onClick={() => handlePublishShift(selectedShift.id)}
                    className="px-3 py-1.5 rounded-lg bg-green-500/20 text-green-400 text-sm font-bold border border-green-500/30 disabled:opacity-50"
                  >
                    公開する
                  </button>
                ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-400 uppercase bg-black/50 border-b border-white/10">
                <tr>
                  <th className="px-4 py-3">名前</th>
                  <th className="px-4 py-3">基本役職</th>
                  <th className="px-4 py-3">状況</th>
                  <th className="px-4 py-3">当日役割</th>
                  <th className="px-4 py-3">時間</th>
                  <th className="px-4 py-3">備考</th>
                  <th className="px-4 py-3 text-right">編集</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-white/5">
                {employees.map((user: any) => {
                  const req = activeRequests.find(
                    (a: any) => a.userId === user.id
                  ) as any;

                  return (
                    <tr key={user.id} className="hover:bg-white/5 transition">
                      <td className="px-4 py-3 font-bold text-white">
                        {user.displayName}
                      </td>
                      <td className="px-4 py-3 text-gray-400 capitalize">
                        {user.role}
                      </td>
                      <td className="px-4 py-3 font-bold">
                        {getAttendanceLabel(req?.status)}
                      </td>
                      <td className="px-4 py-3 text-gray-400">
                        {req?.attendanceRole ? (
                          <span className="text-[#d4af37] border border-[#d4af37]/30 bg-[#d4af37]/10 px-2 py-0.5 rounded text-xs">
                            {req.attendanceRole}
                          </span>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-400 whitespace-nowrap">
                        {(req?.status === 'late' ||
                          req?.status === 'leave_early' ||
                          req?.status === 'early_leave') &&
                        req?.time
                          ? req.time
                          : req?.lateTime || req?.earlyLeaveTime || '-'}
                      </td>
                      <td className="px-4 py-3 text-gray-400 truncate max-w-[150px]">
                        {req?.memo || req?.note || '-'}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {req && (
                          <button
                            onClick={() => setEditingReq({ ...req })}
                            className="p-2 hover:bg-white/10 rounded-lg text-[#d4af37] transition"
                          >
                            <Edit2 size={16} />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {editingReq && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-[#111] p-6 rounded-xl border border-white/10 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-white text-lg">
                  提出内容の編集
                </h3>
                <button
                  onClick={() => setEditingReq(null)}
                  className="text-gray-400 hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">
                    ステータス <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={(editingReq as any).status || ''}
                    onChange={(e) =>
                      setEditingReq({
                        ...editingReq,
                        status: e.target.value as any,
                      })
                    }
                    className="w-full bg-black border border-white/20 rounded p-2 text-white"
                  >
                    <option value="present">出勤</option>
                    <option value="absent">休み</option>
                    <option value="late">遅刻</option>
                    <option value="leave_early">早退</option>
                  </select>
                </div>

                {((editingReq as any).status === 'late' ||
                  (editingReq as any).status === 'leave_early' ||
                  (editingReq as any).status === 'early_leave') && (
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">
                      時間
                    </label>
                    <input
                      type="time"
                      value={(editingReq as any).time || ''}
                      onChange={(e) =>
                        setEditingReq({
                          ...editingReq,
                          time: e.target.value,
                        } as any)
                      }
                      className="w-full bg-black border border-white/20 rounded p-2 text-white"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs text-gray-400 mb-1">
                    当日役割
                  </label>
                  <select
                    value={(editingReq as any).attendanceRole || ''}
                    onChange={(e) =>
                      setEditingReq({
                        ...editingReq,
                        attendanceRole: e.target.value || undefined,
                      } as any)
                    }
                    className="w-full bg-black border border-white/20 rounded p-2 text-white"
                  >
                    <option value="">デフォルト</option>
                    <option value="admin">運営として出勤</option>
                    <option value="staff">スタッフとして出勤</option>
                    <option value="cast">キャストとして出勤</option>
                    <option value="off">休み / 表示しない</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-gray-400 mb-1">
                    備考
                  </label>
                  <textarea
                    value={(editingReq as any).memo || (editingReq as any).note || ''}
                    onChange={(e) =>
                      setEditingReq({
                        ...editingReq,
                        memo: e.target.value,
                        note: e.target.value,
                      } as any)
                    }
                    className="w-full bg-black border border-white/20 rounded p-2 text-white resize-none"
                    rows={3}
                  />
                </div>

                <div className="mt-6 flex justify-end gap-3">
                  <button
                    onClick={() => setEditingReq(null)}
                    className="px-4 py-2 rounded-lg border border-white/20 text-gray-300"
                  >
                    キャンセル
                  </button>
                  <button
                    onClick={handleSaveAttendance}
                    className="px-4 py-2 rounded-lg bg-[#d4af37] text-black font-bold"
                  >
                    保存
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-widest">
            シフト募集管理
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            従業員へのシフト提出募集を作成・管理します
          </p>
        </div>

        <button
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#d4af37] text-black rounded-lg font-bold hover:bg-[#b5952f] transition whitespace-nowrap"
        >
          <Plus size={18} />
          シフト募集を作成
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {mergedShiftRequests.map((shift: any) => {
          const isActive = shift.status === 'open';
          const isClosed = shift.status === 'closed';
          const isCanceled = shift.status === 'canceled';
          const submissionCount = attendanceRequests.filter(
            (a: any) => a.shiftRequestId === shift.id
          ).length;

          return (
            <div
              key={shift.id}
              className={cn(
                'glass-panel p-5 rounded-xl border relative transition-all group',
                isActive
                  ? 'border-[#d4af37]/30 hover:border-[#d4af37]/60'
                  : 'border-white/10 opacity-75'
              )}
            >
              <div className="absolute top-4 right-4 flex flex-wrap gap-2 justify-end max-w-[180px]">
                {shift.isPublished && (
                  <span className="text-[10px] bg-[#d4af37]/20 text-[#d4af37] px-2 py-0.5 rounded-full border border-[#d4af37]/30">
                    公開中
                  </span>
                )}
                {getShiftStatusLabel(shift)}
              </div>

              <div
                className="mb-4 pr-24"
                onClick={() => {
                  if (!isCanceled) {
                    setSelectedShift(shift);
                    setViewMode('detail');
                  }
                }}
                style={{ cursor: isCanceled ? 'default' : 'pointer' }}
              >
                <div className="flex items-center gap-2 text-sm text-gray-400 mb-1">
                  <CalendarIcon size={14} />
                  <span>対象日: {shift.businessDate}</span>
                </div>

                <h3 className="font-bold text-lg text-white">{shift.title}</h3>

                {shift.description && (
                  <p className="text-xs text-gray-500 mt-2 line-clamp-2">
                    {shift.description}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-3 border-t border-white/5 pt-4 mt-2">
                <div className="flex items-center gap-2 text-sm">
                  <Users
                    size={16}
                    className={cn(isActive ? 'text-[#d4af37]' : 'text-gray-500')}
                  />
                  <span className="text-gray-300">
                    提出:{' '}
                    <span className="font-bold text-white">
                      {submissionCount}
                    </span>{' '}
                    人
                  </span>
                </div>

                <div className="flex flex-wrap gap-2 justify-end">
                  {!isCanceled &&
                    (shift.isPublished ? (
                      <button
                        disabled={actionLoadingId === shift.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUnpublishShift(shift.id);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-[#d4af37]/20 text-[#d4af37] text-xs font-bold border border-[#d4af37]/30 hover:bg-[#d4af37]/30 transition disabled:opacity-50"
                      >
                        公開解除
                      </button>
                    ) : (
                      <button
                        disabled={actionLoadingId === shift.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePublishShift(shift.id);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-green-500/20 text-green-400 text-xs font-bold border border-green-500/30 hover:bg-green-500/30 transition disabled:opacity-50"
                      >
                        公開する
                      </button>
                    ))}

                  {isActive && (
                    <button
                      disabled={actionLoadingId === shift.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCloseShift(shift.id);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-yellow-500/20 text-yellow-400 text-xs font-bold border border-yellow-500/30 hover:bg-yellow-500/30 transition disabled:opacity-50"
                    >
                      締切
                    </button>
                  )}

                  {isClosed && (
                    <button
                      disabled={actionLoadingId === shift.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleReopenShift(shift.id);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-blue-500/20 text-blue-400 text-xs font-bold border border-blue-500/30 hover:bg-blue-500/30 transition disabled:opacity-50"
                    >
                      再開
                    </button>
                  )}

                  {!isCanceled && (
                    <button
                      disabled={actionLoadingId === shift.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCancelShift(shift.id);
                      }}
                      className="p-2 rounded-lg bg-white/5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition disabled:opacity-50"
                      title="取り消し"
                    >
                      <XCircle size={16} />
                    </button>
                  )}

                  <button
                    disabled={actionLoadingId === shift.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteShift(shift.id);
                    }}
                    className="p-2 rounded-lg bg-white/5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition disabled:opacity-50"
                    title="削除"
                  >
                    <Trash2 size={16} />
                  </button>

                  {!isCanceled && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedShift(shift);
                        setViewMode('detail');
                      }}
                      className="px-3 py-1.5 rounded-lg bg-white/10 text-white text-xs font-bold hover:bg-white/20 transition"
                    >
                      詳細
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {mergedShiftRequests.length === 0 && (
          <div className="col-span-full py-12 text-center text-gray-500 glass-panel rounded-xl border border-white/5">
            シフト募集がありません。
            <br />
            右上の「シフト募集を作成」ボタンから作成してください。
          </div>
        )}
      </div>

      {isCreating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#111] p-6 rounded-xl border border-white/10 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-white text-lg">
                シフト募集の作成
              </h3>
              <button
                onClick={() => setIsCreating(false)}
                className="text-gray-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1">
                  対象日 <span className="text-red-400">*</span>
                </label>
                <input
                  type="date"
                  value={newShift.businessDate}
                  onChange={(e) =>
                    setNewShift({
                      ...newShift,
                      businessDate: e.target.value,
                    })
                  }
                  className="w-full bg-black border border-white/20 rounded p-2 text-white focus:border-[#d4af37]"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1">
                  タイトル
                </label>
                <input
                  type="text"
                  value={newShift.title}
                  onChange={(e) =>
                    setNewShift({ ...newShift, title: e.target.value })
                  }
                  placeholder={`${newShift.businessDate || 'YYYY-MM-DD'} のシフト`}
                  className="w-full bg-black border border-white/20 rounded p-2 text-white focus:border-[#d4af37]"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1">
                  説明・メモ
                </label>
                <textarea
                  value={newShift.description}
                  onChange={(e) =>
                    setNewShift({
                      ...newShift,
                      description: e.target.value,
                    })
                  }
                  placeholder="イベント日などの特記事項があれば..."
                  className="w-full bg-black border border-white/20 rounded p-2 text-white resize-none focus:border-[#d4af37]"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">
                    提出締切日
                  </label>
                  <input
                    type="date"
                    value={newShift.deadlineDate}
                    onChange={(e) =>
                      setNewShift({
                        ...newShift,
                        deadlineDate: e.target.value,
                      })
                    }
                    className="w-full bg-black border border-white/20 rounded p-2 text-white focus:border-[#d4af37]"
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-400 mb-1">
                    提出締切時間
                  </label>
                  <input
                    type="time"
                    value={newShift.deadlineTime}
                    disabled={!newShift.deadlineDate}
                    onChange={(e) =>
                      setNewShift({
                        ...newShift,
                        deadlineTime: e.target.value,
                      })
                    }
                    className="w-full bg-black border border-white/20 rounded p-2 text-white focus:border-[#d4af37] disabled:opacity-50"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setIsCreating(false)}
                  className="px-4 py-2 rounded-lg border border-white/20 text-gray-300"
                >
                  キャンセル
                </button>
                <button
                  onClick={handleCreateShift}
                  className="px-4 py-2 rounded-lg bg-[#d4af37] text-black font-bold"
                >
                  作成する
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
