import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Mail, MessageSquare, Globe } from 'lucide-react';

export default function ContactPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8">
      <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-indigo-400">
        <ArrowLeft className="w-4 h-4" /> Back to Home
      </Link>
      <div className="space-y-4">
        <h1 className="text-4xl font-black text-white">Contact & Support</h1>
        <p className="text-slate-400 text-sm">We're here to support your UPSC Civil Services journey.</p>
      </div>
      <div className="glass-card rounded-2xl p-8 space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
            <Mail className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Academic & Technical Support</h3>
            <p className="text-slate-400 text-sm">support@aarambhskills.com</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
            <Globe className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Official Website</h3>
            <p className="text-slate-400 text-sm">https://aarambhskills.com</p>
          </div>
        </div>
      </div>
    </div>
  );
}
