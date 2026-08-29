import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { BookOpen, CheckCircle2, Bookmark, Award, Download, ArrowRight, Sparkles, Compass } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Standard UPSC CSE Reference Books List - Complete Subject-Wise Guide | Aarambh360',
  description: 'The authoritative subject-wise UPSC reference booklist used by toppers for Prelims and Mains. Polity (Laxmikanth), Modern History (Spectrum), Geography (GC Leong), Economy, Environment, and Ethics.',
  keywords: [
    'UPSC reference books list',
    'best books for UPSC preparation',
    'UPSC standard books Prelims Mains',
    'Laxmikanth Indian Polity',
    'Spectrum Modern History UPSC',
    'GC Leong Geography UPSC',
    'Nitin Singhania Art and Culture'
  ],
  alternates: {
    canonical: 'https://aarambhskills.com/booklist/',
  },
};

const STANDARD_BOOKS = [
  {
    category: 'Indian Polity & Governance',
    syllabus: 'Prelims GS-1 & Mains GS-2',
    color: 'indigo',
    books: [
      {
        title: 'Indian Polity (Latest Edition)',
        author: 'M. Laxmikanth',
        priority: 'Non-Negotiable (Must Read)',
        description: 'The indispensable standard text for constitutional articles, fundamental rights, parliament, and statutory bodies.'
      },
      {
        title: 'Governance in India',
        author: 'M. Laxmikanth',
        priority: 'Mains GS-2 Focus',
        description: 'Covers civil services accountability, citizen charters, RTI, and regulatory frameworks.'
      },
      {
        title: 'Introduction to the Constitution of India',
        author: 'D.D. Basu',
        priority: 'Selective Reference',
        description: 'In-depth constitutional philosophy and legal precedents for high-scoring Mains answers.'
      }
    ]
  },
  {
    category: 'Modern Indian History',
    syllabus: 'Prelims GS-1 & Mains GS-1',
    color: 'amber',
    books: [
      {
        title: 'A Brief History of Modern India',
        author: 'Rajiv Ahir (Spectrum Publications)',
        priority: 'Non-Negotiable (Must Read)',
        description: 'Chronological summary from the advent of Europeans to post-independence events. Essential for Prelims MCQs.'
      },
      {
        title: "India's Struggle for Independence",
        author: 'Bipan Chandra',
        priority: 'Mains GS-1 Context',
        description: 'Builds narrative depth, ideological currents, and peasant/tribal movements.'
      },
      {
        title: 'India Since Independence',
        author: 'Bipan Chandra',
        priority: 'Selective Reading',
        description: 'Covers linguistic reorganization, non-alignment foreign policy, and planned economic history.'
      }
    ]
  },
  {
    category: 'Ancient, Medieval & Art and Culture',
    syllabus: 'Prelims GS-1 & Mains GS-1',
    color: 'pink',
    books: [
      {
        title: 'Indian Art and Culture',
        author: 'Nitin Singhania',
        priority: 'Primary Reference',
        description: 'Visual architecture guide, classical dances, music, paintings, UNESCO sites, and literature.'
      },
      {
        title: 'An Introduction to Indian Art (Class 11 NCERT)',
        author: 'NCERT',
        priority: 'Non-Negotiable (Must Read)',
        description: 'Direct source of ancient cave art, Mauryan pillars, and Dravidian/Nagara temple architecture questions.'
      },
      {
        title: 'Ancient and Medieval India',
        author: 'Poonam Dalal Dahiya / R.S. Sharma',
        priority: 'High Priority',
        description: 'Harappan sites, Vedic literature, Gupta Golden age, and Chola/Vijayanagara administrative terms.'
      }
    ]
  },
  {
    category: 'Geography & Cartography',
    syllabus: 'Prelims GS-1 & Mains GS-1',
    color: 'emerald',
    books: [
      {
        title: 'Certificate Physical and Human Geography',
        author: 'G.C. Leong',
        priority: 'Non-Negotiable (Part 1)',
        description: 'Master climate zones, weather systems, landforms, volcanism, and geomorphology.'
      },
      {
        title: 'Class 11 & 12 Geography NCERTs (4 Books)',
        author: 'NCERT',
        priority: 'Non-Negotiable (Must Read)',
        description: 'Physical geography fundamentals, Indian drainage, soils, minerals, and demographic trends.'
      },
      {
        title: 'Orient BlackSwan School Atlas / Oxford Student Atlas',
        author: 'Orient BlackSwan / Oxford',
        priority: 'Mandatory Map Tool',
        description: 'Essential for daily map-pointing drills (Rivers, Straits, Biosphere Reserves, Bordering Seas).'
      }
    ]
  },
  {
    category: 'Indian Economy',
    syllabus: 'Prelims GS-1 & Mains GS-3',
    color: 'purple',
    books: [
      {
        title: 'Indian Economy',
        author: 'Sanjiv Verma / Nitin Singhania / Ramesh Singh',
        priority: 'Primary Reference',
        description: 'Macroeconomics, banking regulations, inflation, agriculture supply chains, and external trade.'
      },
      {
        title: 'Annual Economic Survey & Union Budget',
        author: 'Ministry of Finance, Govt. of India',
        priority: 'Non-Negotiable (Every Year)',
        description: 'Official data, government schemes, sector growth figures, and policy roadmaps.'
      }
    ]
  },
  {
    category: 'Environment, Ecology & Biodiversity',
    syllabus: 'Prelims GS-1 & Mains GS-3',
    color: 'emerald',
    books: [
      {
        title: 'Environment',
        author: 'Shankar IAS Academy / PMF IAS',
        priority: 'Primary Reference',
        description: 'Ramsar wetlands, National Parks, wildlife protection acts, UNFCCC conventions, and carbon mechanisms.'
      },
      {
        title: 'Class 12 Biology (Ecology Chapters 13–16)',
        author: 'NCERT',
        priority: 'Must Read',
        description: 'Organisms and populations, ecosystem trophic levels, biodiversity hotspots, and environmental issues.'
      }
    ]
  },
  {
    category: 'Ethics, Integrity & Aptitude',
    syllabus: 'Mains GS-4',
    color: 'blue',
    books: [
      {
        title: 'Lexicon for Ethics, Integrity & Aptitude',
        author: 'Chronicle Books',
        priority: 'Primary Terminology Guide',
        description: 'Defines foundational ethical terms, moral thinkers, administrative dilemmas, and case studies.'
      },
      {
        title: 'Ethics, Integrity and Aptitude',
        author: 'G. Subba Rao & P.N. Roy Chowdhury',
        priority: 'Case Study Reference',
        description: 'Structured philosophical frameworks and applied ethical decision-making models.'
      },
      {
        title: '2nd ARC 4th Report: Ethics in Governance',
        author: 'Government of India',
        priority: 'Official Recommended Reading',
        description: 'Authentic recommendations on combating administrative corruption and institutional integrity.'
      }
    ]
  },
  {
    category: 'Internal Security & Disaster Management',
    syllabus: 'Mains GS-3',
    color: 'red',
    books: [
      {
        title: 'Challenges to Internal Security of India',
        author: 'Ashok Kumar (IPS) & Vipul Anekant',
        priority: 'Primary Reference',
        description: 'Border management, cyber warfare, terrorism financing, left-wing extremism, and money laundering.'
      },
      {
        title: 'NDMA Guidelines & 2nd ARC Disaster Management Report',
        author: 'National Disaster Management Authority',
        priority: 'Mains Answer Enabler',
        description: 'Institutional disaster mitigation plans, early warning systems, and post-crisis rehabilitation.'
      }
    ]
  }
];

