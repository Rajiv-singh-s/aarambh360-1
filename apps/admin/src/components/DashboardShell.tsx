'use client';

import { usePathname } from 'next/navigation';
import { useAdminAuth } from './AdminAuthProvider';

const navItems = [
  { href: '/', label: 'Overview', icon: '📊' },
  { href: '/subjects', label: 'Subjects', icon: '📚' },
  { href: '/topics', label: 'Topics', icon: '🗂️' },
  { href: '/lessons', label: 'Lessons', icon: '📝' },
  { href: '/questions', label: 'Questions & Audit', icon: '🎯' },
  { href: '/questions/new', label: 'New MCQ', icon: '➕' },
  { href: '/mains', label: 'Mains Questions', icon: '✍️' },
];

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAdminAuth();

  if (pathname === '/login') {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-slate-900 border-r border-slate-800 p-6 flex flex-col justify-between hidden md:flex">
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-lg text-white shadow-lg shadow-indigo-500/30">
              A
            </div>
            <div>
              <h1 className="font-bold text-base text-white tracking-wide">Aarambh360</h1>
              <p className="text-xs text-indigo-400 font-medium">Admin Portal v1.0</p>
            </div>
          </div>

          <nav className="space-y-1 pt-4 text-sm font-medium">
            {navItems.map((item) => {
              const active = pathname === item.href;
              return (
                <a
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition ${
                    active
                      ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                  }`}
                >
                  <span>{item.icon}</span> {item.label}
                </a>
              );
            })}
            <button
              type="button"
              onClick={logout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition text-left"
            >
              <span>🔐</span> Sign out
            </button>
          </nav>
        </div>

        <div className="p-3 bg-slate-800/60 rounded-lg border border-slate-700/50 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-semibold text-slate-300">Backend API Connected</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500">Target: NestJS Port 4000</p>
        </div>
      </aside>

      <div className="flex-1 flex flex-col">
        <header className="h-16 border-b border-slate-800 bg-slate-900/50 backdrop-blur px-8 flex items-center justify-between sticky top-0 z-10">
          <div className="text-sm font-semibold text-slate-200">Aarambh360 CMS</div>
          <div className="flex items-center gap-4">
            <span className="text-xs bg-indigo-950 text-indigo-400 px-3 py-1 rounded-full border border-indigo-800 font-mono">
              {user?.user.role ?? 'EDITOR'}
            </span>
            <div className="w-8 h-8 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center text-xs font-bold text-slate-300">
              {(user?.user.email?.[0] ?? 'A').toUpperCase()}
            </div>
          </div>
        </header>

        <main className="flex-1 p-8 bg-slate-950 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
