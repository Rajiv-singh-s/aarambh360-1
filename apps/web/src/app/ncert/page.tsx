import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { BookOpen, CheckCircle2, AlertCircle, ArrowRight, Download, Sparkles, Compass } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Complete NCERT Books List for UPSC CSE (Class 6 to 12) - High-Yield Roadmap',
  description: 'Download the comprehensive subject-wise NCERT books list for UPSC Civil Services Examination. Learn which NCERTs are mandatory and which can be safely skipped.',
  keywords: [
    'NCERT books for UPSC',
    'which NCERT to read for UPSC',
    'Class 6 to 12 NCERT list UPSC',
    'NCERT roadmap UPSC CSE 2026',
    'NCERT notes IAS preparation'
  ],
  alternates: {
    canonical: 'https://aarambhskills.com/ncert/',
  },
};

const NCERT_SUBJECTS = [
  {
    subject: 'Geography',
    priority: 'Top Priority (Must Read)',
    color: 'emerald',
    description: 'Geography NCERTs from Class 11 and 12 form 80% of UPSC Prelims and Mains GS-1 physical geography concepts.',
    books: [
      { class: 'Class 11', name: 'Fundamentals of Physical Geography', status: 'Must Read (Non-Negotiable)', topics: 'Geomorphology, Climatology, Oceanography, Earthquakes' },
      { class: 'Class 11', name: 'India: Physical Environment', status: 'Must Read (Non-Negotiable)', topics: 'Drainage Systems, Physiographic Divisions, Climate, Soils' },
      { class: 'Class 12', name: 'Fundamentals of Human Geography', status: 'Must Read', topics: 'World Population, Human Development, Primary Activities' },
      { class: 'Class 12', name: 'India: People and Economy', status: 'Must Read', topics: 'Agriculture, Mineral Resources, Transport, Foreign Trade' },
      { class: 'Class 6–10', name: 'Our Environment / Contemporary India', status: 'Optional / Skim Only', topics: 'Read only if school geography basics are weak' }
    ]
  },
  {
    subject: 'History & Art & Culture',
    priority: 'Top Priority (Must Read)',
    color: 'indigo',
    description: 'Direct source of ancient/medieval terminology, temple architecture, and Modern Freedom Movement questions.',
    books: [
      { class: 'Class 11', name: 'An Introduction to Indian Art (Part 1)', status: 'Must Read (Crucial)', topics: 'Indus Valley Arts, Mauryan Pillars, Ajanta Murals, Temple Styles' },
      { class: 'Class 12', name: 'Themes in Indian History - Part 1 (Ancient)', status: 'Must Read', topics: 'Harappan Archaeology, Early States, Vedic Culture' },
      { class: 'Class 12', name: 'Themes in Indian History - Part 2 (Medieval)', status: 'Must Read', topics: 'Bhakti-Sufi Traditions, Vijayanagara Empire, Agrarian Relations' },
      { class: 'Class 12', name: 'Themes in Indian History - Part 3 (Modern)', status: 'Must Read', topics: 'Colonialism, 1857 Revolt, Mahatma Gandhi, Partition' },
      { class: 'Class 6–8', name: 'Our Pasts (I, II, III)', status: 'Recommended for Beginners', topics: 'Quick foundational overview of Indian history timeline' }
    ]
  },
  {
    subject: 'Indian Polity & Constitution',
    priority: 'High Priority',
    color: 'amber',
    description: 'Foundational reading before tackling M. Laxmikanth for GS Paper 2 and Prelims.',
    books: [
      { class: 'Class 11', name: 'Indian Constitution at Work', status: 'Must Read', topics: 'Rights, Election & Representation, Executive, Judiciary, Federalism' },
      { class: 'Class 11', name: 'Political Theory', status: 'Must Read for Mains & Essay', topics: 'Liberty, Equality, Justice, Rights, Citizenship, Secularism' },
      { class: 'Class 9–10', name: 'Democratic Politics (I & II)', status: 'Optional', topics: 'Basic democratic principles and federal institutions' }
    ]
  },
  {
    subject: 'Indian Economy',
    priority: 'High Priority',
    color: 'pink',
    description: 'Crucial for conceptual understanding of macroeconomics and post-independence Indian development.',
    books: [
      { class: 'Class 11', name: 'Indian Economic Development', status: 'Must Read', topics: 'Pre-1991 Economy, 1991 LPG Reforms, Poverty, Rural Development' },
      { class: 'Class 12', name: 'Introductory Macroeconomics', status: 'Selective Must Read', topics: 'National Income Accounting, Money & Banking, Balance of Payments' },
      { class: 'Class 12', name: 'Introductory Microeconomics', status: 'Skip (Zero Utility for UPSC)', topics: 'Consumer theory and firm equations are NOT asked in UPSC' }
    ]
  },
  {
    subject: 'Environment, Science & Ecology',
    priority: 'Targeted Selective',
    color: 'purple',
    description: 'High-yield ecology chapters that frequently appear in Prelims biodiversity questions.',
    books: [
      { class: 'Class 12', name: 'Biology (Chapters 13, 14, 15, 16 Only)', status: 'Must Read', topics: 'Organisms and Populations, Ecosystem, Biodiversity, Environmental Issues' },
      { class: 'Class 6–10', name: 'Science (General)', status: 'Optional / Skim Only', topics: 'Basic Physics, Chemistry, Biology concepts for Non-Science graduates' }
    ]
  }
];

