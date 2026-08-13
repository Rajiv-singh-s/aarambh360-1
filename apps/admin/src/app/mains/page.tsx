'use client';

import { FormEvent, useEffect, useState } from 'react';
import type { AdminMainsQuestionInputDto } from '@aarambh360/types';
import { adminFetch } from '../../lib/api';

export default function MainsAdminPage() {
  const [text, setText] = useState('');
  const [gsPaper, setGsPaper] = useState('GS1');
  const [maxMarks, setMaxMarks] = useState(10);
  const [modelAnswer, setModelAnswer] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [createdId, setCreatedId] = useState<string | null>(null);

  useEffect(() => {
    setCreatedId(null);
  }, [text]);

  const handleCreate = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setMessage(null);
    try {
      const payload: AdminMainsQuestionInputDto = {
        text,
        gsPaper,
        maxMarks,
        modelAnswer,
      };
      const created = await adminFetch<{ id: string }>('/admin/mains', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      setCreatedId(created.id);
      setMessage(`Mains draft created (${created.id})`);
    } catch (err: any) {
      setError(err.message ?? 'Failed to create mains question');
    }
  };

  const handlePublish = async () => {
    if (!createdId) return;
    setError(null);
    try {
      await adminFetch(`/admin/mains/${createdId}/review`, { method: 'POST' });
      await adminFetch(`/admin/mains/${createdId}/publish`, { method: 'POST' });
      setMessage('Mains question published');
    } catch (err: any) {
      setError(err.message ?? 'Publish failed');
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      <h2 className="text-2xl font-bold text-white">Mains Questions CMS</h2>
      {error ? <p className="text-red-400">{error}</p> : null}
      {message ? <p className="text-emerald-400">{message}</p> : null}

      <form onSubmit={handleCreate} className="space-y-4 rounded-xl border border-slate-800 bg-slate-900 p-6">
        <textarea
          className="w-full rounded-lg bg-slate-950 border border-slate-700 p-3 text-sm min-h-28"
          placeholder="Question text"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <div className="grid grid-cols-2 gap-3">
          <select
            className="rounded-lg bg-slate-950 border border-slate-700 p-3 text-sm"
            value={gsPaper}
            onChange={(e) => setGsPaper(e.target.value)}
          >
            {['GS1', 'GS2', 'GS3', 'GS4', 'ESSAY', 'GENERAL'].map((paper) => (
              <option key={paper} value={paper}>
                {paper}
              </option>
            ))}
          </select>
          <input
            type="number"
            className="rounded-lg bg-slate-950 border border-slate-700 p-3 text-sm"
            value={maxMarks}
            onChange={(e) => setMaxMarks(Number(e.target.value))}
          />
        </div>
        <textarea
          className="w-full rounded-lg bg-slate-950 border border-slate-700 p-3 text-sm min-h-32"
          placeholder="Model answer (optional)"
          value={modelAnswer}
          onChange={(e) => setModelAnswer(e.target.value)}
        />
        <div className="flex gap-3">
          <button type="submit" className="rounded-lg bg-indigo-600 px-4 py-2 text-white font-semibold">
            Save draft
          </button>
          {createdId ? (
            <button
              type="button"
              onClick={handlePublish}
              className="rounded-lg bg-emerald-700 px-4 py-2 text-white font-semibold"
            >
              Submit review & publish
            </button>
          ) : null}
        </div>
      </form>
    </div>
  );
}
