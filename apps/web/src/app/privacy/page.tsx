import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8">
      <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-indigo-400">
        <ArrowLeft className="w-4 h-4" /> Back to Home
      </Link>
      <h1 className="text-4xl font-black text-white">Privacy Policy</h1>
      <div className="glass-card rounded-2xl p-8 space-y-6 text-slate-300 text-sm leading-relaxed">
        <p>At <strong>Aarambh360</strong> (<a href="https://aarambhskills.com" className="text-indigo-400">aarambhskills.com</a>), your privacy is of paramount importance to us.</p>
        <h2 className="text-lg font-bold text-white">1. Information We Collect</h2>
        <p>When you register for an Aarambh360 account, we collect basic details to track your quiz performance and customize active recall drills.</p>
        <h2 className="text-lg font-bold text-white">2. Confidentiality</h2>
        <p>We do not monetize your personal study or evaluation data.</p>
      </div>
    </div>
  );
}
