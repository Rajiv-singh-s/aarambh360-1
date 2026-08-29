import React from 'react';
import type { Metadata } from 'next';
import { BookOpen } from 'lucide-react';
import { getAllBlogPosts } from '@/lib/markdown';
import BlogList from '@/components/BlogList';

export const metadata: Metadata = {
  title: 'UPSC CSE Strategy, NCERT Guides & Editorial Hub | Aarambh360',
  description: 'Evidence-based UPSC preparation frameworks, active recall strategies, and curated NCERT guides written by top mentors and rankers.',
  keywords: [
    'UPSC strategy blogs',
    'UPSC Prelims active recall guide',
    'NCERT roadmap UPSC',
    'UPSC Mains answer writing framework',
    'IAS preparation articles'
  ],
  alternates: {
    canonical: 'https://aarambhskills.com/blog/',
  },
};

export default function BlogIndexPage() {
  const posts = getAllBlogPosts();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-12">
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold">
          <BookOpen className="w-3.5 h-3.5" />
          Aarambh360 UPSC Editorial & Knowledge Hub
        </div>
        <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
          UPSC Strategy, NCERT Roadmaps & Editorial Insights
        </h1>
        <p className="text-slate-300 text-base sm:text-lg">
          Evidence-based preparation frameworks, high-yield subject roadmaps, and cognitive active recall strategies from top mentors and rankers.
        </p>
      </div>

      <BlogList posts={posts} />
    </div>
  );
}
