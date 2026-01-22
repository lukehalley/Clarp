'use client';

import Navbar from '@/components/Navbar';
import ClarpAI from '@/components/ClarpAI';

interface ClientLayoutProps {
  children: React.ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  return (
    <>
      <Navbar />
      {children}
      <ClarpAI />
    </>
  );
}
