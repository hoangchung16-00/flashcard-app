'use client';

import { useEffect, useState } from 'react';
import { apiFetch, setTokens } from '@/lib/api';

export default function GoogleCallbackPage() {
  const [status, setStatus] = useState('Đang xử lý đăng nhập Google...');

  useEffect(() => {
    async function handleCallback(): Promise<void> {
      const hash = window.location.hash.startsWith('#')
        ? window.location.hash.slice(1)
        : window.location.hash;
      const params = new URLSearchParams(hash);

      const error = params.get('error');
      if (error) {
        const message = params.get('error_description') ?? error;
        setStatus(`Đăng nhập thất bại: ${message}`);
        window.opener?.postMessage(
          { type: 'google-auth-error', error: message },
          window.location.origin,
        );
        setTimeout(() => window.close(), 2500);
        return;
      }

      const idToken = params.get('id_token');
      const state = params.get('state');
      const expectedState = localStorage.getItem('google_oauth_state');

      if (!idToken) {
        setStatus('Không nhận được id_token từ Google');
        return;
      }

      if (!state || state !== expectedState) {
        setStatus('Xác thực state thất bại — thử lại');
        window.opener?.postMessage(
          { type: 'google-auth-error', error: 'Xác thực state thất bại' },
          window.location.origin,
        );
        setTimeout(() => window.close(), 2500);
        return;
      }

      localStorage.removeItem('google_oauth_state');

      const res = await apiFetch<{
        accessToken: string;
        refreshToken: string;
      }>('/auth/google', {
        method: 'POST',
        body: JSON.stringify({ idToken }),
      });

      if (!res.success) {
        setStatus(res.message);
        window.opener?.postMessage(
          { type: 'google-auth-error', error: res.message },
          window.location.origin,
        );
        setTimeout(() => window.close(), 2500);
        return;
      }

      setTokens(res.data.accessToken, res.data.refreshToken);

      window.opener?.postMessage(
        { type: 'google-auth-success' },
        window.location.origin,
      );
      window.close();
    }

    void handleCallback();
  }, []);

  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <p className="text-slate-600">{status}</p>
    </div>
  );
}
