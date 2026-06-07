'use client';
// Slim in-module navigation for the EU AI Act surface. Sits just beneath the
// global (dark) NavBar and gives the module a cohesive, OpenAI-platform feel:
// a wordmark, primary section tabs with an active pill, and quick context.
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

const TABS = [
  { href: '/ai-act', label: 'Overview', exact: true },
  { href: '/ai-act/registry', label: 'Registry' },
  { href: '/ai-act/classify', label: 'Classify' },
  { href: '/ai-act/audit', label: 'Audit' },
  { href: '/ai-act/authoring', label: 'Authoring' },
  { href: '/ai-act/cross-regulation', label: 'Cross-reg' },
];

export function ModuleNav() {
  const pathname = usePathname() || '';
  const isActive = (t: (typeof TABS)[number]) =>
    t.exact ? pathname === t.href : pathname === t.href || pathname.startsWith(`${t.href}/`);

  return (
    <div className="border-b border-[var(--line)]">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-4 px-6 md:px-8">
        <Link href="/ai-act" className="group flex shrink-0 items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[var(--acc)] text-[var(--acc-contrast)]">
            <Sparkles className="h-3.5 w-3.5" />
          </span>
          <span className="text-sm font-semibold tracking-tight text-[var(--ink)]">
            AI Act
          </span>
          <span className="hidden text-xs text-[var(--ink-faint)] sm:inline">/ GrimoireOne</span>
        </Link>

        <nav className="flex items-center gap-0.5 overflow-x-auto">
          {TABS.map((t) => {
            const active = isActive(t);
            return (
              <Link
                key={t.href}
                href={t.href}
                className={cn(
                  'whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
                  active
                    ? 'bg-[var(--acc)] text-[var(--acc-contrast)]'
                    : 'text-[var(--ink-muted)] hover:bg-black/[0.04] hover:text-[var(--ink)]'
                )}
              >
                {t.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
