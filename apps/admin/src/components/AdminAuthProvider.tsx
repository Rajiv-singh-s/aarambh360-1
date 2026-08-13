'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import type { AuthMeResponseDto } from '@aarambh360/types';
import { clearAdminToken, getAdminToken, verifyAdminSession } from '../lib/api';

const ADMIN_ROLES = new Set(['EDITOR', 'MODERATOR', 'ADMIN']);

type AdminAuthContextValue = {
  user: AuthMeResponseDto | null;
  loading: boolean;
  logout: () => void;
};

const AdminAuthContext = createContext<AdminAuthContextValue>({
  user: null,
  loading: true,
  logout: () => undefined,
});

export function useAdminAuth() {
  return useContext(AdminAuthContext);
}

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<AuthMeResponseDto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      if (pathname === '/login') {
        setLoading(false);
        return;
      }

      const token = getAdminToken();
      if (!token) {
        router.replace('/login');
        setLoading(false);
        return;
      }

      try {
        const profile = await verifyAdminSession();
        if (!ADMIN_ROLES.has(profile.user.role)) {
          clearAdminToken();
          router.replace('/login');
          return;
        }
        if (!cancelled) {
          setUser(profile);
        }
      } catch {
        clearAdminToken();
        router.replace('/login');
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    bootstrap();
    return () => {
      cancelled = true;
    };
  }, [pathname, router]);

  const value = useMemo(
    () => ({
      user,
      loading,
      logout: () => {
        clearAdminToken();
        setUser(null);
        router.replace('/login');
      },
    }),
    [user, loading, router],
  );

  if (loading && pathname !== '/login') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-400">
        Verifying editor session…
      </div>
    );
  }

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}
