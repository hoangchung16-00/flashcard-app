'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { syncToServer } from '@/lib/store';

export default function LoginPage() {
  const router = useRouter();
  const { login, register, refreshAuth } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  useEffect(() => {
    function onMessage(event: MessageEvent): void {
      if (event.origin !== window.location.origin) return;

      if (event.data?.type === 'google-auth-success') {
        setIsGoogleLoading(false);
        refreshAuth();
        void syncToServer().then(() => router.push('/'));
      }

      if (event.data?.type === 'google-auth-error') {
        setIsGoogleLoading(false);
        setError(event.data.error ?? 'Đăng nhập Google thất bại');
      }
    }

    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [router, refreshAuth]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const err = isRegister
      ? await register(email, password)
      : await login(email, password);

    if (err) setError(err);
    else router.push('/');
    setIsLoading(false);
  }

  function handleGoogleLogin() {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId) {
      setError('Google OAuth chưa được cấu hình (NEXT_PUBLIC_GOOGLE_CLIENT_ID)');
      return;
    }

    setError(null);
    setIsGoogleLoading(true);

    const redirectUri = `${window.location.origin}/auth/google/callback`;
    const state = crypto.randomUUID();
    const nonce = crypto.randomUUID();

    localStorage.setItem('google_oauth_state', state);

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'id_token',
      scope: 'openid email profile',
      state,
      nonce,
      prompt: 'select_account',
    });

    const url = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
    const popup = window.open(
      url,
      'google-login',
      'width=500,height=650,scrollbars=yes',
    );

    if (!popup) {
      setIsGoogleLoading(false);
      setError('Trình duyệt chặn popup — hãy cho phép popup cho localhost');
      return;
    }

    const timer = setInterval(() => {
      if (popup.closed) {
        clearInterval(timer);
        setIsGoogleLoading(false);
      }
    }, 500);
  }

  return (
    <div className="mx-auto max-w-md">
      <h1 className="mb-6 text-3xl font-bold text-slate-900">
        {isRegister ? 'Đăng ký' : 'Đăng nhập'}
      </h1>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        {error && (
          <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
            {error}
          </p>
        )}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-brand-500 focus:outline-none"
        />
        <input
          type="password"
          placeholder="Mật khẩu (tối thiểu 6 ký tự)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-brand-500 focus:outline-none"
        />

        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-lg bg-brand-600 py-2 font-medium text-white hover:bg-brand-700 disabled:opacity-50"
        >
          {isLoading ? 'Đang xử lý...' : isRegister ? 'Đăng ký' : 'Đăng nhập'}
        </button>

        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={isGoogleLoading}
          className="w-full rounded-lg border border-slate-300 py-2 font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
        >
          {isGoogleLoading ? 'Đang mở Google...' : 'Đăng nhập với Google'}
        </button>

        <p className="text-center text-sm text-slate-600">
          {isRegister ? 'Đã có tài khoản?' : 'Chưa có tài khoản?'}{' '}
          <button
            type="button"
            onClick={() => setIsRegister(!isRegister)}
            className="text-brand-600 hover:underline"
          >
            {isRegister ? 'Đăng nhập' : 'Đăng ký'}
          </button>
        </p>
      </form>

      <Link
        href="/"
        className="mt-4 block text-center text-sm text-slate-500 hover:text-brand-600"
      >
        ← Về trang chủ
      </Link>
    </div>
  );
}
