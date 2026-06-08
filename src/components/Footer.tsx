//@ts-nocheck
// components/Footer.tsx
'use client';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

const COLUMNS = [
  {
    title: 'Product',
    links: [
      { href: '/audit', label: 'FDA Audit' },
      { href: '/ai-act', label: 'EU AI Act' },
      { href: '/analytics', label: 'Analytics' },
      { href: '/pricing', label: 'Pricing' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { href: '/docs', label: 'Documentation' },
      { href: '/docs/quickstart', label: 'Quickstart' },
      { href: '/docs/eu-ai-act', label: 'EU AI Act guide' },
    ],
  },
  {
    title: 'Company',
    links: [
      { href: '/company', label: 'About' },
      { href: '/contact', label: 'Contact' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { href: '/terms', label: 'Terms of Service' },
    ],
  },
];

export const Footer = () => {
  const pathname = usePathname();
  // Match the light product modules; the footer sits outside .module-theme so it
  // carries its own surface. Dark on the landing + marketing pages.
  const light = pathname?.startsWith('/ai-act') || pathname?.startsWith('/audit') || pathname?.startsWith('/analytics') || pathname?.startsWith('/docs');

  const heading = light ? 'text-neutral-900' : 'text-white';
  const muted = light ? 'text-neutral-500 hover:text-neutral-900' : 'text-white/55 hover:text-white';
  const colTitle = light ? 'text-neutral-400' : 'text-white/40';

  return (
    <footer className={`border-t transition-colors ${light ? 'bg-[#fafaf9] border-black/[0.06]' : 'bg-[#09090b] border-white/10'}`}>
      <div className="mx-auto max-w-6xl px-6 py-14 md:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-12">
          {/* Brand */}
          <div className="lg:col-span-4">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <Image src="/logoo.png" alt="Grimoire One logo" width={32} height={32} className="h-8 w-8 rounded-lg object-cover ring-1 ring-white/10" />
              <span className={`font-plex text-base font-semibold tracking-tight ${heading}`}>Grimoire One</span>
            </Link>
            <p className={`mt-4 max-w-xs text-sm leading-relaxed ${light ? 'text-neutral-500' : 'text-white/50'}`}>
              Compliance you can prove. Regulations compiled into executable logic — for FDA 21 CFR and the EU AI Act.
            </p>
          </div>

          {/* Link columns */}
          {COLUMNS.map((col) => (
            <div key={col.title} className="lg:col-span-2">
              <p className={`font-plex mb-3 text-[0.7rem] font-medium uppercase tracking-[0.12em] ${colTitle}`}>{col.title}</p>
              <ul className="space-y-2">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className={`text-sm transition-colors ${muted}`}>{l.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className={`mt-12 flex flex-col items-center justify-between gap-3 border-t pt-6 text-sm sm:flex-row ${light ? 'border-black/[0.06] text-neutral-500' : 'border-white/10 text-white/45'}`}>
          <p>© {new Date().getFullYear()} Grimoire One. All rights reserved.</p>
          <p className="font-plex text-xs uppercase tracking-[0.12em]">Prove it. Don&apos;t claim it.</p>
        </div>
      </div>
    </footer>
  );
};
