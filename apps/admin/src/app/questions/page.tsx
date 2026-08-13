'use client';

import { useEffect, useState } from 'react';
import type { AuditLogEntryDto } from '@aarambh360/types';
import { adminFetch } from '../../lib/api';

type PendingQuestion = {
  id: string;
  text: string;
  publishStatus: string;
  updatedAt: string;
};

export default function QuestionsAdminPage() {
  const [auditLog, setAuditLog] = useState<AuditLogEntryDto[]>([]);
  const [pending, setPending] = useState<PendingQuestion[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const loadData = async () => {
    const [nextAudit, nextPending] = await Promise.all([
      adminFetch<AuditLogEntryDto[]>('/admin/audit-log'),
      adminFetch<PendingQuestion[]>('/admin/questions/pending'),
    ]);
    setAuditLog(nextAudit);
    setPending(nextPending);
  };

  useEffect(() => {
    loadData().catch((err) => setError(err.message));
  }, []);

  const handlePublish = async (id: string) => {
    setError(null);
    try {
      await adminFetch(`/admin/questions/${id}/publish`, { method: 'POST' });
      setMessage('Question published');
      await loadData();
    } catch (err: any) {
      setError(err.message ?? 'Publish failed');
    }
  };

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-white">Question Bank & Audit Log</h2>
      {error ? <p className="text-red-400">{error}</p> : null}
      {message ? <p className="text-emerald-400">{message}</p> : null}

      <section className="space-y-3">
        <h3 className="text-lg font-semibold text-white">Pending review</h3>
        <div className="rounded-xl border border-slate-800 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-900 text-slate-400">
              <tr>
                <th className="text-left p-3">Question</th>
                <th className="text-left p-3">Status</th>
                <th className="text-left p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pending.length === 0 ? (
                <tr>
                  <td colSpan={3} className="p-4 text-slate-500">
                    No questions awaiting review.
                  </td>
                </tr>
              ) : (
                pending.map((question) => (
                  <tr key={question.id} className="border-t border-slate-800">
                    <td className="p-3 text-slate-200">{question.text.slice(0, 120)}…</td>
                    <td className="p-3 text-amber-400">{question.publishStatus}</td>
                    <td className="p-3">
                      <button
                        type="button"
                        onClick={() => handlePublish(question.id)}
                        className="text-xs rounded bg-emerald-700 px-2 py-1 text-white"
                      >
                        Publish
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="text-lg font-semibold text-white">Recent audit log</h3>
        <div className="rounded-xl border border-slate-800 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-900 text-slate-400">
              <tr>
                <th className="text-left p-3">Action</th>
                <th className="text-left p-3">Entity</th>
                <th className="text-left p-3">Actor</th>
                <th className="text-left p-3">When</th>
              </tr>
            </thead>
            <tbody>
              {auditLog.map((entry) => (
                <tr key={entry.id} className="border-t border-slate-800">
                  <td className="p-3 text-white">{entry.action}</td>
                  <td className="p-3 text-slate-300">
                    {entry.entityType} · {entry.entityId.slice(0, 8)}
                  </td>
                  <td className="p-3 text-slate-400">{entry.userId ?? 'system'}</td>
                  <td className="p-3 text-slate-400">
                    {new Date(entry.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
