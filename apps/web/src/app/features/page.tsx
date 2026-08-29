import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Bot, Flame, Compass, ShieldCheck, FileCheck2, BookOpen, Download, Sparkles, CheckCircle2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Aarambh360 Features - 24/7 AI Mentor, Daily Challenge & Active Recall Super-App',
  description: 'Explore the full suite of AI-powered UPSC preparation tools in Aarambh360: Socratic AI Mentor, 50-MCQ Daily Challenge, Mistake Vault, Interactive Map Game, and AI Mains Evaluation.',
  keywords: [
    'UPSC AI mentor app',
    'UPSC daily challenge test series',
    'UPSC mistake vault active recall',
    'UPSC interactive map game geography',
    'UPSC Mains AI answer checker'
  ],
  alternates: {
    canonical: 'https://aarambhskills.com/features/',
  },
};

export default function FeaturesPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-16">
      
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-400 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          The Aarambh360 Ecosystem
        </div>
        <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
          Tools Engineered for Uncompromising UPSC Prep
        </h1>
        <p className="text-slate-300 text-base sm:text-lg">
          No generic coaching fluff. Every single feature in Aarambh360 is built around cognitive active recall, spaced repetition, and real-time AI feedback.
        </p>
      </div>

      <div className="space-y-12">
        {/* 1. AI MENTOR */}
        <div className="glass-card rounded-3xl p-8 sm:p-10 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center border-indigo-500/30">
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Bot className="w-6 h-6" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">24/7 Socratic UPSC AI Mentor</h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Powered by advanced LLMs tuned exclusively on standard UPSC reference materials (Laxmikanth, Spectrum, Ramesh Singh, Economic Survey, Budget, and PIB).
            </p>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-300">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Socratic doubt clarification with cross-subject linkages</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Instant UPSC standard MCQ generation on any topic or editorial</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Zero hallucinations: verified against official UPSC syllabus</li>
            </ul>
          </div>
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <span className="text-[11px] font-bold text-indigo-400 uppercase">Live AI Prompt Example</span>
            <div className="p-3.5 rounded-xl bg-slate-950 text-xs text-slate-300 space-y-2 font-mono">
              <p className="text-indigo-300">"Explain the difference between Article 32 and Article 226 writ jurisdiction with 2 landmark judgements."</p>
              <p className="text-slate-400 text-[11px] pt-2 border-t border-slate-800">→ Evaluated instantly with Chandra Kumar (1997) & Romesh Thappar (1950) case citations.</p>
            </div>
          </div>
        </div>

        {/* 2. THE DAILY CHALLENGE */}
        <div className="glass-card rounded-3xl p-8 sm:p-10 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center border-amber-500/30">
          <div className="space-y-4 order-2 lg:order-1">
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <span className="text-[11px] font-bold text-amber-400 uppercase">Daily Habit Engine</span>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 rounded-xl bg-slate-950">
                  <p className="text-lg font-bold text-white">50</p>
                  <p className="text-[10px] text-slate-400">MCQs</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-950">
                  <p className="text-lg font-bold text-amber-400">25</p>
                  <p className="text-[10px] text-slate-400">Minutes</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-950">
                  <p className="text-lg font-bold text-emerald-400">1</p>
                  <p className="text-[10px] text-slate-400">Attempt/Day</p>
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-4 order-1 lg:order-2">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Flame className="w-6 h-6" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">The 50-MCQ Daily Challenge</h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Build an unshakeable habit loop. Every day at 6:00 AM, a fresh 50-question Prelims test goes live. You have strictly 1 attempt with a 25-minute countdown.
            </p>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-300">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Real-time All-India Percentile & Accuracy metrics</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Automated streak protection and recovery drills</li>
            </ul>
          </div>
        </div>

        {/* 3. MAP GAME & MISTAKE VAULT */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="glass-card rounded-3xl p-8 space-y-4 border-pink-500/30">
            <div className="w-12 h-12 rounded-2xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400">
              <Compass className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white">Interactive Map Game</h3>
            <p className="text-slate-300 text-sm leading-relaxed">
              Drill rivers, mountain passes, wildlife sanctuaries, Ramsar sites, and UNESCO heritage spots across high-res interactive vector maps.
            </p>
          </div>

          <div className="glass-card rounded-3xl p-8 space-y-4 border-red-500/30">
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white">Mistake Vault</h3>
            <p className="text-slate-300 text-sm leading-relaxed">
              Every incorrect answer from tests and daily challenges is automatically indexed. Test yourself strictly on past mistakes to eliminate negative marking.
            </p>
          </div>
        </div>
      </div>

      <div className="glass rounded-3xl p-8 sm:p-12 border border-indigo-500/30 text-center space-y-6">
        <h2 className="text-2xl sm:text-4xl font-black text-white">Get All Features in One Free App</h2>
        <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto">
          Download Aarambh360 on your Android phone and start your daily active recall journey today.
        </p>
        <Link
          href="/#download"
          className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-pink-600 text-white font-bold shadow-lg shadow-indigo-500/25"
        >
          <Download className="w-5 h-5" /> Download Aarambh360 Free
        </Link>
      </div>

    </div>
  );
}