export default function BooklistPage() {
  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    'name': 'UPSC CSE Standard Reference Booklist',
    'description': 'Comprehensive subject-wise standard books for UPSC Civil Services Examination.',
    'itemListElement': STANDARD_BOOKS.flatMap((cat, cIdx) =>
      cat.books.map((b, bIdx) => ({
        '@type': 'ListItem',
        'position': cIdx * 10 + bIdx + 1,
        'item': {
          '@type': 'Book',
          'name': b.title,
          'author': {
            '@type': 'Person',
            'name': b.author
          },
          'description': b.description
        }
      }))
    )
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />

      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold">
          <BookOpen className="w-3.5 h-3.5" />
          Topper-Recommended Literature
        </div>
        <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
          Standard Reference Books for UPSC CSE
        </h1>
        <p className="text-slate-300 text-base sm:text-lg">
          Do not hoard 10 books per subject. Master <strong className="text-indigo-400">1 standard book per subject</strong> and revise it 5+ times alongside active recall testing.
        </p>
      </div>

      <div className="space-y-12">
        {STANDARD_BOOKS.map((section, idx) => (
          <div key={idx} className="glass-card rounded-3xl p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-800">
              <div>
                <h2 className="text-2xl font-black text-white">{section.category}</h2>
                <p className="text-xs text-indigo-400 font-semibold mt-0.5">{section.syllabus}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {section.books.map((book, bIdx) => (
                <div
                  key={bIdx}
                  className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3 flex flex-col justify-between hover:border-slate-700 transition-colors"
                >
                  <div className="space-y-2">
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md inline-block ${
                      book.priority.includes('Must Read') || book.priority.includes('Non-Negotiable')
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                        : 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30'
                    }`}>
                      {book.priority}
                    </span>
                    <h3 className="text-base font-bold text-white leading-snug">{book.title}</h3>
                    <p className="text-xs font-semibold text-slate-400">By {book.author}</p>
                    <p className="text-xs text-slate-400 leading-relaxed pt-1">{book.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="glass rounded-3xl p-8 sm:p-12 border border-indigo-500/30 text-center space-y-6">
        <div className="max-w-2xl mx-auto space-y-3">
          <h2 className="text-2xl sm:text-4xl font-black text-white">
            Test Your Knowledge From These Books Daily
          </h2>
          <p className="text-slate-300 text-sm sm:text-base">
            Every question in the Aarambh360 question bank is verified and referenced back to these exact standard books.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/#download"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-pink-600 text-white font-bold shadow-lg shadow-indigo-500/25"
          >
            <Download className="w-5 h-5" /> Download App & Practice Questions
          </Link>
          <Link
            href="/ncert"
            className="inline-flex items-center gap-2 px-6 py-4 rounded-xl glass text-slate-200 font-semibold hover:text-indigo-400"
          >
            View NCERT Foundation List →
          </Link>
        </div>
      </div>

    </div>
  );
}
