// Light documentation content primitives, built on the shared module kit —
// serif headings, mono apparatus, hairline rules, typographic markers.
import React from 'react';
import { IconChip, Surface } from '@/components/module/ui';
import { DocReadingProgress } from '@/components/docs/DocReadingProgress';
import { cn } from '@/lib/utils';

export function DocHero({ eyebrow, title, lead }: { eyebrow?: string; title: string; lead?: string }) {
  return (
    <div className="mb-10">
      <div className="border-b border-[var(--line)] pb-8">
        {eyebrow && <p className="font-accent mb-3 text-[0.7rem] font-medium uppercase tracking-[0.22em] text-[var(--ink-faint)]">{eyebrow}</p>}
        <h1 className="text-[1.9rem] tracking-tight text-[var(--ink)] md:text-[2.4rem] md:leading-[1.08]">{title}</h1>
        {lead && <p className="mt-3 max-w-2xl text-[1.02rem] leading-relaxed text-[var(--ink-muted)]">{lead}</p>}
      </div>
      <DocReadingProgress eyebrow={eyebrow} />
    </div>
  );
}

export function DocSection({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      {title && <h2 className="mb-4 border-b border-[var(--line)] pb-2 text-[1.35rem] tracking-tight text-[var(--ink)]">{title}</h2>}
      <div className="space-y-4 text-[0.95rem] leading-relaxed text-[var(--ink-muted)]">{children}</div>
    </section>
  );
}

export function DocCallout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-3 border border-[var(--line)] bg-[var(--acc-soft)] p-4">
      <span className="font-accent mt-0.5 shrink-0 text-sm leading-none text-[var(--ink-muted)]" aria-hidden>§</span>
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

// A small card — a ruled index entry; a numbered step reads as a mono index.
export function DocCard({ icon, step, title, children }: { icon?: React.ReactNode; step?: number; title: string; children?: React.ReactNode }) {
  return (
    <Surface className="p-5">
      <div className="mb-2.5 flex items-baseline gap-3">
        {icon && <IconChip className="h-9 w-9 self-center">{icon}</IconChip>}
        {step != null && !icon && (
          <span className="font-accent text-[0.78rem] text-[var(--ink-faint)]" aria-hidden>{String(step).padStart(2, '0')}</span>
        )}
        <p className="font-accent text-sm font-semibold text-[var(--ink)]">{title}</p>
      </div>
      {children && <div className="text-sm leading-relaxed text-[var(--ink-muted)]">{children}</div>}
    </Surface>
  );
}

// A larger feature block — ruled, with a serif-set title and bullet list.
export function DocFeature({ icon, title, desc, items }: { icon?: React.ReactNode; title: string; desc?: string; items?: React.ReactNode[] }) {
  return (
    <Surface className="p-6">
      <div className="mb-3 flex items-center gap-3 border-b border-[var(--line)] pb-3">
        {icon && <IconChip>{icon}</IconChip>}
        <h3 className="font-accent text-base font-semibold text-[var(--ink)]">{title}</h3>
      </div>
      {desc && <p className="mb-3 text-sm text-[var(--ink-muted)]">{desc}</p>}
      {items && <DocList items={items} />}
    </Surface>
  );
}
