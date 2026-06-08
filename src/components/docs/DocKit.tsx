// Light documentation content primitives, built on the shared module kit.
import React from 'react';
import { Info } from 'lucide-react';
import { IconChip, Surface } from '@/components/module/ui';
import { cn } from '@/lib/utils';

export function DocHero({ eyebrow, title, lead }: { eyebrow?: string; title: string; lead?: string }) {
  return (
    <div className="mb-10 border-b border-[var(--line)] pb-8">
      {eyebrow && <p className="font-accent mb-2 text-xs font-medium uppercase tracking-[0.14em] text-[var(--ink-faint)]">{eyebrow}</p>}
      <h1 className="text-3xl font-semibold tracking-tight text-[var(--ink)] md:text-[2.4rem] md:leading-[1.1]">{title}</h1>
      {lead && <p className="mt-3 max-w-2xl text-[1.02rem] leading-relaxed text-[var(--ink-muted)]">{lead}</p>}
    </div>
  );
}

export function DocSection({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      {title && <h2 className="font-accent mb-4 text-lg font-semibold tracking-tight text-[var(--ink)]">{title}</h2>}
      <div className="space-y-4 text-[0.95rem] leading-relaxed text-[var(--ink-muted)]">{children}</div>
    </section>
  );
}

export function DocCallout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-3 rounded-xl border border-[var(--line)] bg-[var(--acc-soft)] p-4">
      <Info className="mt-0.5 h-4 w-4 shrink-0 text-[var(--ink-muted)]" />
      <p className="text-sm text-[var(--ink-muted)]">{children}</p>
    </div>
  );
}

export function DocList({ items, ordered }: { items: React.ReactNode[]; ordered?: boolean }) {
  const Tag: any = ordered ? 'ol' : 'ul';
  return (
    <Tag className={cn('space-y-1.5 pl-5 text-sm text-[var(--ink-muted)]', ordered ? 'list-decimal' : 'list-disc')}>
      {items.map((it, i) => <li key={i}>{it}</li>)}
    </Tag>
  );
}

export function DocGrid({ cols = 3, children }: { cols?: 2 | 3; children: React.ReactNode }) {
  return <div className={cn('grid gap-4', cols === 2 ? 'sm:grid-cols-2' : 'sm:grid-cols-2 lg:grid-cols-3')}>{children}</div>;
}

// A small card — either an icon chip or a numbered step badge.
export function DocCard({ icon, step, title, children }: { icon?: React.ReactNode; step?: number; title: string; children?: React.ReactNode }) {
  return (
    <Surface className="p-5">
      <div className="mb-2.5 flex items-center gap-3">
        {icon && <IconChip className="h-9 w-9">{icon}</IconChip>}
        {step != null && !icon && (
          <span className="font-accent flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--acc)] text-xs font-medium text-[var(--acc-contrast)]">{step}</span>
        )}
        <p className="font-accent text-sm font-semibold text-[var(--ink)]">{title}</p>
      </div>
      {children && <div className="text-sm leading-relaxed text-[var(--ink-muted)]">{children}</div>}
    </Surface>
  );
}

// A larger feature block with an icon, description and bullet list.
export function DocFeature({ icon, title, desc, items }: { icon: React.ReactNode; title: string; desc?: string; items?: React.ReactNode[] }) {
  return (
    <Surface className="p-6">
      <div className="mb-3 flex items-center gap-3">
        <IconChip>{icon}</IconChip>
        <h3 className="font-accent text-base font-semibold text-[var(--ink)]">{title}</h3>
      </div>
      {desc && <p className="mb-3 text-sm text-[var(--ink-muted)]">{desc}</p>}
      {items && <DocList items={items} />}
    </Surface>
  );
}
