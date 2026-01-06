import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Claude LARP Agent ($CLA) - Building Nothing, Together',
  description: 'The AI coding assistant that exclusively generates vaporware. Now shipping nothing to production.',
  keywords: ['claude', 'ai agent', 'satire', 'crypto', 'solana', 'memecoin', 'vaporware'],
  openGraph: {
    title: 'Claude LARP Agent ($CLA)',
    description: 'The AI coding assistant that exclusively generates vaporware.',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Claude LARP Agent ($CLA)',
    description: 'The AI coding assistant that exclusively generates vaporware.',
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
      <body className="antialiased">{children}</body>
    </html>
  );
}
