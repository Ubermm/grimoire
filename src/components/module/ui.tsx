'use client';
// Presentational primitives shared across the Grimoire One product modules
// (FDA Audit + EU AI Act) — the landing's scholarly-press language set in
// daylight: square corners, hairline rules, serif titles (Newsreader), mono
// apparatus (Plex), typographic markers over icon chrome. Colour + font tokens
// (--acc, --ink, --line, --font-accent, --font-serif, …) live in
// src/styles/module-theme.css under .module-theme.
import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export const ACCENT = '#141310';

/* ----------------------------------------------------------------- surfaces */

export function Surface({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn('border border-[var(--line)] bg-[var(--surface)]', className)}>
      {children}
    </div>
  );
}

// Titled surface — a ruled panel with an optional header row + subtitle.
export function SectionCard({
  title,
  subtitle,
  action,
  className,
  bodyClassName,
  children,
}: {
  title?: React.ReactNode;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
  bodyClassName?: string;
  children: React.ReactNode;
}) {
  return (
    <Surface className={className}>
      {(title || action) && (
        <div className="flex items-start justify-between gap-4 border-b border-[var(--line)] px-6 py-4">
          <div>
            {title && <p className="font-accent text-[0.72rem] font-medium uppercase tracking-[0.16em] text-[var(--ink)]">{title}</p>}
            {subtitle && <p className="mt-1 text-sm text-[var(--ink-muted)]">{subtitle}</p>}
          </div>
          {action}
        </div>
      )}
      <div className={cn('p-6', bodyClassName)}>{children}</div>
    </Surface>
  );
}

// Disclosure surface — a square hairline block whose header explains what the
// block does before it is opened. The "+" rotates to "×" like the landing FAQ.
export function CollapsibleSection({
  title,
  hint,
  defaultOpen = false,
  children,
  className,
}: {
  title: React.ReactNode;
  hint?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  const [open, setOpen] = React.useState(defaultOpen);
  return (
    <Surface className={className}>
      <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} className="flex w-full items-start justify-between gap-4 px-5 py-4 text-left">
        <span className="min-w-0">
          <span className="font-accent block text-[0.78rem] font-semibold uppercase tracking-[0.12em] text-[var(--ink)]">{title}</span>
          {hint && <span className="mt-1 block text-left text-sm font-normal normal-case tracking-normal leading-relaxed text-[var(--ink-muted)]">{hint}</span>}
        </span>
        <span className={cn('font-accent shrink-0 select-none text-lg leading-none text-[var(--ink-faint)] transition-transform duration-300', open && 'rotate-45')} aria-hidden>+</span>
      </button>
      {open && <div className="border-t border-[var(--line)] px-5 py-5">{children}</div>}
    </Surface>
  );
}

/* ------------------------------------------------------------------ buttons */

export function AccentButton({ className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        'font-accent inline-flex items-center justify-center gap-2 border border-[var(--acc)] bg-[var(--acc)] px-4 py-2 text-[0.78rem] font-medium uppercase tracking-[0.1em] text-[var(--acc-contrast)]',
        'transition-colors hover:bg-[var(--acc-hover)] active:translate-y-px',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-black/15 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--canvas)]',
        'disabled:cursor-not-allowed disabled:opacity-40',
        className
      )}
      {...props}
    />
  );
}

export function GhostButton({ className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        'font-accent inline-flex items-center justify-center gap-2 border border-[var(--line-strong)] bg-transparent px-4 py-2 text-[0.78rem] font-medium uppercase tracking-[0.1em] text-[var(--ink-muted)]',
        'transition-colors hover:border-[var(--ink)] hover:text-[var(--ink)]',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-black/10',
        'disabled:cursor-not-allowed disabled:opacity-40',
        className
      )}
      {...props}
    />
  );
}

/* ------------------------------------------------------------------ headers */

export function PageHeader({
  title,
  subtitle,
  eyebrow,
  action,
}: {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-8 border-b border-[var(--line)] pb-6">
      {eyebrow && (
        <p className="font-accent mb-3 text-[0.7rem] font-medium uppercase tracking-[0.22em] text-[var(--ink-faint)]">{eyebrow}</p>
      )}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-[1.9rem] tracking-tight text-[var(--ink)] md:text-[2.4rem] md:leading-[1.08]">
            {title}
          </h1>
          {subtitle && <p className="mt-2.5 max-w-2xl text-[0.95rem] leading-relaxed text-[var(--ink-muted)]">{subtitle}</p>}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------- fields */

export function Label({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={cn('font-accent mb-1.5 block text-xs font-medium uppercase tracking-wide text-[var(--ink-muted)]', className)} {...props} />;
}

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn('ai-field', className)} {...props} />;
}

export function Textarea({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn('ai-field resize-y', className)} {...props} />;
}

export function Select({ className, children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={cn('ai-field cursor-pointer appearance-none pr-9', className)} {...props}>
      {children}
    </select>
  );
}

export function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <Label>{label}</Label>
      {children}
    </div>
  );
}

/* -------------------------------------------------------------- indicators */

export function Spinner({ className }: { className?: string }) {
  return <Loader2 className={cn('h-4 w-4 animate-spin', className)} />;
}

export function Badge({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <span
      className={cn(
        'font-accent inline-flex items-center rounded-[2px] border border-[var(--line-strong)] bg-[var(--acc-soft)] px-2 py-0.5 text-[0.68rem] font-medium uppercase tracking-[0.08em] text-[var(--ink-muted)]',
        className
      )}
    >
      {children}
    </span>
  );
}

export function EmptyState({ title, hint, action }: { title: string; hint?: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center border border-dashed border-[var(--line-strong)] bg-black/[0.012] px-6 py-16 text-center">
      <p className="font-serif-display text-base text-[var(--ink)]">{title}</p>
      {hint && <p className="mt-1.5 max-w-sm text-sm text-[var(--ink-faint)]">{hint}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

/* ------------------------------------------------------------------- icons */

// Cohesive icon container — a flat accent square with a hairline ring. Kept for
// functional iconography; prefer typographic markers (§ ⊢ → two-digit indices)
// for anything decorative.
export function IconChip({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <span
      className={cn(
        'inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[2px] bg-[var(--acc-soft)] text-[var(--ink)] ring-1 ring-inset ring-[var(--line)]',
        className
      )}
    >
      {children}
    </span>
  );
}

/* --------------------------------------------------------------- nav cards */

// Clickable entry used on the hub and dashboards — a ruled index entry, not a
// floating card. `icon` is optional; an `index` ("01") reads more editorial.
export function EntryCard({
  href,
  icon,
  index,
  title,
  desc,
}: {
  href: string;
  icon?: React.ReactNode;
  index?: string;
  title: string;
  desc: string;
}) {
  return (
    <Link
      href={href}
      className="group relative flex flex-col gap-4 border border-[var(--line)] bg-[var(--surface)] p-5 transition-colors hover:border-[var(--ink)]"
    >
      <div className="flex items-center justify-between">
        {index ? (
          <span className="font-accent text-[0.78rem] text-[var(--ink-faint)]">{index}</span>
        ) : icon ? (
          <IconChip>{icon}</IconChip>
        ) : <span />}
        <span className="font-accent text-sm text-[var(--ink-faint)] opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100" aria-hidden>→</span>
      </div>
      <div>
        <p className="font-accent font-medium tracking-tight text-[var(--ink)]">{title}</p>
        <p className="mt-1 text-sm leading-relaxed text-[var(--ink-muted)]">{desc}</p>
      </div>
    </Link>
  );
}
