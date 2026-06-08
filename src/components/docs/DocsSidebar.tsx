'use client';
// Sticky docs sidebar with grouped sections + active highlighting.
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
  return (
    <aside className="lg:sticky lg:top-24">
      <nav className="space-y-6">
        {DOC_GROUPS.map((g) => (
          <div key={g.heading}>
            <p className="font-accent mb-2 text-[0.7rem] font-medium uppercase tracking-[0.12em] text-[var(--ink-faint)]">{g.heading}</p>
            <ul className="space-y-0.5">
              {g.links.map((l) => {
                const active = pathname === l.href;
                return (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className={cn(
                        'block rounded-lg px-3 py-1.5 text-sm transition-colors',
                        active ? 'bg-[var(--acc)]/10 font-medium text-[var(--acc)]' : 'text-[var(--ink-muted)] hover:bg-black/[0.03] hover:text-[var(--ink)]'
                      )}
                    >
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
