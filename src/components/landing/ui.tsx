'use client';
// Shared marketing primitives — an editorial, scholarly-press language on an
// ink-black canvas. Two voices: Newsreader serif (the law) and IBM Plex Mono
// (the engine). Structure comes from hairline rules and statute numbering
// (§ 01, § 02 …), not card chrome; markers come from proof notation (⊢ ∴ ∎),
// not icon packs. Used by the landing + marketing pages.
import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { motion, useInView } from 'framer-motion';
import { cn } from '@/lib/utils';

export const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export function MarketingPage({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('bg-[#0b0a09] text-[#e8e6e1] selection:bg-[#e8e6e1] selection:text-[#0b0a09]', className)}>
      {children}
    </div>
  );
}

export function Reveal({ children, delay = 0, className = '' }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.7, delay, ease: EASE }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function Counter({ to, suffix = '', prefix = '', duration = 1.4 }: any) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!inView) return;
    let raf: number;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / (duration * 1000));
      setVal(Math.round(to * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, to, duration]);
  return <span ref={ref}>{prefix}{val.toLocaleString()}{suffix}</span>;
}

/* ------------------------------------------------------------ typography */

// Mono meta label — small caps, wide tracking. The engine's voice.
export function Eyebrow({ children, className }: any) {
  return <p className={cn('font-plex text-[0.7rem] uppercase tracking-[0.22em] text-white/60', className)}>{children}</p>;
}

// Statute-style section opener: a full-width hairline, then "§ 02 · Title"
// on the left and an optional aside on the right. Replaces centered eyebrows.
export function SectionRule({ n, title, aside, className }: { n: string; title: string; aside?: string; className?: string }) {
  return (
    <div className={cn('border-t rule pt-4', className)}>
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
        <p className="font-plex text-[0.7rem] uppercase tracking-[0.22em] text-white/60">
          <span className="text-white/75">§ {n}</span>
          <span className="mx-2 text-white/20">·</span>
          {title}
        </p>
        {aside && <p className="font-plex text-[0.7rem] tracking-[0.08em] text-white/50">{aside}</p>}
      </div>
    </div>
  );
}

// Serif display heading. The law's voice — set tight, never bolded past 500.
export function SerifTitle({ children, className }: any) {
  return (
    <h2 className={cn('font-serif-display text-[1.75rem] font-medium leading-[1.12] tracking-[-0.01em] text-white sm:text-[2.4rem]', className)}>
      {children}
    </h2>
  );
}

// Back-compat heading used by older pages; now serif + left-aligned by default.
export function SectionHeading({ eyebrow, title, lead, center = false }: any) {
  return (
    <div className={cn('max-w-2xl', center && 'mx-auto text-center')}>
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
      <SerifTitle className="mt-3">{title}</SerifTitle>
      {lead && <p className="mt-4 text-[0.97rem] leading-relaxed text-white/70">{lead}</p>}
    </div>
  );
}

/* ----------------------------------------------------------- proof marks */

// ⊢ list — "it is provable that …". Replaces checkmark bullets.
export function ProvesItem({ children }: any) {
  return (
    <li className="flex items-start gap-3 text-sm leading-relaxed text-white/70">
      <span className="font-plex mt-px select-none text-white/45" aria-hidden>⊢</span>
      <span>{children}</span>
    </li>
  );
}

// ∎ — end of proof. Closes a thesis or a section the way QED closes an argument.
export function QED({ className }: { className?: string }) {
  return <span className={cn('font-plex select-none text-white/40', className)} aria-hidden>∎</span>;
}

// Footnote reference (superscript) + the note itself, set under a short rule.
export function FnRef({ n }: { n: number | string }) {
  return <sup className="fn-ref font-plex ml-0.5 text-[0.65em]">{n}</sup>;
}
export function Footnote({ n, children, className }: any) {
  return (
    <p className={cn('flex gap-2.5 text-[0.8rem] leading-relaxed text-white/60', className)}>
      <span className="font-plex shrink-0 text-[0.7rem]">{n}.</span>
      <span>{children}</span>
    </p>
  );
}

/* -------------------------------------------------------------- surfaces */

// Ruled panel — square corners, hairline border, paper-flat. No glass, no blur.
export function Panel({ className, children }: any) {
  return <div className={cn('border rule bg-white/[0.015]', className)}>{children}</div>;
}

// Kept for back-compat; the editorial surface wants ink, not bloom.
export function Glow({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'pointer-events-none absolute rounded-full bg-[radial-gradient(circle,rgba(190,186,178,0.05),transparent_70%)]',
        className,
      )}
    />
  );
}

/* ------------------------------------------------------------------ CTAs */

export function PrimaryCTA({ href, children, className }: any) {
  return (
    <Link
      href={href}
      className={cn(
        'font-plex inline-flex items-center justify-center gap-2 border border-[#e8e6e1] bg-[#e8e6e1] px-5 py-2.5 text-[0.8rem] font-medium uppercase tracking-[0.12em] text-[#0b0a09] transition-colors hover:bg-transparent hover:text-[#e8e6e1]',
        className,
      )}
    >
      {children}
    </Link>
  );
}

export function SecondaryCTA({ href, children, className }: any) {
  return (
    <Link
      href={href}
      className={cn(
        'font-plex inline-flex items-center justify-center gap-2 border rule px-5 py-2.5 text-[0.8rem] font-medium uppercase tracking-[0.12em] text-white/75 transition-colors hover:border-white/40 hover:text-white',
        className,
      )}
    >
      {children}
    </Link>
  );
}

// Quiet inline link — underlined like a citation, never a button.
export function TextLink({ href, children, className }: any) {
  return (
    <Link
      href={href}
      className={cn(
        'font-plex inline-flex items-baseline gap-1.5 text-[0.8rem] uppercase tracking-[0.12em] text-white/70 underline decoration-white/25 underline-offset-4 transition-colors hover:text-white hover:decoration-white/60',
        className,
      )}
    >
      {children}
    </Link>
  );
}
