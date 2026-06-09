'use client';
// Sticky docs sidebar — a ruled index: mono two-digit entries on a hairline,
// the active page marked by an ink left rule instead of a filled pill.
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export const DOC_GROUPS = [
  {
    heading: 'Get started',
    links: [
      { href: '/docs/overview', label: 'Platform overview' },
      { href: '/docs/quickstart', label: 'Quickstart' },
    ],
  },
  {
    heading: 'FDA 21 CFR',
    links: [
      { href: '/docs/prolog-validation', label: 'Prolog validation' },
      { href: '/docs/letter-comparison', label: 'Letter comparison' },
      { href: '/docs/similar-violations', label: 'Similar violations' },
      { href: '/docs/ai-best-practices', label: 'AI best practices' },
    ],
  },
  {
    heading: 'EU AI Act',
    links: [
      { href: '/docs/eu-ai-act', label: 'EU AI Act module' },
    ],
  },
];

export function DocsSidebar() {
  const pathname = usePathname() || '';
  const flat = DOC_GROUPS.flatMap((g) => g.links);
  return (
    <aside className="lg:sticky lg:top-24">
      <nav className="space-y-6">
        {DOC_GROUPS.map((g) => (
          <div key={g.heading}>
            <p className="font-accent mb-2 text-[0.7rem] font-medium uppercase tracking-[0.12em] text-[var(--ink-faint)]">{g.heading}</p>
            <ul className="border-l border-[var(--line)]">
              {g.links.map((l) => {
                const active = pathname === l.href;
                const n = String(flat.findIndex((x) => x.href === l.href) + 1).padStart(2, '0');
                return (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className={cn(
                        '-ml-px flex items-baseline gap-2.5 border-l py-1.5 pl-3 pr-2 text-sm transition-colors',
                        active
                          ? 'border-[var(--ink)] font-medium text-[var(--ink)]'
                          : 'border-transparent text-[var(--ink-muted)] hover:border-[var(--line-strong)] hover:text-[var(--ink)]'
                      )}
                    >
                      <span className="font-accent text-[0.68rem] text-[var(--ink-faint)]" aria-hidden>{n}</span>
                      {l.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
}
