export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  category: 'Prelims' | 'Mains' | 'Strategy' | 'Current Affairs' | 'NCERT';
  author: {
    name: string;
    role: string;
    avatar: string;
  };
  publishedAt: string;
  readTime: string;
  featured?: boolean;
  content: string;
  tags: string[];
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: 'upsc-prelims-active-recall-strategy-2026',
    title: 'How to Master UPSC Prelims with Daily Active Recall & AI Mentorship',
    excerpt: 'Passive reading guarantees negative marking. Discover how top rankers use spaced repetition, mistake vaulting, and AI simulation to cross 110+ in GS Paper 1.',
    category: 'Strategy',
    author: {
      name: 'Dr. Rajiv Sharma',
      role: 'Chief UPSC Academic Mentor, Aarambh360',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
    },
    publishedAt: 'August 28, 2026',
    readTime: '6 min read',
    featured: true,
    tags: ['Prelims Strategy', 'Active Recall', 'MCQ Practice', 'UPSC 2026'],
    content: [
      '## Why Passive Reading Fails in UPSC Prelims',
      'Every year, over 10 lakh aspirants read Laxmikanth, Spectrum, and NCERTs multiple times. Yet, less than 1.5% qualify Prelims. The root cause is not lack of effort—it is **The Illusion of Competence**. When you reread a chapter, your brain recognizes the text and tricks you into believing you know it. Under exam pressure with subtle trap options, recognition collapses.',
      '### The 3 Pillars of Active Recall',
      '1. **Daily Timed Testing (Before Revision)**: Attempt 20-30 questions on a topic before reading notes to expose blindspots.',
      '2. **Mistake Vault Logging**: Categorize errors into Conceptual Gap, Factual Memory Slip, or Misreading Slip.',
      '3. **Spaced Intervals for High-Yield Retention**: Review tricky questions at Day 1, Day 3, and Day 7 using the Aarambh360 Mistake Vault.',
      '## How Aarambh360 Daily Challenge Solves This',
      'The Aarambh360 Daily Challenge creates an unavoidable habit loop with 50 Questions in 25 Minutes, strictly 1 attempt per day, and AI diagnostic feedback.'
    ].join('\n\n')
  },
  {
    slug: 'complete-ncert-roadmap-upsc-cse',
    title: 'The Definitive NCERT Roadmap for UPSC: Which Books to Read & Which to Skip',
    excerpt: 'Stop wasting months reading 40+ NCERTs cover to cover. Here is the curated, high-yield list of Class 6-12 NCERTs essential for UPSC Prelims & Mains.',
    category: 'NCERT',
    author: {
      name: 'Ananya Verma',
      role: 'AIR 42 & Content Lead',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
    },
    publishedAt: 'August 24, 2026',
    readTime: '8 min read',
    featured: false,
    tags: ['NCERT Books', 'Foundational Reading', 'Prelims GS-1'],
    content: [
      '## The Common NCERT Trap',
      'Aspirants frequently buy entire NCERT sets from Class 6 to 12 (over 45 books) and spend 6 months reading basic science or outdated world history chapters that yield zero UPSC questions.',
      '### 1. Geography (Absolute Must-Read)',
      '- **Class 11**: Fundamentals of Physical Geography (The holy grail of geomorphology, climatology, and oceanography).',
      '- **Class 11**: India: Physical Environment (Drainage systems, physiographic divisions, climate).',
      '- **Class 12**: Fundamentals of Human Geography & India: People and Economy.',
      '### 2. History & Culture',
      '- **Class 11**: An Introduction to Indian Art (Part 1) (Direct source of Temple Architecture and Buddhist sculpture questions).',
      '- **Class 12**: Themes in Indian History (Part 1, 2, and 3) (Crucial for Medieval terms and Modern Freedom struggle).',
      '### 3. Economics',
      '- **Class 11**: Indian Economic Development (Essential for post-independence reforms and agrarian issues).',
      '- **Class 12**: Introductory Macroeconomics (GDP, Fiscal Deficit, Monetary Policy tools).'
    ].join('\n\n')
  },
  {
    slug: 'mastering-mains-answer-writing-ai-evaluation',
    title: 'Mastering UPSC Mains Answer Writing: Structure, Dimensions & Instant AI Feedback',
    excerpt: 'Learn the Introduction-Body-Conclusion framework that consistently scores 100+ in GS Papers, and how AI evaluation can audit your handwriting and content structure.',
    category: 'Mains',
    author: {
      name: 'Vikramaditya Rao',
      role: 'Senior Mains Evaluator',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
    },
    publishedAt: 'August 20, 2026',
    readTime: '7 min read',
    featured: true,
    tags: ['Mains Answer Writing', 'GS Paper 2', 'GS Paper 3', 'AI Evaluation'],
    content: [
      '## Why Knowledge Does Not Equal Marks in Mains',
      'In UPSC Mains, you have roughly 7 minutes for a 10-marker (150 words) and 11 minutes for a 15-marker (250 words). To score top marks, your answer must be visually structured and rich in multi-dimensional keywords.',
      '### The Winning 3-Tier Answer Blueprint',
      '1. **Introduction (15-20 words)**: Begin with a precise definition, constitutional article, or recent relevant statistic/report index.',
      '2. **Body (80-100 words)**: Divide into subheadings directly reflecting question directives using the PESTLE approach (Political, Economic, Social, Technological, Legal, Environmental).',
      '3. **Conclusion / Way Forward (20-30 words)**: Positive, forward-looking, aligned with constitutional values or government flagship schemes.',
      '### Instant AI Handwritten Evaluation on Aarambh360',
      'Write your answer on paper, take a photo in the app, and get instant OCR extraction and rubric-based score analysis.'
    ].join('\n\n')
  },
  {
    slug: 'eliminating-negative-marking-prelims-3-round-rule',
    title: 'How to Eliminate Negative Marking in UPSC Prelims: The 3-Round Attempt Strategy',
    excerpt: 'Negative marking destroys more dreams than tough questions. Here is the mathematically proven 3-round exam hall strategy used by top rankers.',
    category: 'Prelims',
    author: {
      name: 'Dr. Rajiv Sharma',
      role: 'Chief UPSC Academic Mentor, Aarambh360',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
    },
    publishedAt: 'August 15, 2026',
    readTime: '5 min read',
    featured: false,
    tags: ['Negative Marking', 'Exam Hall Strategy', 'Prelims GS-1'],
    content: [
      '## The Mathematics of Negative Marking',
      'In UPSC Prelims Paper 1: Each correct question gives +2.0 Marks, and each incorrect question penalizes -0.66 Marks.',
      '### The 3-Round Strategy',
      '- **Round 1 (First 45 Minutes - 100% Sure Questions)**: Solve only questions where you are 100% certain. Bubble them immediately on the OMR sheet.',
      '- **Round 2 (Next 40 Minutes - 50:50 Eliminations)**: Tackle questions where you have eliminated 2 options. Probability is heavily in your favor here.',
      '- **Round 3 (Last 25 Minutes - Calculated Educated Guesses)**: Evaluate remaining questions based on question patterns and contextual logic. Never blind guess!'
    ].join('\n\n')
  }
];

export function getBlogPost(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find(p => p.slug === slug);
}
