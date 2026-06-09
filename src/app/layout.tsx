//@ts-nocheck
import type { Metadata } from 'next';
import { IBM_Plex_Mono, Newsreader } from 'next/font/google';
import { Toaster } from 'sonner';
import { ThemeProvider } from '@/components/theme-provider';
import { NavBar } from '@/components/NavBar';
import { Footer } from '@/components/Footer';
import { Providers } from './providers';

import './globals.css';

// Accent typeface for the product modules (headings/labels/badges/nav/code),
// exposed as a CSS variable and applied only under .module-theme.
const plexMono = IBM_Plex_Mono({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-plex-mono',
  display: 'swap',
});

// Editorial display serif for the marketing surface — the "voice of the law,"
// set against Plex Mono (the voice of the engine). True italics + optical sizing.
const newsreader = Newsreader({
  weight: ['400', '500', '600'],
  style: ['normal', 'italic'],
  subsets: ['latin'],
  variable: '--font-newsreader',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Grimoire One',
  description: 'Formally-verified FDA 21 CFR and EU AI Act compliance — prove adherence, don\'t just claim it.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${plexMono.variable} ${newsreader.variable}`}>
      <head>
        <link rel="icon" href="/icon.png" type="image/png" sizes="any" />
      </head>
      <body className="antialiased">
        <Providers>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  );
}
