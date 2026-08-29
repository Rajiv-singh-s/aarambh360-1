import React from 'react';
import Link from 'next/link';
import { Sparkles, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-slate-800/80 pt-16 pb-12 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-slate-800/80">
          
          <div className="space-y-4 md:col-span-1">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white">
                <Sparkles className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                AARAMBH<span className="text-indigo-400">360</span>
              </span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed">
              India's premier AI-powered super-app engineered exclusively for serious UPSC Civil Services Examination aspirants.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full w-fit">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Live for UPSC CSE 2026-2027
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider">Preparation Hub</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><Link href="/ncert" className="hover:text-indigo-400 transition-colors">NCERT Books & Chapter List</Link></li>
              <li><Link href="/booklist" className="hover:text-indigo-400 transition-colors">Standard Reference Books</Link></li>
              <li><Link href="/upsc-guide" className="hover:text-indigo-400 transition-colors">UPSC Exam Pattern & Cutoffs</Link></li>
              <li><Link href="/upsc-guide#schedule" className="hover:text-indigo-400 transition-colors">2026-2027 Exam Calendar</Link></li>
              <li><Link href="/features" className="hover:text-indigo-400 transition-colors">AI Mentor & Daily Challenge</Link></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider">Editorial & Blogs</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><Link href="/blog" className="hover:text-indigo-400 transition-colors">All UPSC Articles</Link></li>
              <li><Link href="/blog/complete-ncert-roadmap-upsc-cse" className="hover:text-indigo-400 transition-colors">NCERT High-Yield Roadmap</Link></li>
              <li><Link href="/blog/upsc-prelims-active-recall-strategy-2026" className="hover:text-indigo-400 transition-colors">Prelims Active Recall Guide</Link></li>
              <li><Link href="/blog/mastering-mains-answer-writing-ai-evaluation" className="hover:text-indigo-400 transition-colors">Mains Answer Blueprint</Link></li>
              <li><Link href="/blog/eliminating-negative-marking-prelims-3-round-rule" className="hover:text-indigo-400 transition-colors">Eliminate Negative Marking</Link></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider">Institutional</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><Link href="/privacy" className="hover:text-indigo-400 transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-indigo-400 transition-colors">Terms of Service</Link></li>
              <li><Link href="/contact" className="hover:text-indigo-400 transition-colors">Contact & Support</Link></li>
              <li className="pt-2 text-xs text-slate-500">Official Portal: <span className="text-slate-300">aarambhskills.com</span></li>
            </ul>
          </div>

        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Aarambh360 Technologies. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Engineered with <Heart className="w-3.5 h-3.5 text-pink-500 fill-pink-500" /> for India's future Bureaucrats.
          </p>
        </div>
      </div>
    </footer>
  );
}
