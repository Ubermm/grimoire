'use client';
// Platform-style presentational primitives, shared across the Grimoire One product
// modules (FDA Audit + EU AI Act). Near-monochrome palette, generous spacing,
// near-black primary action, IBM Plex Mono accents (.font-accent / headings).
// Colour + font tokens (--acc, --ink, --line, --font-accent, …) live in
// src/styles/module-theme.css under .module-theme.
import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Loader2, ArrowUpRight } from 'lucide-react';

export const ACCENT = '#0d0d0d';

/* ----------------------------------------------------------------- surfaces */

export function Surface({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-[var(--line)] bg-[var(--surface)] shadow-[0_1px_2px_rgba(0,0,0,0.04)]',
        className
      )}
    >
      {children}
    </div>
  );
}

// Titled surface — a card with an optional header row + subtitle.
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
            {title && <p className="font-accent text-sm font-semibold tracking-tight text-[var(--ink)]">{title}</p>}
            {subtitle && <p className="mt-0.5 text-sm text-[var(--ink-muted)]">{subtitle}</p>}
          </div>
          {action}
        </div>
      )}
      <div className={cn('p-6', bodyClassName)}>{children}</div>
    </Surface>
  );
}

/* ------------------------------------------------------------------ buttons */

export function AccentButton({ className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        'font-accent inline-flex items-center justify-center gap-2 rounded-full bg-[var(--acc)] px-4 py-2 text-sm font-medium text-[var(--acc-contrast)]',
        'transition-[background-color,transform] hover:bg-[var(--acc-hover)] active:scale-[0.98]',
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
        'font-accent inline-flex items-center justify-center gap-2 rounded-full border border-[var(--line-strong)] bg-[var(--surface)] px-4 py-2 text-sm font-medium text-[var(--ink-muted)]',
        'transition-colors hover:bg-black/[0.03] hover:text-[var(--ink)]',
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
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow && (
          <p className="font-accent mb-2 text-xs font-medium uppercase tracking-[0.14em] text-[var(--ink-faint)]">{eyebrow}</p>
        )}
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--ink)] md:text-[2rem] md:leading-[1.1]">
          {title}
        </h1>
        {subtitle && <p className="mt-2 max-w-2xl text-[0.95rem] leading-relaxed text-[var(--ink-muted)]">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
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
        'font-accent inline-flex items-center rounded-full border border-[var(--line-strong)] bg-[var(--acc-soft)] px-2.5 py-0.5 text-xs font-medium text-[var(--ink-muted)]',
        className
      )}
    >
      {children}
    </span>
  );
}

export function EmptyState({ title, hint, action }: { title: string; hint?: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--line-strong)] bg-black/[0.015] px-6 py-16 text-center">
      <p className="text-sm font-medium text-[var(--ink)]">{title}</p>
      {hint && <p className="mt-1.5 max-w-sm text-sm text-[var(--ink-faint)]">{hint}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

/* ------------------------------------------------------------------- icons */

// Cohesive icon container — a soft accent square with a hairline ring. Used for
// decorative iconography across docs / analytics / hub cards.
export function IconChip({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <span
      className={cn(
        'inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--acc-soft)] text-[var(--ink)] ring-1 ring-inset ring-[var(--line)]',
        className
      )}
    >
      {children}
    </span>
  );
}

/* --------------------------------------------------------------- nav cards */

// Clickable entry card used on the hub and dashboards.
export function EntryCard({
  href,
  icon,
  title,
  desc,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <Link
      href={href}
      className="group relative flex flex-col gap-4 overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-all hover:-translate-y-0.5 hover:border-[var(--line-strong)] hover:shadow-[0_8px_24px_-12px_rgba(0,0,0,0.18)]"
    >
      <div className="flex items-center justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--acc-soft)] text-[var(--ink)] ring-1 ring-inset ring-[var(--line)] transition-colors group-hover:bg-[var(--acc)] group-hover:text-[var(--acc-contrast)]">
          {icon}
        </div>
        <ArrowUpRight className="h-4 w-4 text-[var(--ink-faint)] opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100" />
      </div>
      <div>
        <p className="font-accent font-medium tracking-tight text-[var(--ink)]">{title}</p>
        <p className="mt-1 text-sm leading-relaxed text-[var(--ink-muted)]">{desc}</p>
      </div>
    </Link>
  );
}
