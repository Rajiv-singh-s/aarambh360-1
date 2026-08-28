import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8">
      <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-indigo-400">
        <ArrowLeft className="w-4 h-4" /> Back to Home
      </Link>
      <div className="space-y-4">
        <h1 className="text-4xl font-black text-white">Terms of Service</h1>
        <p className="text-slate-400 text-sm">Last updated: August 2026</p>
      </div>
      <div className="glass-card rounded-2xl p-8 space-y-6 text-slate-300 text-sm leading-relaxed">
        <p>
          Welcome to <strong>Aarambh360</strong>. By accessing our website (<a href="https://aarambhskills.com" className="text-indigo-400">aarambhskills.com</a>) and our mobile applications, you agree to comply with these terms.
        </p>
        <h2 className="text-lg font-bold text-white">1. Educational Purpose</h2>
        <p>
          Aarambh360 is an independent ed-tech learning and active-recall preparation platform. We are not officially affiliated with the Union Public Service Commission (UPSC). All syllabus documents, previous year questions, and NCERT references are provided for open educational purposes.
        </p>
        <h2 className="text-lg font-bold text-white">2. User Conduct</h2>
        <p>
          Users must not attempt to scrape questions, abuse AI mentor rate limits, or manipulate leaderboard accuracy scores.
        </p>
      </div>
    </div>
  );
}
