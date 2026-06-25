'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { apiFetch } from '@/lib/api';
import { registerFcmToken } from '@/lib/firebase';

interface NotificationSettings {
  enabled: boolean;
  reminderHour: number;
  reminderMinute: number;
  timezone: string;
}

export default function SettingsPage() {
  const { isAuthenticated } = useAuth();
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;
    void apiFetch<NotificationSettings>('/devices/settings').then((res) => {
      if (res.success) setSettings(res.data);
    });
  }, [isAuthenticated]);

  async function handleSave() {
    if (!settings) return;
    const res = await apiFetch<NotificationSettings>('/devices/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
    if (res.success) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  }

  async function handleEnablePush() {
    await registerFcmToken();
  }

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-lg text-center">
        <p className="text-slate-600">
          Đăng nhập để cấu hình thông báo và đồng bộ dữ liệu.
        </p>
      </div>
    );
  }

  if (!settings) {
    return <p className="text-slate-500">Đang tải...</p>;
  }

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="mb-6 text-3xl font-bold text-slate-900">Cài đặt</h1>

      <div className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <label className="font-medium">Nhắc nhở ôn bài</label>
          <input
            type="checkbox"
            checked={settings.enabled}
            onChange={(e) =>
              setSettings({ ...settings, enabled: e.target.checked })
            }
            className="h-5 w-5"
          />
        </div>

        <div>
          <label className="mb-2 block font-medium">Giờ nhắc nhở</label>
          <div className="flex gap-3">
            <input
              type="number"
              min={0}
              max={23}
              value={settings.reminderHour}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  reminderHour: parseInt(e.target.value, 10),
                })
              }
              className="w-20 rounded-lg border border-slate-300 px-3 py-2"
            />
            <span className="self-center">:</span>
            <input
              type="number"
              min={0}
              max={59}
              value={settings.reminderMinute}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  reminderMinute: parseInt(e.target.value, 10),
                })
              }
              className="w-20 rounded-lg border border-slate-300 px-3 py-2"
            />
          </div>
        </div>

        <button
          onClick={() => void handleSave()}
          className="w-full rounded-lg bg-brand-600 py-2 font-medium text-white hover:bg-brand-700"
        >
          {saved ? 'Đã lưu!' : 'Lưu cài đặt'}
        </button>

        <button
          onClick={() => void handleEnablePush()}
          className="w-full rounded-lg border border-slate-300 py-2 font-medium text-slate-700 hover:bg-slate-50"
        >
          Bật thông báo đẩy
        </button>
      </div>
    </div>
  );
}
