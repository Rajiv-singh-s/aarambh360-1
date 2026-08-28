import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8">
      <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-indigo-400">
        <ArrowLeft className="w-4 h-4" /> Back to Home
      </Link>
      <h1 className="text-4xl font-black text-white">Terms of Service</h1>
      <div className="glass-card rounded-2xl p-8 space-y-6 text-slate-300 text-sm leading-relaxed">
        <p>Welcome to <strong>Aarambh360</strong>. By accessing our portal (<a href="https://aarambhskills.com" className="text-indigo-400">aarambhskills.com</a>), you agree to these terms.</p>
        <h2 className="text-lg font-bold text-white">1. Educational Nature</h2>
        <p>Aarambh360 is an independent ed-tech learning portal for UPSC preparation.</p>
      </div>
    </div>
  );
}
