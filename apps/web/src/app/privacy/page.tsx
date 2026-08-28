import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Shield } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8">
      <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-indigo-400">
        <ArrowLeft className="w-4 h-4" /> Back to Home
      </Link>
      <div className="space-y-4">
        <h1 className="text-4xl font-black text-white">Privacy Policy</h1>
        <p className="text-slate-400 text-sm">Last updated: August 2026</p>
      </div>
      <div className="glass-card rounded-2xl p-8 space-y-6 text-slate-300 text-sm leading-relaxed">
        <p>
          At <strong>Aarambh360</strong> (accessible from <a href="https://aarambhskills.com" className="text-indigo-400">aarambhskills.com</a>), your privacy is of paramount importance to us. This Privacy Policy document describes how we collect, store, and protect your information.
        </p>
        <h2 className="text-lg font-bold text-white">1. Information We Collect</h2>
        <p>
          When you register for an Aarambh360 account, we may collect your email address, name, UPSC target exam year, and optional study target metrics. When you attempt quizzes, we store your score performance, mistake vault records, and streak metrics to personalize your learning trajectory.
        </p>
        <h2 className="text-lg font-bold text-white">2. AI & Question Data Usage</h2>
        <p>
          Doubts asked to the UPSC AI Mentor are processed securely via strict, confidential API endpoints. We do not sell or monetize your personal evaluation data or answer sheets to any third parties.
        </p>
        <h2 className="text-lg font-bold text-white">3. Security</h2>
        <p>
          We employ industry-standard encryption, tokenized authentication (JWT), and secure cloud storage protocols to safeguard your account.
        </p>
      </div>
    </div>
  );
}
