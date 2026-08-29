import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  metadataBase: new URL('https://aarambhskills.com'),
  title: {
    default: 'Aarambh360 | India\'s #1 AI Super-App for UPSC CSE Preparation',
    template: '%s | Aarambh360'
  },
  description: 'Master UPSC Civil Services Examination (CSE 2026-2027) with Aarambh360. 24/7 Socratic AI Mentor, Daily 50-MCQ Timed Challenges, Interactive Map Game, Mistake Vault, NCERT Roadmap, and Instant AI Mains Evaluation.',
  keywords: [
    'UPSC preparation app',
    'best app for UPSC CSE',
    'UPSC AI mentor',
    'UPSC Prelims daily challenge',
    'UPSC Mains AI answer evaluation',
    'NCERT books for UPSC',
    'UPSC exam schedule 2026',
    'UPSC Prelims test series',
    'Aarambh360',
    'aarambhskills.com',
    'IAS exam preparation app'
  ],
  authors: [{ name: 'Aarambh360 Editorial Team', url: 'https://aarambhskills.com' }],
  creator: 'Aarambh360 Technologies',
  publisher: 'Aarambh360',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: 'Aarambh360 | India\'s #1 AI Super-App for UPSC CSE Preparation',
    description: 'Transform your UPSC preparation with 24/7 AI Doubts Clearing, Daily Timed Challenges, Interactive Map Game, and AI Mains Evaluation.',
    url: 'https://aarambhskills.com',
    siteName: 'Aarambh360',
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Aarambh360 | UPSC CSE AI Super-App',
    description: 'Master UPSC Prelims & Mains with AI-driven active recall, NCERT roadmaps, and instant handwritten evaluation.',
    creator: '@aarambh360',
  },
  alternates: {
    canonical: 'https://aarambhskills.com',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': 'https://aarambhskills.com/#organization',
        'name': 'Aarambh360',
        'url': 'https://aarambhskills.com',
        'logo': 'https://aarambhskills.com/logo.png',
        'sameAs': [
          'https://twitter.com/aarambh360',
          'https://t.me/aarambh360'
        ]
      },
      {
        '@type': 'SoftwareApplication',
        '@id': 'https://aarambhskills.com/#app',
        'name': 'Aarambh360: UPSC CSE AI Super-App',
        'operatingSystem': 'Android',
        'applicationCategory': 'EducationalApplication',
        'offers': {
          '@type': 'Offer',
          'price': '0',
          'priceCurrency': 'INR'
        },
        'aggregateRating': {
          '@type': 'AggregateRating',
          'ratingValue': '4.9',
          'ratingCount': '1240'
        }
      }
    ]
  };

  return (
    <html lang="en" className="dark scroll-smooth">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (localStorage.theme === 'light' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: light)').matches)) {
                  document.documentElement.classList.remove('dark');
                } else {
                  document.documentElement.classList.add('dark');
                }
              } catch (_) {}
            `,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script src="https://cdn.tailwindcss.com"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              tailwind.config = {
                darkMode: 'class',
                theme: {
                  extend: {
                    colors: {
                      background: '#0B0F19',
                      foreground: '#F8FAFC',
                      brand: {
                        orange: '#F97316',
                        gold: '#F59E0B',
                        emerald: '#10B981',
                        dark: '#0B0F19',
                        card: '#131B2E',
                        border: '#1E293B'
                      }
                    }
                  }
                }
              }
            `,
          }}
        />
      </head>
      <body className="min-h-screen flex flex-col antialiased selection:bg-indigo-500 selection:text-white">
        <Navbar />
        <main className="flex-grow">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