export default function NcertPage() {
  const ncertSchema = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    'name': 'UPSC CSE NCERT Comprehensive Foundation Roadmap',
    'description': 'Curated Class 6 to 12 NCERT curriculum and chapter breakdown for UPSC Civil Services Examination.',
    'provider': {
      '@type': 'Organization',
      'name': 'Aarambh360',
      'url': 'https://aarambhskills.com'
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ncertSchema) }}
      />

      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
          <BookOpen className="w-3.5 h-3.5" />
          Official UPSC Curriculum Mapping
        </div>
        <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
          The Definitive NCERT Roadmap for UPSC CSE
        </h1>
        <p className="text-slate-300 text-base sm:text-lg">
          Do not waste 6 months reading 45+ NCERTs blindly. Here is the curated, high-yield list of Class 6–12 NCERTs with explicit <strong className="text-emerald-400">Must-Read</strong> vs <strong className="text-red-400">Skip</strong> tags.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card rounded-2xl p-6 space-y-2 border-emerald-500/30">
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Step 1: Foundational Read</span>
          <h3 className="text-lg font-bold text-white">Class 11 & 12 Primacy</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Over 85% of NCERT-derived questions come directly from Class 11 and 12 textbooks. Complete these first.
          </p>
        </div>
        <div className="glass-card rounded-2xl p-6 space-y-2 border-indigo-500/30">
          <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Step 2: Active Testing</span>
          <h3 className="text-lg font-bold text-white">Chapter-Wise Micro-Quizzes</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Take chapter-specific MCQs immediately after reading to lock key terms into long-term memory.
          </p>
        </div>
        <div className="glass-card rounded-2xl p-6 space-y-2 border-pink-500/30">
          <span className="text-xs font-bold text-pink-400 uppercase tracking-wider">Step 3: Standard Books</span>
          <h3 className="text-lg font-bold text-white">Bridge to Laxmikanth & Spectrum</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Use NCERTs to build conceptual baseline before moving to advanced standard reference texts.
          </p>
        </div>
      </div>

      <div className="space-y-12">
        {NCERT_SUBJECTS.map((sub, idx) => (
          <div key={idx} className="glass-card rounded-3xl p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-800">
              <div>
                <h2 className="text-2xl font-black text-white flex items-center gap-3">
                  {sub.subject}
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    {sub.priority}
                  </span>
                </h2>
                <p className="text-sm text-slate-400 mt-1">{sub.description}</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-800 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    <th className="pb-3 pr-4">Class</th>
                    <th className="pb-3 pr-4">Book Title</th>
                    <th className="pb-3 pr-4">UPSC Priority Status</th>
                    <th className="pb-3">High-Yield Core Topics</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {sub.books.map((b, bIdx) => (
                    <tr key={bIdx} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3.5 pr-4 font-semibold text-white whitespace-nowrap">{b.class}</td>
                      <td className="py-3.5 pr-4 font-medium text-indigo-300">{b.name}</td>
                      <td className="py-3.5 pr-4 whitespace-nowrap">
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-md ${
                          b.status.includes('Must Read')
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                            : b.status.includes('Skip')
                            ? 'bg-red-500/15 text-red-400 border border-red-500/30'
                            : 'bg-slate-800 text-slate-400 border border-slate-700'
                        }`}>
                          {b.status}
                        </span>
                      </td>
                      <td className="py-3.5 text-xs text-slate-400">{b.topics}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>

      <div className="glass rounded-3xl p-8 sm:p-12 border border-indigo-500/30 text-center space-y-6">
        <div className="max-w-2xl mx-auto space-y-3">
          <h2 className="text-2xl sm:text-4xl font-black text-white">
            Read & Practice NCERTs Inside Aarambh360
          </h2>
          <p className="text-slate-300 text-sm sm:text-base">
            Access chapter-by-chapter summaries and take 20-MCQ active recall drills for every NCERT textbook on the Aarambh360 mobile app.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/#download"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-pink-600 text-white font-bold shadow-lg shadow-indigo-500/25"
          >
            <Download className="w-5 h-5" /> Download App to Practice NCERTs
          </Link>
          <Link
            href="/blog/complete-ncert-roadmap-upsc-cse"
            className="inline-flex items-center gap-2 px-6 py-4 rounded-xl glass text-slate-200 font-semibold hover:text-indigo-400"
          >
            Read In-Depth NCERT Editorial Guide →
          </Link>
        </div>
      </div>

    </div>
  );
}
