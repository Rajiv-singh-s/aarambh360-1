'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { API_BASE, clearAdminToken, setAdminToken } from '../../lib/api';

const ADMIN_ROLES = new Set(['EDITOR', 'MODERATOR', 'ADMIN']);

export default function AdminLoginPage() {
  const router = useRouter();
  const [token, setToken] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!token.trim()) {
      setError('Paste a Firebase ID token from an EDITOR/ADMIN account.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/auth/me`, {
        headers: { Authorization: `Bearer ${token.trim()}` },
      });

      if (!response.ok) {
        throw new Error('Token rejected by backend. Sign in via Firebase first.');
      }

      const payload = await response.json();
      if (!ADMIN_ROLES.has(payload.data.user.role)) {
        clearAdminToken();
        throw new Error('This account does not have CMS permissions (EDITOR+ required).');
      }

      setAdminToken(token.trim());
      router.push('/');
    } catch (err: any) {
      setError(err.message ?? 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-lg rounded-xl border border-slate-800 bg-slate-900 p-8 space-y-4"
      >
        <h1 className="text-2xl font-bold text-white">Aarambh360 Admin Login</h1>
        <p className="text-sm text-slate-400">
          Sign in via Firebase in the mobile app, copy the ID token, and paste it here for CMS access.
        </p>
        <textarea
          value={token}
          onChange={(event) => setToken(event.target.value)}
          className="w-full h-32 rounded-lg bg-slate-950 border border-slate-700 p-3 text-sm text-slate-200"
          placeholder="Firebase ID token"
        />
        {error ? <p className="text-sm text-red-400">{error}</p> : null}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 py-2.5 text-white font-semibold"
        >
          {loading ? 'Verifying…' : 'Continue to CMS'}
        </button>
      </form>
    </div>
  );
}
