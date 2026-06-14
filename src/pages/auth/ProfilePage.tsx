import React, { useEffect, useState } from 'react';
import { CheckCircle2, Image as ImageIcon, Save, UserRound } from 'lucide-react';
import { ProfileAvatar } from '../../components/ui/ProfileAvatar';
import { useMockApp } from '../../lib/MockAppContext';

export function ProfilePage() {
  const { currentUser, updateProfile } = useMockApp();

  const [displayName, setDisplayName] = useState('');
  const [iconUrl, setIconUrl] = useState('');
  const [userCode, setUserCode] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!currentUser) return;
    setDisplayName(currentUser.displayName || '');
    setIconUrl(currentUser.iconUrl || '');
    setUserCode(currentUser.userCode || '');
  }, [currentUser]);

  if (!currentUser) {
    return (
      <div className="mx-auto max-w-md rounded-3xl border border-white/10 bg-white/[0.04] p-8 text-center text-sm text-gray-400">
        ログイン情報を確認しています。
      </div>
    );
  }

  const canRegisterOrders = ['admin', 'staff', 'cast'].includes(currentUser.role) || currentUser.canCreateOrder;

  const handleSave = async () => {
    if (isSaving) return;
    setError(null);

    if (!displayName.trim() || !userCode.trim()) {
      setError('表示名とユーザーIDは必須です。');
      return;
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(userCode.trim())) {
      setError('ユーザーIDは英数字、アンダーバー、ハイフンのみ使用できます。');
      return;
    }

    if (userCode.trim().length < 3 || userCode.trim().length > 20) {
      setError('ユーザーIDは3文字以上20文字以内にしてください。');
      return;
    }

    const nextIconUrl = iconUrl.trim();
    if (nextIconUrl && !/^https?:\/\//i.test(nextIconUrl)) {
      setError('プロフィール画像URLは http:// または https:// で始まる固定URLを指定してください。空欄にすると初期アイコンに戻せます。');
      return;
    }

    try {
      setIsSaving(true);
      await updateProfile(currentUser.id, {
        displayName: displayName.trim(),
        iconUrl: nextIconUrl,
        userCode: userCode.trim(),
      });
      setToastMessage('プロフィールを保存しました');
      setTimeout(() => setToastMessage(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'プロフィールの保存に失敗しました。');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="relative mx-auto max-w-2xl space-y-6 animate-in fade-in duration-500">
      {toastMessage && (
        <div className="fixed left-1/2 top-4 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full border border-[#d4af37]/30 bg-black/85 px-6 py-3 text-sm font-medium text-white shadow-lg animate-in slide-in-from-top-4">
          <CheckCircle2 size={16} className="text-[#d4af37]" />
          {toastMessage}
        </div>
      )}

      <div className="flex items-center justify-between border-b border-[#d4af37]/20 pb-4">
        <h2 className="font-lux flex items-center gap-2 text-2xl text-white">
          <UserRound className="text-[#d4af37]" />
          My Profile
        </h2>
      </div>

      <div className="glass-panel rounded-3xl border-[#d4af37]/30 p-6 sm:p-8">
        {error && (
          <div className="mb-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
            {error}
          </div>
        )}

        <div className="space-y-6">
          <div className="flex flex-col items-start gap-6 sm:flex-row">
            <div className="flex flex-col items-center gap-3">
              <ProfileAvatar
                src={iconUrl}
                name={displayName}
                version={currentUser.profileImageUpdatedAt}
                className="h-24 w-24 shrink-0 rounded-full border-2 border-[#d4af37]/50 bg-black"
              />
              <span className="text-xs text-gray-500">プロフィール画像</span>
            </div>

            <div className="w-full flex-1 space-y-4">
              <label className="block">
                <span className="mb-1 block text-xs text-gray-400">表示名</span>
                <input
                  type="text"
                  value={displayName}
                  onChange={event => setDisplayName(event.target.value)}
                  className="w-full rounded-2xl border border-[#d4af37]/30 bg-black/50 p-3 text-sm text-white outline-none focus:border-[#d4af37]"
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-xs text-gray-400">ユーザーID</span>
                <div className="flex items-center">
                  <span className="rounded-l-2xl border border-r-0 border-[#d4af37]/30 bg-black/80 p-3 text-sm text-gray-500">@</span>
                  <input
                    type="text"
                    value={userCode}
                    onChange={event => setUserCode(event.target.value)}
                    className="w-full rounded-r-2xl border border-[#d4af37]/30 bg-black/50 p-3 text-sm text-white outline-none focus:border-[#d4af37]"
                    placeholder="半角英数字、_、- のみ"
                  />
                </div>
              </label>

              <label className="block">
                <span className="mb-1 flex items-center gap-1 text-xs text-gray-400">
                  <ImageIcon size={12} />
                  プロフィール画像URL
                </span>
                <input
                  type="url"
                  value={iconUrl}
                  onChange={event => setIconUrl(event.target.value)}
                  className="w-full rounded-2xl border border-[#d4af37]/30 bg-black/50 p-3 text-sm text-white outline-none focus:border-[#d4af37]"
                  placeholder="https://example.com/profile.png"
                />
                <p className="mt-2 text-[11px] leading-5 text-gray-500">
                  時間で期限切れになる一時URLは表示されなくなるため、固定URLの画像を指定してください。空欄で初期アイコンに戻ります。
                </p>
              </label>
            </div>
          </div>

          <div className="space-y-4 border-t border-white/10 pt-6">
            <h3 className="text-sm font-medium text-gray-300">システム情報</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <ProfileInfo label="現在の権限" value={currentUser.role} />
              <ProfileInfo label="承認状態" value={currentUser.approvalStatus} />
              <ProfileInfo label="注文登録権限" value={canRegisterOrders ? 'あり' : 'なし'} />
              <ProfileInfo label="担当卓" value={currentUser.assignedTableId || '未割当'} />
            </div>
          </div>

          <div className="flex gap-3 pt-6">
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="btn-gold flex flex-1 items-center justify-center gap-2 rounded-2xl py-3 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save size={18} />
              {isSaving ? '保存中...' : '保存する'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProfileInfo({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/5 bg-black/30 p-3">
      <span className="block text-[10px] text-gray-500">{label}</span>
      <span className="text-sm font-medium text-white">{value}</span>
    </div>
  );
}
