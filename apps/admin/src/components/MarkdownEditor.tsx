'use client';

function renderInlineMarkdown(source: string) {
  return source
    .replace(/^### (.*)$/gm, '<h3 class="text-lg font-semibold text-white mt-4 mb-2">$1</h3>')
    .replace(/^## (.*)$/gm, '<h2 class="text-xl font-bold text-white mt-5 mb-2">$1</h2>')
    .replace(/^# (.*)$/gm, '<h1 class="text-2xl font-bold text-white mt-6 mb-3">$1</h1>')
    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
    .replace(/^- (.*)$/gm, '<li class="ml-4 list-disc">$1</li>')
    .replace(/\n/g, '<br />');
}

export function MarkdownPreview({ value }: { value: string }) {
  return (
    <div
      className="prose prose-invert max-w-none rounded-lg border border-slate-800 bg-slate-950 p-4 text-sm text-slate-300 min-h-48"
      dangerouslySetInnerHTML={{ __html: renderInlineMarkdown(value || 'Start typing markdown…') }}
    />
  );
}

export function MarkdownEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <textarea
        className="w-full rounded-lg bg-slate-950 border border-slate-700 p-3 text-sm min-h-64 font-mono"
        placeholder="# Lesson title&#10;&#10;Write markdown content here…"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
      <MarkdownPreview value={value} />
    </div>
  );
}
