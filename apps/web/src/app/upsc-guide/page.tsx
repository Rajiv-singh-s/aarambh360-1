import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Compass, Award, Calendar, CheckCircle2, ShieldCheck, AlertCircle, ArrowRight, Download } from 'lucide-react';

export const metadata: Metadata = {
  title: 'UPSC CSE Complete Exam Guide: Pattern, Marking Schemes & 2026-2027 Schedule',
  description: 'Exhaustive guide to the UPSC Civil Services Examination. Prelims, Mains, Interview syllabus, negative marking math, eligibility criteria, and annual timeline calendar.',
  keywords: [
    'UPSC CSE exam pattern',
    'UPSC Prelims marking scheme',
    'UPSC Mains total marks',
    'UPSC exam calendar 2026',
    'IAS eligibility criteria age limits'
  ],
  alternates: {
    canonical: 'https://aarambhskills.com/upsc-guide/',
  },
};

export default function UpscGuidePage() {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': [
      {
        '@type': 'Question',
        'name': 'What is the negative marking scheme in UPSC Prelims?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': 'In UPSC Prelims GS Paper 1, each correct answer awards +2.00 marks, while each incorrect answer incurs a penalty of -0.66 marks (1/3rd negative marking).'
        }
      },
      {
        '@type': 'Question',
        'name': 'How many papers are there in UPSC Mains examination?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': 'UPSC Mains consists of 9 descriptive papers totaling 1750 marks: Essay, GS Papers 1 to 4, 2 Optional Papers, and 2 qualifying language papers.'
        }
      }
    ]
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold">
          <Compass className="w-3.5 h-3.5" />
          Official UPSC Examination Architecture
        </div>
        <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
          Complete UPSC CSE Exam Structure & 2026–2027 Schedule
        </h1>
        <p className="text-slate-300 text-base sm:text-lg">
          Master the exact 3-stage blueprint of the Civil Services Examination: Prelims scoring logic, Mains 9-paper matrix, Personality Test rubrics, and the official annual timeline.
        </p>
      </div>

      {/* STAGES BREAKDOWN */}
      <div className="space-y-10">
        <div className="glass-card rounded-3xl p-8 space-y-6 border-indigo-500/30">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
            <div>
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Stage 1</span>
              <h2 className="text-2xl sm:text-3xl font-black text-white">Preliminary Examination (Screening Test)</h2>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 w-fit">
              Objective MCQs (OMR Based)
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="text-base font-bold text-white">General Studies Paper 1 (GS-1)</h3>
                <span className="text-xs text-indigo-400 font-bold">200 Marks / 100 MCQs</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Determines Prelims qualification cutoff. Covers History, Geography, Polity, Economy, Environment, Science & Tech, and Current Affairs.
              </p>
              <div className="text-xs space-y-1 text-slate-300 pt-2 border-t border-slate-800">
                <p>• <strong>Marking:</strong> +2.00 per correct answer</p>
                <p>• <strong>Negative Marking:</strong> -0.66 per wrong answer (1/3rd penalty)</p>
                <p>• <strong>Duration:</strong> 2 Hours (9:30 AM to 11:30 AM)</p>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="text-base font-bold text-white">CSAT Paper 2 (Aptitude)</h3>
                <span className="text-xs text-amber-400 font-bold">200 Marks / 80 MCQs</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Strictly qualifying in nature. Must score a minimum of <strong>33% (66.00 Marks)</strong>. Covers Reading Comprehension, Logical Reasoning, and Basic Numeracy.
              </p>
              <div className="text-xs space-y-1 text-slate-300 pt-2 border-t border-slate-800">
                <p>• <strong>Marking:</strong> +2.50 per correct answer</p>
                <p>• <strong>Negative Marking:</strong> -0.83 per wrong answer</p>
                <p>• <strong>Duration:</strong> 2 Hours (2:30 PM to 4:30 PM)</p>
              </div>
            </div>
          </div>
        </div>

        {/* STAGE 2: MAINS */}
        <div className="glass-card rounded-3xl p-8 space-y-6 border-pink-500/30">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
            <div>
              <span className="text-xs font-bold text-pink-400 uppercase tracking-widest">Stage 2</span>
              <h2 className="text-2xl sm:text-3xl font-black text-white">Mains Examination (Descriptive Writing)</h2>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-pink-500/10 text-pink-400 border border-pink-500/20 w-fit">
              9 Papers • 1750 Total Marks
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-xs font-bold text-slate-400 uppercase">
                  <th className="pb-3">Paper</th>
                  <th className="pb-3">Subject / Domain</th>
                  <th className="pb-3">Max Marks</th>
                  <th className="pb-3">Nature</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                <tr>
                  <td className="py-2.5 font-bold text-white">Paper A</td>
                  <td>Compulsory Indian Language (Schedule VIII)</td>
                  <td>300 Marks</td>
                  <td><span className="text-amber-400 font-semibold">Qualifying (25%)</span></td>
                </tr>
                <tr>
                  <td className="py-2.5 font-bold text-white">Paper B</td>
                  <td>English Language</td>
                  <td>300 Marks</td>
                  <td><span className="text-amber-400 font-semibold">Qualifying (25%)</span></td>
                </tr>
                <tr>
                  <td className="py-2.5 font-bold text-white">Paper I</td>
                  <td>Essay (2 Essays across Section A & B)</td>
                  <td>250 Marks</td>
                  <td><span className="text-emerald-400 font-semibold">Counted for Merit</span></td>
                </tr>
                <tr>
                  <td className="py-2.5 font-bold text-white">Paper II</td>
                  <td>GS Paper 1 (Indian Heritage, History, Geography & Society)</td>
                  <td>250 Marks</td>
                  <td><span className="text-emerald-400 font-semibold">Counted for Merit</span></td>
                </tr>
                <tr>
                  <td className="py-2.5 font-bold text-white">Paper III</td>
                  <td>GS Paper 2 (Governance, Constitution, Polity, Social Justice & IR)</td>
                  <td>250 Marks</td>
                  <td><span className="text-emerald-400 font-semibold">Counted for Merit</span></td>
                </tr>
                <tr>
                  <td className="py-2.5 font-bold text-white">Paper IV</td>
                  <td>GS Paper 3 (Technology, Economic Development, Biodiversity, Security)</td>
                  <td>250 Marks</td>
                  <td><span className="text-emerald-400 font-semibold">Counted for Merit</span></td>
                </tr>
                <tr>
                  <td className="py-2.5 font-bold text-white">Paper V</td>
                  <td>GS Paper 4 (Ethics, Integrity and Aptitude & Case Studies)</td>
                  <td>250 Marks</td>
                  <td><span className="text-emerald-400 font-semibold">Counted for Merit</span></td>
                </tr>
                <tr>
                  <td className="py-2.5 font-bold text-white">Paper VI & VII</td>
                  <td>Optional Subject (Paper 1 & Paper 2)</td>
                  <td>500 Marks (250 x 2)</td>
                  <td><span className="text-emerald-400 font-semibold">Counted for Merit</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* STAGE 3: INTERVIEW */}
        <div className="glass-card rounded-3xl p-8 space-y-4 border-emerald-500/30">
          <div className="flex justify-between items-center pb-3 border-b border-slate-800">
            <div>
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Stage 3</span>
              <h2 className="text-2xl font-black text-white">Personality Test (Interview)</h2>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              275 Marks
            </span>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed">
            Conducted by the UPSC Board in Dholpur House, New Delhi. Evaluates mental alertness, critical assimilation powers, clear and logical exposition, balance of judgement, and moral integrity.
          </p>
          <p className="text-xs font-bold text-indigo-400">
            Grand Total Marks for Final Merit Ranking = 1750 (Mains) + 275 (Interview) = 2025 Marks.
          </p>
        </div>
      </div>

      {/* ANNUAL SCHEDULE CALENDAR */}
      <div id="schedule" className="glass-card rounded-3xl p-8 space-y-6 border-amber-500/30">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
          <Calendar className="w-6 h-6 text-amber-400" />
          <div>
            <h2 className="text-2xl font-black text-white">Official UPSC CSE Annual Lifecycle & Calendar</h2>
            <p className="text-xs text-slate-400">Standard timeline followed by the Union Public Service Commission</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
            <span className="text-xs font-bold text-amber-400 uppercase">February</span>
            <h4 className="text-base font-bold text-white">Official Notification & Registration</h4>
            <p className="text-xs text-slate-400">UPSC releases official CSE notification, vacancy count, and opens online application window.</p>
          </div>
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
            <span className="text-xs font-bold text-indigo-400 uppercase">May / June</span>
            <h4 className="text-base font-bold text-white">Preliminary Examination</h4>
            <p className="text-xs text-slate-400">GS-1 and CSAT conducted across 70+ cities in India in a single day.</p>
          </div>
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
            <span className="text-xs font-bold text-pink-400 uppercase">September</span>
            <h4 className="text-base font-bold text-white">Mains Examination</h4>
            <p className="text-xs text-slate-400">5-day descriptive writing schedule for the top ~14,000 qualified aspirants.</p>
          </div>
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
            <span className="text-xs font-bold text-emerald-400 uppercase">Jan – April</span>
            <h4 className="text-base font-bold text-white">Interviews & Final Merit List</h4>
            <p className="text-xs text-slate-400">Personality tests in New Delhi followed by the All-India Rank list and service allocations (IAS, IPS, IFS, IRS).</p>
          </div>
        </div>
      </div>

    </div>
  );
}
