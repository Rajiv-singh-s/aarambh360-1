'use client';

import { FormEvent, useEffect, useState } from 'react';
import type { AdminTopicInputDto } from '@aarambh360/types';
import { adminFetch } from '../../lib/api';

type SubjectRow = { id: string; name: string; code: string };
type TopicRow = {
  id: string;
  subjectId: string;
  name: string;
  slug: string;
  publishStatus: string;
};

export default function TopicsAdminPage() {
  const [subjects, setSubjects] = useState<SubjectRow[]>([]);
  const [topics, setTopics] = useState<TopicRow[]>([]);
  const [subjectId, setSubjectId] = useState('');
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const loadTopics = async (filterSubjectId?: string) => {
    const query = filterSubjectId ? `?subjectId=${filterSubjectId}` : '';
    const [nextSubjects, nextTopics] = await Promise.all([
      adminFetch<SubjectRow[]>('/admin/subjects'),
      adminFetch<TopicRow[]>(`/admin/topics${query}`),
    ]);
    setSubjects(nextSubjects);
    setTopics(nextTopics);
    if (!subjectId && nextSubjects[0]?.id) {
      setSubjectId(nextSubjects[0].id);
    }
  };

  useEffect(() => {
    loadTopics().catch((err) => setError(err.message));
  }, []);

  useEffect(() => {
    if (subjectId) {
      loadTopics(subjectId).catch((err) => setError(err.message));
    }
  }, [subjectId]);

  const handleCreate = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setMessage(null);
    try {
      const payload: AdminTopicInputDto = { subjectId, name, slug };
      await adminFetch('/admin/topics', { method: 'POST', body: JSON.stringify(payload) });
      setMessage('Topic draft created');
      setName('');
      setSlug('');
      await loadTopics(subjectId);
    } catch (err: any) {
      setError(err.message ?? 'Failed to create topic');
    }
  };

  const handlePublish = async (id: string) => {
    try {
      await adminFetch(`/admin/topics/${id}/review`, { method: 'POST' });
      await adminFetch(`/admin/topics/${id}/publish`, { method: 'POST' });
      await loadTopics(subjectId);
      setMessage('Topic published');
    } catch (err: any) {
      setError(err.message ?? 'Publish failed');
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Topics CMS</h2>
      {error ? <p className="text-red-400">{error}</p> : null}
      {message ? <p className="text-emerald-400">{message}</p> : null}

      <form onSubmit={handleCreate} className="rounded-xl border border-slate-800 bg-slate-900 p-6 space-y-3 max-w-xl">
        <h3 className="font-semibold text-white">Create topic (draft)</h3>
        <select
          className="w-full rounded-lg bg-slate-950 border border-slate-700 p-3 text-sm"
          value={subjectId}
          onChange={(e) => setSubjectId(e.target.value)}
        >
          {subjects.map((subject) => (
            <option key={subject.id} value={subject.id}>
              {subject.name} ({subject.code})
            </option>
          ))}
        </select>
        <input
          className="w-full rounded-lg bg-slate-950 border border-slate-700 p-3 text-sm"
          placeholder="Topic name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          className="w-full rounded-lg bg-slate-950 border border-slate-700 p-3 text-sm"
          placeholder="slug-kebab-case"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
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
              <th className="text-left p-3">Slug</th>
              <th className="text-left p-3">Status</th>
              <th className="text-left p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {topics.map((topic) => (
              <tr key={topic.id} className="border-t border-slate-800">
                <td className="p-3 text-white">{topic.name}</td>
                <td className="p-3 text-slate-300">{topic.slug}</td>
                <td className="p-3 text-slate-400">{topic.publishStatus}</td>
                <td className="p-3">
                  {topic.publishStatus !== 'PUBLISHED' ? (
                    <button
                      type="button"
                      onClick={() => handlePublish(topic.id)}
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
