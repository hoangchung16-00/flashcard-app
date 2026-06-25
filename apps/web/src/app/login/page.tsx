'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';

export default function LoginPage() {
  const { login, register, googleLogin } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const err = isRegister
      ? await register(email, password)
      : await login(email, password);

    if (err) setError(err);
    setIsLoading(false);
  }

  async function handleGoogleLogin() {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId) {
      setError('Google OAuth chưa được cấu hình');
      return;
    }

    const redirectUri = `${window.location.origin}/login`;
    const scope = 'openid email profile';
    const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=token id_token&scope=${encodeURIComponent(scope)}&nonce=${Date.now()}`;

    const popup = window.open(url, 'google-login', 'width=500,height=600');
    if (!popup) {
      setError('Không thể mở cửa sổ đăng nhập Google');
      return;
    }

    const checkClosed = setInterval(() => {
      if (popup.closed) {
        clearInterval(checkClosed);
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
          onClick={() => void handleGoogleLogin()}
          className="w-full rounded-lg border border-slate-300 py-2 font-medium text-slate-700 hover:bg-slate-50"
        >
          Đăng nhập với Google
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
