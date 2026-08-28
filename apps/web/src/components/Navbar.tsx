'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Sparkles, Menu, X, Download, BookOpen, Compass, Trophy } from 'lucide-react';

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 glass border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Brand Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-pink-500 p-0.5 shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-300">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-indigo-400" />
              </div>
            </div>
            <div>
              <span className="text-2xl font-black tracking-tight text-white flex items-center gap-1">
                AARAMBH<span className="text-indigo-400">360</span>
              </span>
              <p className="text-[10px] font-semibold text-slate-400 tracking-wider uppercase">UPSC CSE Super-App</p>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-300">
            <Link href="/#features" className="hover:text-indigo-400 transition-colors">Features</Link>
            <Link href="/#daily-challenge" className="hover:text-indigo-400 transition-colors flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
              </span>
              Daily Challenge
            </Link>
            <Link href="/#ai-mentor" className="hover:text-indigo-400 transition-colors">AI Mentor</Link>
            <Link href="/#study-tools" className="hover:text-indigo-400 transition-colors">Study Tools</Link>
            <Link href="/blog" className="hover:text-indigo-400 transition-colors flex items-center gap-1">
              <BookOpen className="w-4 h-4 text-indigo-400" />
              UPSC Blog & Notes
            </Link>
          </nav>

          {/* Desktop CTA Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Link
              href="/#download"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-pink-600 text-white text-sm font-semibold shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
            >
              <Download className="w-4 h-4" />
              Download App
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden glass border-b border-slate-800 px-4 pt-3 pb-6 space-y-4">
          <Link
            href="/#features"
            onClick={() => setMobileOpen(false)}
            className="block text-base font-medium text-slate-300 hover:text-white"
          >
            Features
          </Link>
          <Link
            href="/#daily-challenge"
            onClick={() => setMobileOpen(false)}
            className="block text-base font-medium text-slate-300 hover:text-white"
          >
            Daily Challenge
          </Link>
          <Link
            href="/#ai-mentor"
            onClick={() => setMobileOpen(false)}
            className="block text-base font-medium text-slate-300 hover:text-white"
          >
            AI Mentor
          </Link>
          <Link
            href="/#study-tools"
            onClick={() => setMobileOpen(false)}
            className="block text-base font-medium text-slate-300 hover:text-white"
          >
            Study Tools
          </Link>
          <Link
            href="/blog"
            onClick={() => setMobileOpen(false)}
            className="block text-base font-medium text-indigo-400 hover:text-indigo-300"
          >
            UPSC Blog & Notes
          </Link>
          <div className="pt-2">
            <Link
              href="/#download"
              onClick={() => setMobileOpen(false)}
              className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-pink-600 text-white font-semibold shadow-lg shadow-indigo-500/25"
            >
              <Download className="w-4 h-4" />
              Download App Free
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
