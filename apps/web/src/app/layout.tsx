import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Aarambh360 | India\'s #1 AI Super-App for UPSC CSE Preparation',
  description: 'Master UPSC Civil Services Examination with Aarambh360. 24/7 AI Mentor, Daily 50-MCQ Timed Challenges, Interactive Map Game, Mistake Vault, and AI Mains Answer Evaluation.',
  keywords: ['UPSC', 'UPSC CSE 2026', 'IAS Preparation', 'UPSC AI Mentor', 'UPSC Prelims MCQs', 'Mains Answer Writing', 'Aarambh360', 'aarambhskills.com'],
  openGraph: {
    title: 'Aarambh360 | UPSC CSE AI Super-App',
    description: 'Transform your UPSC preparation with AI Doubts Clearing, Daily Timed Challenges, and AI Mains Evaluation.',
    url: 'https://aarambhskills.com',
    siteName: 'Aarambh360',
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Aarambh360 | UPSC CSE Super-App',
    description: 'Master UPSC Prelims & Mains with AI-driven active recall and instant evaluation.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body className="bg-[#0B0F19] text-slate-100 min-h-screen flex flex-col antialiased selection:bg-indigo-500 selection:text-white">
        <Navbar />
        <main className="flex-grow">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
