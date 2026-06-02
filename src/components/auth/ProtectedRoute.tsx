import React from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Home, Loader2, LogOut, ShieldAlert } from 'lucide-react';
import { useMockApp } from '../../lib/MockAppContext';

export function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: string[] }) {
  const { currentUser, logout, isAuthReady, isProfileLoading, profileError } = useMockApp();
  const navigate = useNavigate();
  const location = useLocation();
  const loginPath = location.pathname.startsWith('/guest') ? '/guest-login' : '/login';
  const isAuthPage = ['/login', '/register', '/guest-login', '/guest-register'].includes(location.pathname);

  if (!isAuthReady || isProfileLoading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-gray-400">
        <Loader2 className="animate-spin text-[#d4af37]" size={32} />
        <div className="text-sm tracking-widest">
          {!isAuthReady ? 'ログイン状態を確認中...' : 'プロフィールを確認中...'}
        </div>
      </div>
    );
  }

  if (profileError && !currentUser) {
    if (isAuthPage) return <>{children}</>;
    return (
      <AccessState
        icon="error"
        title="認証エラー"
        body={profileError}
        action={<Link to={loginPath} className="btn-gold px-8 py-3 rounded-xl font-bold">ログインへ</Link>}
      />
    );
  }

  if (!currentUser) {
    if (isAuthPage) return <>{children}</>;
    return <Navigate to={loginPath} replace state={{ from: location.pathname }} />;
  }

  if (currentUser.isDeleted) {
    return (
      <AccessState
        icon="error"
        title="アカウントが停止されています"
        body="このアカウントは管理者により停止されています。"
        action={
          <button onClick={logout} className="btn-gold px-8 py-3 rounded-xl font-bold flex items-center gap-2">
            <LogOut size={18} /> ログアウト
          </button>
        }
      />
    );
  }

  if (currentUser.approvalStatus === 'pending' && location.pathname !== '/pending') {
    return (
      <AccessState
        icon="loading"
        title="承認待ち"
        body="アカウントは現在管理者の承認待ちです。承認後に各機能を利用できます。"
        action={
          <button onClick={logout} className="btn-outline-gold px-6 py-3 rounded-xl text-sm flex items-center gap-2">
            <LogOut size={16} /> ログアウト
          </button>
        }
      />
    );
  }

  if (currentUser.approvalStatus === 'rejected') {
    return (
      <AccessState
        icon="error"
        title="承認されませんでした"
        body="このアカウントは承認されていません。必要な場合はスタッフへお問い合わせください。"
        action={
          <button onClick={logout} className="btn-gold px-8 py-3 rounded-xl font-bold flex items-center gap-2">
            <LogOut size={18} /> ログアウト
          </button>
        }
      />
    );
  }

  const isAuthorized = allowedRoles ? allowedRoles.includes(currentUser.role) : true;

  if (!isAuthorized) {
    return (
      <AccessState
        icon="error"
        title="アクセス権限がありません"
        body="この画面は現在の権限では表示できません。必要な場合は管理者に権限変更を依頼してください。"
        action={
          <div className="flex gap-4">
            <button onClick={() => navigate(-1)} className="btn-outline-gold px-6 py-3 rounded-xl text-sm">戻る</button>
            <Link to={currentUser.role === 'customer' ? '/guest' : '/app'} className="btn-gold px-6 py-3 rounded-xl text-sm flex items-center gap-2">
              <Home size={18} /> ホーム
            </Link>
          </div>
        }
      />
    );
  }

  return <>{children}</>;
}

function AccessState({
  icon,
  title,
  body,
  action,
}: {
  icon: 'loading' | 'error';
  title: string;
  body: string;
  action: React.ReactNode;
}) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-6 text-center">
      <div className="iphone-card neon-alert flex h-20 w-20 items-center justify-center text-red-300">
        {icon === 'loading' ? <Loader2 className="animate-spin text-[#d4af37]" size={42} /> : <ShieldAlert size={42} />}
      </div>
      <div>
        <h2 className="gold-gradient-text text-xl font-black tracking-[0.18em]">{title}</h2>
        <p className="mx-auto mt-3 max-w-xs text-sm leading-6 text-gray-400">{body}</p>
      </div>
      {action}
    </div>
  );
}
