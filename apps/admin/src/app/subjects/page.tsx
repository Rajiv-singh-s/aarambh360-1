'use client';

import { FormEvent, useEffect, useState } from 'react';
import type { AdminDashboardStatsDto, AdminSubjectInputDto } from '@aarambh360/types';
import { adminFetch } from '../../lib/api';

type SubjectRow = {
  id: string;
  examId: string;
  code: string;
  name: string;
  publishStatus: string;
};

export default function SubjectsAdminPage() {
  const [stats, setStats] = useState<AdminDashboardStatsDto | null>(null);
  const [subjects, setSubjects] = useState<SubjectRow[]>([]);
  const [examId, setExamId] = useState('');
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    const [nextStats, nextSubjects] = await Promise.all([
      adminFetch<AdminDashboardStatsDto>('/admin/dashboard'),
      adminFetch<SubjectRow[]>('/admin/subjects'),
    ]);
    setStats(nextStats);
    setSubjects(nextSubjects);
    if (!examId && nextSubjects[0]?.examId) {
      setExamId(nextSubjects[0].examId);
    }
  };

  useEffect(() => {
    loadData().catch((err) => setError(err.message));
  }, []);

  const handleCreate = async (event: FormEvent) => {
    event.preventDefault();
    setMessage(null);
    setError(null);
    try {
      const payload: AdminSubjectInputDto = { examId, code, name };
      await adminFetch('/admin/subjects', { method: 'POST', body: JSON.stringify(payload) });
      setMessage('Subject draft created');
      setCode('');
      setName('');
      await loadData();
    } catch (err: any) {
      setError(err.message ?? 'Failed to create subject');
    }
  };

  const handlePublish = async (id: string) => {
    setError(null);
    try {
      await adminFetch(`/admin/subjects/${id}/review`, { method: 'POST' });
      await adminFetch(`/admin/subjects/${id}/publish`, { method: 'POST' });
      await loadData();
      setMessage('Subject published');
    } catch (err: any) {
      setError(err.message ?? 'Publish failed');
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Subjects CMS</h2>
      {error ? <p className="text-red-400">{error}</p> : null}
      {message ? <p className="text-emerald-400">{message}</p> : null}

      {stats ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <StatCard label="Subjects" value={stats.subjects} />
          <StatCard label="Topics" value={stats.topics} />
          <StatCard label="Lessons" value={stats.lessons} />
          <StatCard label="Questions" value={stats.questions} />
          <StatCard label="Mains" value={stats.mainsQuestions} />
          <StatCard label="Pending Review" value={stats.pendingReview} />
        </div>
      ) : null}

      <form onSubmit={handleCreate} className="rounded-xl border border-slate-800 bg-slate-900 p-6 space-y-3 max-w-xl">
        <h3 className="font-semibold text-white">Create subject (draft)</h3>
        <input
          className="w-full rounded-lg bg-slate-950 border border-slate-700 p-3 text-sm"
          placeholder="Exam ID (UUID)"
          value={examId}
          onChange={(e) => setExamId(e.target.value)}
        />
        <input
          className="w-full rounded-lg bg-slate-950 border border-slate-700 p-3 text-sm"
          placeholder="Subject code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />
        <input
          className="w-full rounded-lg bg-slate-950 border border-slate-700 p-3 text-sm"
          placeholder="Subject name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button type="submit" className="rounded-lg bg-indigo-600 px-4 py-2 text-white font-semibold">
          Save draft
        </button>
      </form>

      <div className="rounded-xl border border-slate-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-900 text-slate-400">
            <tr>
              <th className="text-left p-3">Name</th>
              <th className="text-left p-3">Code</th>
              <th className="text-left p-3">Status</th>
              <th className="text-left p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {subjects.map((subject) => (
              <tr key={subject.id} className="border-t border-slate-800">
                <td className="p-3 text-white">{subject.name}</td>
                <td className="p-3 text-slate-300">{subject.code}</td>
                <td className="p-3 text-slate-400">{subject.publishStatus}</td>
                <td className="p-3">
                  {subject.publishStatus !== 'PUBLISHED' ? (
                    <button
                      type="button"
                      onClick={() => handlePublish(subject.id)}
                      className="text-xs rounded bg-emerald-700 px-2 py-1 text-white"
                    >
                      Publish
                    </button>
                  ) : (
                    <span className="text-xs text-emerald-400">Live</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className="text-2xl font-bold text-white mt-1">{value}</p>
    </div>
  );
}
