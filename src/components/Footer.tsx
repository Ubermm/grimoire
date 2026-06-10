//@ts-nocheck
// components/Footer.tsx — set like a colophon: hairline rules, mono apparatus,
// a serif sign-off. Dark (ink) on the marketing surface, light on the product
// modules, which sit outside .module-theme.
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
  const light = pathname?.startsWith('/ai-act') || pathname?.startsWith('/audit') || pathname?.startsWith('/analytics') || pathname?.startsWith('/docs');

  const heading = light ? 'text-neutral-900' : 'text-white';
  const muted = light ? 'text-neutral-500 hover:text-neutral-900' : 'text-white/65 hover:text-white';
  const colTitle = light ? 'text-neutral-400' : 'text-white/55';
  const hairline = light ? 'border-black/[0.08]' : 'border-white/[0.14]';

  return (
    <footer className={`border-t transition-colors ${light ? 'bg-[#fafaf9]' : 'bg-[#0b0a09]'} ${hairline}`}>
      <div className="mx-auto max-w-6xl px-6 py-14 md:px-8">
        {/* running line, like a colophon's imprint */}
        <div className={`flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b pb-4 ${hairline}`}>
          <p className={`font-plex text-[0.68rem] uppercase tracking-[0.22em] ${light ? 'text-neutral-400' : 'text-white/55'}`}>
            Grimoire One — a compliance engine
          </p>
          <p className={`font-plex hidden text-[0.68rem] tracking-[0.08em] sm:block ${light ? 'text-neutral-300' : 'text-white/25'}`} aria-hidden>
            evidence ⊢ verdict
          </p>
        </div>

        <div className="mt-10 grid gap-10 sm:grid-cols-2 lg:grid-cols-12">
          {/* Brand */}
          <div className="lg:col-span-4">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <Image src="/logoo.png" alt="Grimoire One logo" width={32} height={32} className="h-8 w-8 rounded-lg object-cover ring-1 ring-white/10" />
              <span className={`font-serif-display text-xl font-medium tracking-tight ${heading}`}>Grimoire One</span>
            </Link>
            <p className={`mt-4 max-w-xs text-sm leading-relaxed ${light ? 'text-neutral-500' : 'text-white/65'}`}>
              Compliance you can prove. Regulations compiled into executable logic — for FDA 21 CFR
              and the EU AI Act.
            </p>
          </div>

          {/* Link columns — an index, two-digit mono ordinals */}
          {COLUMNS.map((col, ci) => (
            <div key={col.title} className="lg:col-span-2">
              <p className={`font-plex mb-3 text-[0.68rem] font-medium uppercase tracking-[0.18em] ${colTitle}`}>
                <span className="mr-2 opacity-70">{String(ci + 1).padStart(2, '0')}</span>{col.title}
              </p>
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

        <div className={`mt-12 flex flex-col items-baseline justify-between gap-3 border-t pt-6 sm:flex-row ${hairline}`}>
          <p className={`text-sm ${light ? 'text-neutral-500' : 'text-white/60'}`}>
            © {new Date().getFullYear()} Grimoire One. All rights reserved.
          </p>
          <p className={`font-serif-display text-[0.95rem] italic ${light ? 'text-neutral-500' : 'text-white/70'}`}>
            Prove it. Don&apos;t claim it.&ensp;<span className="font-plex not-italic text-[0.7rem]" aria-hidden>∎</span>
          </p>
        </div>
      </div>
    </footer>
  );
};
