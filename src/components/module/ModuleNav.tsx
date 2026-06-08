'use client';
// Slim in-module navigation shared across product modules. Sits just beneath the
// global (dark) NavBar and gives each module a cohesive, platform feel: a
// wordmark, primary section tabs with an active pill, IBM Plex Mono accents.
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export type ModuleTab = { href: string; label: string; exact?: boolean };

export type ModuleWordmark = {
  href: string;
  icon: React.ReactNode;
  label: string;
  suffix?: string;
};

export function ModuleNav({ wordmark, tabs }: { wordmark: ModuleWordmark; tabs: ModuleTab[] }) {
  const pathname = usePathname() || '';
  const isActive = (t: ModuleTab) =>
    t.exact ? pathname === t.href : pathname === t.href || pathname.startsWith(`${t.href}/`);

  return (
    <div className="border-b border-[var(--line)]">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-4 px-6 md:px-8">
        <Link href={wordmark.href} className="group flex shrink-0 items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[var(--acc)] text-[var(--acc-contrast)]">
            {wordmark.icon}
          </span>
          <span className="font-accent text-sm font-semibold tracking-tight text-[var(--ink)]">{wordmark.label}</span>
          {wordmark.suffix && (
            <span className="font-accent hidden text-xs text-[var(--ink-faint)] sm:inline">/ {wordmark.suffix}</span>
          )}
        </Link>

        <nav className="flex items-center gap-0.5 overflow-x-auto">
          {tabs.map((t) => {
            const active = isActive(t);
            return (
              <Link
                key={t.href}
                href={t.href}
                className={cn(
                  'font-accent whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
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
