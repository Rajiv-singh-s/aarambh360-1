'use client';

import React from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Zap,
  Bot,
  MapPin,
  Flame,
  CheckCircle2,
  BookOpen,
  Award,
  ArrowRight,
  Download,
  ShieldCheck,
  Star,
  Users,
  Compass,
  FileCheck2,
  Clock,
  Laptop
} from 'lucide-react';
import InteractiveQuiz from '@/components/InteractiveQuiz';
import { BLOG_POSTS } from '@/lib/blogs';

export default function HomePage() {
  return (
    <div className="space-y-24 sm:space-y-32 overflow-hidden">
      
      {/* 1. HERO SECTION */}
      <section className="relative pt-12 sm:pt-20 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Glow backdrop */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-indigo-600/20 via-pink-600/15 to-amber-500/10 blur-[120px] rounded-full pointer-events-none -z-10" />

        <div className="text-center space-y-8 max-w-4xl mx-auto">
          
          {/* Pill Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-indigo-500/30 text-indigo-300 text-xs sm:text-sm font-semibold shadow-lg shadow-indigo-500/10 animate-bounce">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>Built exclusively for UPSC Civil Services 2026-2027</span>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.1]">
            Transform Your UPSC Prep with{' '}
            <span className="gradient-text">AI-Driven Active Recall</span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
            Stop passive reading. Conquer UPSC Prelims and Mains with 24/7 AI Mentor, daily 50-MCQ timed drills, handwritten Mains evaluation, and personalized mistake vaults.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="#download"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-pink-600 text-white font-bold text-base shadow-xl shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <Download className="w-5 h-5" />
              Download Android App (Free)
            </Link>
            <Link
              href="/blog"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl glass hover:bg-slate-800/80 text-slate-200 font-semibold text-base border border-slate-700 hover:border-slate-500 transition-all"
            >
              <BookOpen className="w-5 h-5 text-indigo-400" />
              Read UPSC Strategy Blogs
            </Link>
          </div>

          {/* Live Metric Stats */}
          <div className="pt-12 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto border-t border-slate-800/80">
            <div className="space-y-1">
              <p className="text-2xl sm:text-3xl font-black text-white">50,000+</p>
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Active Aspirants</p>
            </div>
            <div className="space-y-1">
              <p className="text-2xl sm:text-3xl font-black text-indigo-400">100,000+</p>
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Prelims MCQs</p>
            </div>
            <div className="space-y-1">
              <p className="text-2xl sm:text-3xl font-black text-pink-400">24/7</p>
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">NVIDIA AI Mentor</p>
            </div>
            <div className="space-y-1">
              <p className="text-2xl sm:text-3xl font-black text-amber-400">100%</p>
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Zero Demo Data</p>
            </div>
          </div>

        </div>
      </section>

      {/* 2. INTERACTIVE DEMO MINI-QUIZ SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold">
            <Zap className="w-3.5 h-3.5" />
            Live Interactive Demo
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            Experience Active Recall in Action
          </h2>
          <p className="text-slate-400 text-sm sm:text-base max-w-lg mx-auto">
            Test your knowledge right now on this authentic UPSC Prelims standard question:
          </p>
        </div>

        <InteractiveQuiz />
      </section>

      {/* 3. CORE SUPER-APP FEATURES */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-16">
          <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Everything You Need</span>
          <h2 className="text-3xl sm:text-5xl font-black text-white">
            Engineered for India's Toughest Exam
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-base">
            From NCERT conceptual mastery to daily timed prelims drills and instant Mains answer reviews.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Feature 1: AI Mentor */}
          <div className="glass-card rounded-2xl p-8 space-y-5 transition-all duration-300 relative group">
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
              <Bot className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-white">24/7 UPSC AI Mentor</h3>
            <p className="text-slate-300 text-sm leading-relaxed">
              Powered by advanced LLM reasoning (NVIDIA NIM). Ask any doubt from Laxmikanth, Economy surveys, or International Relations with instant UPSC contextual references.
            </p>
            <ul className="space-y-2 text-xs text-slate-400 font-medium">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Socratic doubt clarification</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Instant Prelims MCQ generator on any topic</li>
            </ul>
          </div>

          {/* Feature 2: Daily Challenge */}
          <div id="daily-challenge" className="glass-card rounded-2xl p-8 space-y-5 transition-all duration-300 relative group border-amber-500/30">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
              <Flame className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-white">The Daily Challenge</h3>
            <p className="text-slate-300 text-sm leading-relaxed">
              50 randomized Prelims MCQs, 25-minute timer, strictly 1 attempt every 24 hours. Build ruthless exam discipline and compete on the All-India Leaderboard.
            </p>
            <ul className="space-y-2 text-xs text-slate-400 font-medium">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> All-India Percentile & Rank</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Automatic streak habit protection</li>
            </ul>
          </div>

          {/* Feature 3: Interactive Map Game */}
          <div id="map-game" className="glass-card rounded-2xl p-8 space-y-5 transition-all duration-300 relative group">
            <div className="w-14 h-14 rounded-2xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400 group-hover:scale-110 transition-transform">
              <Compass className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-white">Interactive Map Game</h3>
            <p className="text-slate-300 text-sm leading-relaxed">
              Gamified visual geography practice. Drill rivers, tributaries, national parks, Ramsar sites, and mountain passes across interactive high-resolution maps.
            </p>
            <ul className="space-y-2 text-xs text-slate-400 font-medium">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Geography visual memory drills</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> High-yield prelims score booster</li>
            </ul>
          </div>

          {/* Feature 4: Mistake Vault */}
          <div id="mistake-vault" className="glass-card rounded-2xl p-8 space-y-5 transition-all duration-300 relative group">
            <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-white">Mistake Vault</h3>
            <p className="text-slate-300 text-sm leading-relaxed">
              Every incorrect answer is automatically captured and tagged with mistake frequency (1x, 2x, 3x). Target weak zones before exam day.
            </p>
            <ul className="space-y-2 text-xs text-slate-400 font-medium">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Spaced re-testing of wrong questions</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Zero negative marking guarantee</li>
            </ul>
          </div>

          {/* Feature 5: AI Mains OCR & Evaluation */}
          <div id="mains-eval" className="glass-card rounded-2xl p-8 space-y-5 transition-all duration-300 relative group">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
              <FileCheck2 className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-white">AI Mains OCR & Evaluation</h3>
            <p className="text-slate-300 text-sm leading-relaxed">
              Write on regular paper, take a photo, and receive instant structural evaluation with marks breakdown (Introduction, Multi-dimensions, Way Forward).
            </p>
            <ul className="space-y-2 text-xs text-slate-400 font-medium">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Handwriting OCR extraction</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Official UPSC marking rubric score</li>
            </ul>
          </div>

          {/* Feature 6: NCERT & Notes Reader */}
          <div id="study-tools" className="glass-card rounded-2xl p-8 space-y-5 transition-all duration-300 relative group">
            <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
              <BookOpen className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-white">Curated NCERTs & Chapter Quizzes</h3>
            <p className="text-slate-300 text-sm leading-relaxed">
              Read Class 6-12 foundational NCERTs in-app with built-in micro-quizzes immediately after each chapter to reinforce retention.
            </p>
            <ul className="space-y-2 text-xs text-slate-400 font-medium">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Fast in-app reader</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Subject & chapter-wise breakdown</li>
            </ul>
          </div>

        </div>
      </section>

      {/* 4. RECENT BLOG & STRATEGY POSTS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4 mb-12">
          <div>
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">UPSC Knowledge Hub</span>
            <h2 className="text-3xl sm:text-4xl font-black text-white mt-1">
              Latest Strategies & Editorial Analysis
            </h2>
          </div>
          <Link
            href="/blog"
            className="text-sm font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5 group"
          >
            Explore all articles <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {BLOG_POSTS.slice(0, 3).map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="glass-card rounded-2xl p-6 flex flex-col justify-between space-y-4 group transition-all duration-300"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="px-2.5 py-1 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-semibold">
                    {post.category}
                  </span>
                  <span className="text-slate-400">{post.readTime}</span>
                </div>
                <h3 className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors line-clamp-2">
                  {post.title}
                </h3>
                <p className="text-slate-400 text-xs sm:text-sm line-clamp-3 leading-relaxed">
                  {post.excerpt}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                <span>{post.publishedAt}</span>
                <span className="font-semibold text-indigo-400 group-hover:underline">Read Article →</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 5. APP DOWNLOAD CTA BANNER */}
      <section id="download" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden glass p-8 sm:p-14 border border-indigo-500/30 text-center space-y-8">
          
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/20 blur-[100px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-pink-600/15 blur-[100px] pointer-events-none" />

          <div className="max-w-2xl mx-auto space-y-4 relative z-10">
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              Ready to Clear UPSC Prelims 2026?
            </h2>
            <p className="text-slate-300 text-base sm:text-lg">
              Join thousands of serious aspirants practicing daily with Aarambh360. 100% live database, zero fake mock questions, zero distractions.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                alert('Aarambh360 Android APK download starting soon! Connect your mobile with Expo Dev Client or download the APK from the release repository.');
              }}
              className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-white text-slate-950 font-bold text-base hover:bg-slate-100 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl"
            >
              <Download className="w-5 h-5 text-indigo-600" />
              Download APK for Android
            </a>
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl glass text-slate-200 font-semibold text-base hover:bg-slate-800/80 border border-slate-700 transition-all"
            >
              <BookOpen className="w-5 h-5 text-indigo-400" />
              Browse Study Material
            </Link>
          </div>

          <div className="flex items-center justify-center gap-6 text-xs text-slate-400 pt-4 relative z-10">
            <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-emerald-400" /> Verified UPSC Syllabus</span>
            <span className="flex items-center gap-1.5"><Award className="w-4 h-4 text-amber-400" /> 100% Free Core Drills</span>
          </div>

        </div>
      </section>

    </div>
  );
}
