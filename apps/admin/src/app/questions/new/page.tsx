'use client';

import { FormEvent, useState } from 'react';
import type { AdminQuestionInputDto } from '@aarambh360/types';
import { adminFetch } from '../../../lib/api';

export default function CreateQuestionPage() {
  const [topicId, setTopicId] = useState('');
  const [text, setText] = useState('');
  const [explanation, setExplanation] = useState('');
  const [options, setOptions] = useState([
    { label: 'A', text: '', isCorrect: true },
    { label: 'B', text: '', isCorrect: false },
    { label: 'C', text: '', isCorrect: false },
    { label: 'D', text: '', isCorrect: false },
  ]);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setMessage(null);
    setError(null);
    try {
      const payload: AdminQuestionInputDto = {
        topicId,
        type: 'MCQ_SINGLE',
        text,
        explanation,
        options,
      };
      const created = await adminFetch<{ id: string }>('/admin/questions', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      await adminFetch(`/admin/questions/${created.id}/review`, { method: 'POST' });
      setMessage(`Created question ${created.id} (submitted for review)`);
    } catch (err: any) {
      setError(err.message ?? 'Failed to create question');
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      <h2 className="text-2xl font-bold text-white">Create MCQ</h2>
      <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-slate-800 bg-slate-900 p-6">
        <input
          className="w-full rounded-lg bg-slate-950 border border-slate-700 p-3 text-sm"
          placeholder="Topic ID"
          value={topicId}
          onChange={(e) => setTopicId(e.target.value)}
        />
        <textarea
          className="w-full rounded-lg bg-slate-950 border border-slate-700 p-3 text-sm min-h-24"
          placeholder="Question text"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <textarea
          className="w-full rounded-lg bg-slate-950 border border-slate-700 p-3 text-sm min-h-20"
          placeholder="Explanation"
          value={explanation}
          onChange={(e) => setExplanation(e.target.value)}
        />
        {options.map((option, index) => (
          <div key={option.label} className="flex gap-2 items-center">
            <span className="w-8 text-slate-400">{option.label}</span>
            <input
              className="flex-1 rounded-lg bg-slate-950 border border-slate-700 p-3 text-sm"
              value={option.text}
              onChange={(e) => {
                const next = [...options];
                next[index] = { ...option, text: e.target.value };
                setOptions(next);
              }}
            />
            <label className="text-xs text-slate-400 flex items-center gap-1">
              <input
                type="radio"
                name="correct"
                checked={option.isCorrect}
                onChange={() =>
                  setOptions(options.map((row, rowIndex) => ({
                    ...row,
                    isCorrect: rowIndex === index,
                  })))
                }
              />
              Correct
            </label>
          </div>
        ))}
        <button type="submit" className="rounded-lg bg-indigo-600 px-4 py-2 text-white font-semibold">
          Save Draft Question
        </button>
      </form>
      {message ? <p className="text-emerald-400">{message}</p> : null}
      {error ? <p className="text-red-400">{error}</p> : null}
    </div>
  );
}
