import type { Metadata } from 'next';
import { AuthProvider } from '@/lib/auth-context';
import { Sidebar } from '@/components/Sidebar';
import { HeaderStats } from '@/components/HeaderStats';
import './globals.css';

export const metadata: Metadata = {
  title: 'Flashcard Learning App',
  description: 'Learn with spaced repetition',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body>
        <AuthProvider>
          <div className="flex min-h-screen">
            <Sidebar />
            <main className="flex flex-1 flex-col">
              <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
                <HeaderStats />
              </header>
              <div className="flex-1 p-6">{children}</div>
            </main>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
