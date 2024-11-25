'use client';

import { ThemeProvider } from 'next-themes';
import Link from 'next/link';
import { ReactNode, useEffect, useState } from 'react';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';

export default function RootLayout({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true); // Ensure the component mounts client-side
  }, []);

  if (!mounted) return null; // Prevents rendering until the client resolves the theme

  return (
    <html lang="en">
      <body>
        <ThemeProvider attribute="class" defaultTheme="dark">
          {/* Navbar */}
          <nav className="bg-background border-b border-border text-foreground shadow-md">
            <div className="container mx-auto flex justify-between items-center p-4">
              <div className="text-xl font-bold">UP2TOM Integration</div>
              <ul className="flex space-x-6 text-sm font-medium">
                <li>
                  <Link href="/" className="hover:text-primary">
                    New Prompt
                  </Link>
                </li>
                <li>
                  <Link href="/batch" className="hover:text-primary">
                    Batch
                  </Link>
                </li>
                <li>
                  <Link href="/decisions" className="hover:text-primary">
                    Decisions
                  </Link>
                </li>
              </ul>
            </div>
          </nav>

          {/* Main Content */}
          <main className="container mx-auto p-6">{children}</main>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
