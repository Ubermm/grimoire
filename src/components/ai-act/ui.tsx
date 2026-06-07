'use client';
// Thin OpenAI-style presentational primitives, scoped to the /ai-act module.
// Neutral palette, generous spacing, single teal accent (#10A37F).
import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export const ACCENT = '#10A37F';

export function Surface({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn('rounded-xl border border-neutral-200 bg-white shadow-sm', className)}>{children}</div>;
}

export function AccentButton({ className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg bg-[#10A37F] px-4 py-2 text-sm font-medium text-white',
        'transition-colors hover:bg-[#0e906f] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#10A37F]/40',
        'disabled:cursor-not-allowed disabled:opacity-50',
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
        'inline-flex items-center justify-center gap-2 rounded-lg border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-700',
        'transition-colors hover:bg-neutral-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-300',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      {...props}
    />
  );
}

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-8 flex items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 md:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1.5 max-w-2xl text-sm text-neutral-500">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function Spinner({ className }: { className?: string }) {
  return <Loader2 className={cn('h-4 w-4 animate-spin', className)} />;
}

export function EmptyState({ title, hint, action }: { title: string; hint?: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-neutral-200 bg-neutral-50/50 px-6 py-16 text-center">
      <p className="text-sm font-medium text-neutral-700">{title}</p>
      {hint && <p className="mt-1 max-w-sm text-sm text-neutral-400">{hint}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

// Clickable entry card used on the hub and dashboards.
export function EntryCard({ href, icon, title, desc }: { href: string; icon: React.ReactNode; title: string; desc: string }) {
  return (
    <Link
      href={href}
      className="group flex flex-col gap-3 rounded-xl border border-neutral-200 bg-white p-5 shadow-sm transition-all hover:border-neutral-300 hover:shadow-md"
    >
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#10A37F]/10 text-[#10A37F]">{icon}</div>
      <div>
        <p className="font-medium text-neutral-900">{title}</p>
        <p className="mt-1 text-sm text-neutral-500">{desc}</p>
      </div>
    </Link>
  );
}
