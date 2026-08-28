'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { BookOpen, Search, ArrowRight } from 'lucide-react';
import { BLOG_POSTS } from '@/lib/blogs';

export default function BlogIndexPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categories = ['All', 'Strategy', 'Prelims', 'Mains', 'NCERT'];

  const filteredPosts = BLOG_POSTS.filter(post => {
    const matchesCat = selectedCategory === 'All' || post.category === selectedCategory;
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          post.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-12">
      
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold">
          <BookOpen className="w-3.5 h-3.5" />
          Aarambh360 Editorial & Knowledge Hub
        </div>
        <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
          UPSC Strategy, NCERT Guides & Editorial Insights
        </h1>
        <p className="text-slate-400 text-base sm:text-lg">
          Evidence-based preparation frameworks, high-yield subject roadmaps, and cognitive active recall strategies from top mentors and rankers.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 glass-card p-4 rounded-2xl">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/25'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search articles & topics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900/90 border border-slate-800 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>
      </div>

      {filteredPosts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPosts.map((post) => (
            <article
              key={post.slug}
              className="glass-card rounded-2xl p-6 flex flex-col justify-between space-y-6 group hover:scale-[1.01] transition-all duration-300"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="px-2.5 py-1 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-bold">
                    {post.category}
                  </span>
                  <span className="text-slate-400 font-medium">{post.readTime}</span>
                </div>

                <Link href={`/blog/${post.slug}`}>
                  <h2 className="text-xl font-bold text-white group-hover:text-indigo-400 transition-colors leading-snug">
                    {post.title}
                  </h2>
                </Link>

                <p className="text-slate-400 text-sm line-clamp-3 leading-relaxed">
                  {post.excerpt}
                </p>

                <div className="flex flex-wrap gap-1.5 pt-2">
                  {post.tags.map((t, i) => (
                    <span key={i} className="text-[11px] text-slate-500 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                      #{t}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <img
                    src={post.author.avatar}
                    alt={post.author.name}
                    className="w-8 h-8 rounded-full object-cover border border-indigo-500/30"
                  />
                  <div>
                    <p className="text-xs font-semibold text-slate-200">{post.author.name}</p>
                    <p className="text-[10px] text-slate-400">{post.publishedAt}</p>
                  </div>
                </div>
                <Link
                  href={`/blog/${post.slug}`}
                  className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-all"
                >
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 space-y-3 glass-card rounded-2xl">
          <p className="text-slate-400 text-base">No articles found matching "{searchQuery}".</p>
          <button
            onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}
            className="text-xs font-bold text-indigo-400 hover:underline"
          >
            Clear Filters
          </button>
        </div>
      )}

    </div>
  );
}
