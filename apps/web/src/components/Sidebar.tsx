'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

const navItems = [
  { href: '/', label: 'Dashboard' },
  { href: '/decks', label: 'Decks' },
  { href: '/review', label: 'Review' },
  { href: '/search', label: 'Search' },
  { href: '/settings', label: 'Settings' },
];

export function Sidebar() {
  const pathname = usePathname();
  const { isAuthenticated, logout } = useAuth();

  return (
    <aside className="flex h-full w-64 flex-col border-r border-slate-200 bg-white p-4">
      <div className="mb-8">
        <h1 className="text-xl font-bold text-brand-700">Flashcard</h1>
        <p className="text-sm text-slate-500">Spaced Repetition</p>
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== '/' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                isActive
                  ? 'bg-brand-50 text-brand-700'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-200 pt-4">
        {isAuthenticated ? (
          <button
            onClick={logout}
            className="w-full rounded-lg px-3 py-2 text-left text-sm text-slate-600 hover:bg-slate-50"
          >
            Đăng xuất
          </button>
        ) : (
          <Link
            href="/login"
            className="block rounded-lg px-3 py-2 text-sm font-medium text-brand-600 hover:bg-brand-50"
          >
            Đăng nhập
          </Link>
        )}
      </div>
    </aside>
  );
}
