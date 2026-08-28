import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { BLOG_POSTS, getBlogPost } from '@/lib/blogs';
import { ArrowLeft, Clock, Calendar, Download, Sparkles } from 'lucide-react';

export async function generateStaticParams() {
  return BLOG_POSTS.map((post) => ({
    slug: post.slug,
  }));
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getBlogPost(slug);

  if (!post) {
    notFound();
  }

  const formatContent = (content: string) => {
    return content
      .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold text-white mt-8 mb-4 tracking-tight">$1</h2>')
      .replace(/^### (.*$)/gim, '<h3 class="text-xl font-bold text-indigo-300 mt-6 mb-3 tracking-tight">$1</h3>')
      .replace(/^> (.*$)/gim, '<blockquote class="border-l-4 border-indigo-500 pl-4 py-2 my-4 bg-indigo-500/10 text-slate-200 italic rounded-r-lg">$1</blockquote>')
      .replace(/\*\*(.*?)\*\*/gim, '<strong class="font-bold text-white">$1</strong>')
      .replace(/\*(.*?)\*/gim, '<em class="italic text-slate-200">$1</em>')
      .replace(/^\- (.*$)/gim, '<li class="ml-4 list-disc text-slate-300 mb-1">$1</li>')
      .replace(/\n\n/gim, '</p><p class="text-slate-300 text-base sm:text-lg leading-relaxed mb-4">');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      
      <Link
        href="/blog"
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-indigo-400 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to all articles
      </Link>

      <header className="space-y-6 pb-8 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-wider">
            {post.category}
          </span>
          <span className="text-xs text-slate-400 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> {post.readTime}
          </span>
          <span className="text-xs text-slate-400 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" /> {post.publishedAt}
          </span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-white leading-tight tracking-tight">
          {post.title}
        </h1>

        <p className="text-lg sm:text-xl text-slate-300 leading-relaxed font-normal">
          {post.excerpt}
        </p>

        <div className="flex items-center gap-4 pt-2">
          <img
            src={post.author.avatar}
            alt={post.author.name}
            className="w-12 h-12 rounded-full object-cover border-2 border-indigo-500/40"
          />
          <div>
            <p className="text-sm font-bold text-white">{post.author.name}</p>
            <p className="text-xs text-slate-400">{post.author.role}</p>
          </div>
        </div>
      </header>

      <article className="prose prose-invert max-w-none">
        <div
          className="text-slate-300 text-base sm:text-lg leading-relaxed space-y-4"
          dangerouslySetInnerHTML={{ __html: `<p class="text-slate-300 text-base sm:text-lg leading-relaxed mb-4">${formatContent(post.content)}</p>` }}
        />
      </article>

      <div className="glass rounded-2xl p-6 sm:p-8 border border-indigo-500/30 flex flex-col sm:flex-row items-center justify-between gap-6 my-12">
        <div className="space-y-2 text-center sm:text-left">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" /> Free UPSC Practice Super-App
          </div>
          <h3 className="text-xl font-bold text-white">Practice This Topic with 50 Daily MCQs</h3>
          <p className="text-slate-400 text-xs sm:text-sm max-w-md">
            Download Aarambh360 to access active recall drills, mistake book tracking, and 24/7 UPSC AI mentorship.
          </p>
        </div>
        <Link
          href="/#download"
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-pink-600 text-white font-bold text-sm shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 flex-shrink-0 flex items-center gap-2"
        >
          <Download className="w-4 h-4" /> Download App
        </Link>
      </div>

      <div className="pt-6 border-t border-slate-800 flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-slate-400 mr-2">Tags:</span>
        {post.tags.map((t, i) => (
          <span key={i} className="text-xs text-indigo-300 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
            #{t}
          </span>
        ))}
      </div>

    </div>
  );
}
