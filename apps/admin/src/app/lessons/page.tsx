'use client';

import { FormEvent, useEffect, useState } from 'react';
import type { AdminChapterInputDto, AdminLessonInputDto } from '@aarambh360/types';
import { MarkdownEditor } from '../../components/MarkdownEditor';
import { adminFetch } from '../../lib/api';

type SubjectRow = { id: string; name: string; code: string };
type ChapterRow = { id: string; subjectId: string; title: string; slug: string; publishStatus: string };
type LessonRow = {
  id: string;
  chapterId: string;
  title: string;
  slug: string;
  publishStatus: string;
};

export default function LessonsAdminPage() {
  const [subjects, setSubjects] = useState<SubjectRow[]>([]);
  const [chapters, setChapters] = useState<ChapterRow[]>([]);
  const [lessons, setLessons] = useState<LessonRow[]>([]);
  const [subjectId, setSubjectId] = useState('');
  const [chapterId, setChapterId] = useState('');
  const [chapterTitle, setChapterTitle] = useState('');
  const [chapterSlug, setChapterSlug] = useState('');
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [content, setContent] = useState('# Introduction\n\nLesson content goes here.');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const loadChapters = async (filterSubjectId: string) => {
    const nextChapters = await adminFetch<ChapterRow[]>(`/admin/chapters?subjectId=${filterSubjectId}`);
    setChapters(nextChapters);
    if (!chapterId && nextChapters[0]?.id) {
      setChapterId(nextChapters[0].id);
    }
  };

  const loadLessons = async (filterChapterId: string) => {
    const nextLessons = await adminFetch<LessonRow[]>(`/admin/lessons?chapterId=${filterChapterId}`);
    setLessons(nextLessons);
  };

  useEffect(() => {
    adminFetch<SubjectRow[]>('/admin/subjects')
      .then((nextSubjects) => {
        setSubjects(nextSubjects);
        if (nextSubjects[0]?.id) {
          setSubjectId(nextSubjects[0].id);
        }
      })
      .catch((err) => setError(err.message));
  }, []);

  useEffect(() => {
    if (subjectId) {
      loadChapters(subjectId).catch((err) => setError(err.message));
    }
  }, [subjectId]);

  useEffect(() => {
    if (chapterId) {
      loadLessons(chapterId).catch((err) => setError(err.message));
    }
  }, [chapterId]);

  const handleCreateChapter = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    try {
      const payload: AdminChapterInputDto = {
        subjectId,
        title: chapterTitle,
        slug: chapterSlug,
      };
      const created = await adminFetch<{ id: string }>('/admin/chapters', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      setChapterId(created.id);
      setChapterTitle('');
      setChapterSlug('');
      await loadChapters(subjectId);
      setMessage('Chapter draft created');
    } catch (err: any) {
      setError(err.message ?? 'Failed to create chapter');
    }
  };

  const handleCreateLesson = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    try {
      const payload: AdminLessonInputDto = { chapterId, title, slug, content };
      await adminFetch('/admin/lessons', { method: 'POST', body: JSON.stringify(payload) });
      setTitle('');
      setSlug('');
      await loadLessons(chapterId);
      setMessage('Lesson draft saved');
    } catch (err: any) {
      setError(err.message ?? 'Failed to create lesson');
    }
  };

  const handlePublish = async (id: string) => {
    try {
      await adminFetch(`/admin/lessons/${id}/review`, { method: 'POST' });
      await adminFetch(`/admin/lessons/${id}/publish`, { method: 'POST' });
      await loadLessons(chapterId);
      setMessage('Lesson published');
    } catch (err: any) {
      setError(err.message ?? 'Publish failed');
    }
  };

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-white">Lessons CMS</h2>
      {error ? <p className="text-red-400">{error}</p> : null}
      {message ? <p className="text-emerald-400">{message}</p> : null}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <form onSubmit={handleCreateChapter} className="rounded-xl border border-slate-800 bg-slate-900 p-6 space-y-3">
          <h3 className="font-semibold text-white">Create chapter</h3>
          <select
            className="w-full rounded-lg bg-slate-950 border border-slate-700 p-3 text-sm"
            value={subjectId}
            onChange={(e) => setSubjectId(e.target.value)}
          >
            {subjects.map((subject) => (
              <option key={subject.id} value={subject.id}>
                {subject.name}
              </option>
            ))}
          </select>
          <input
            className="w-full rounded-lg bg-slate-950 border border-slate-700 p-3 text-sm"
            placeholder="Chapter title"
            value={chapterTitle}
            onChange={(e) => setChapterTitle(e.target.value)}
          />
          <input
            className="w-full rounded-lg bg-slate-950 border border-slate-700 p-3 text-sm"
            placeholder="chapter-slug"
            value={chapterSlug}
            onChange={(e) => setChapterSlug(e.target.value)}
          />
          <button type="submit" className="rounded-lg bg-indigo-600 px-4 py-2 text-white font-semibold">
            Save chapter draft
          </button>
        </form>

        <form onSubmit={handleCreateLesson} className="rounded-xl border border-slate-800 bg-slate-900 p-6 space-y-3">
          <h3 className="font-semibold text-white">Create lesson with markdown</h3>
          <select
            className="w-full rounded-lg bg-slate-950 border border-slate-700 p-3 text-sm"
            value={chapterId}
            onChange={(e) => setChapterId(e.target.value)}
          >
            {chapters.map((chapter) => (
              <option key={chapter.id} value={chapter.id}>
                {chapter.title}
              </option>
            ))}
          </select>
          <input
            className="w-full rounded-lg bg-slate-950 border border-slate-700 p-3 text-sm"
            placeholder="Lesson title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <input
            className="w-full rounded-lg bg-slate-950 border border-slate-700 p-3 text-sm"
            placeholder="lesson-slug"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
          />
          <MarkdownEditor value={content} onChange={setContent} />
          <button type="submit" className="rounded-lg bg-indigo-600 px-4 py-2 text-white font-semibold">
            Save lesson draft
          </button>
        </form>
      </div>

      <div className="rounded-xl border border-slate-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-900 text-slate-400">
            <tr>
              <th className="text-left p-3">Title</th>
              <th className="text-left p-3">Slug</th>
              <th className="text-left p-3">Status</th>
              <th className="text-left p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {lessons.map((lesson) => (
              <tr key={lesson.id} className="border-t border-slate-800">
                <td className="p-3 text-white">{lesson.title}</td>
                <td className="p-3 text-slate-300">{lesson.slug}</td>
                <td className="p-3 text-slate-400">{lesson.publishStatus}</td>
                <td className="p-3">
                  {lesson.publishStatus !== 'PUBLISHED' ? (
                    <button
                      type="button"
                      onClick={() => handlePublish(lesson.id)}
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
