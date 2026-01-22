import type { Metadata, Viewport } from 'next';
import { Analytics } from '@vercel/analytics/next';
import ClientLayout from '@/components/ClientLayout';
import './globals.css';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export const metadata: Metadata = {
  metadataBase: new URL('https://clarp.lukehalley.com'),
  title: {
    default: 'Clarp - AI Vaporware Generator',
    template: '%s | Clarp',
  },
  description: 'The AI coding assistant that exclusively generates vaporware. Now shipping nothing to production. Building the future, one empty promise at a time.',
  keywords: ['clarp', 'ai agent', 'satire', 'crypto', 'solana', 'memecoin', 'vaporware', 'ai coding assistant', 'vaporware generator'],
  authors: [{ name: 'Clarp Team' }],
  creator: 'Clarp',
  publisher: 'Clarp',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: 'Clarp ($CLARP) - AI Vaporware Generator',
    description: 'The AI coding assistant that exclusively generates vaporware. Now shipping nothing to production. Building the future, one empty promise at a time.',
    type: 'website',
    locale: 'en_US',
    url: 'https://clarp.lukehalley.com',
    siteName: 'Clarp',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Clarp - The AI coding assistant that exclusively generates vaporware',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Clarp ($CLARP) - AI Vaporware Generator',
    description: 'The AI coding assistant that exclusively generates vaporware. Now shipping nothing to production. Building the future, one empty promise at a time.',
    images: ['/og-image.png'],
    creator: '@clarp',
  },
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
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="antialiased">
        <ClientLayout>
          {children}
        </ClientLayout>
        <Analytics />
      </body>
    </html>
  );
}
