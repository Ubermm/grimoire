'use client';
// Shared dark marketing primitives — a refined graphite/grey aesthetic
// (Scale.ai-flavoured): near-black charcoal canvas, hairline white borders,
// monochrome accents, IBM Plex Mono labels. Used by the landing + marketing pages.
import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { motion, useInView } from 'framer-motion';
import { cn } from '@/lib/utils';

export const EASE = [0.22, 1, 0.36, 1];

export function MarketingPage({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('bg-[#09090b] text-white', className)}>{children}</div>;
}

export function Reveal({ children, delay = 0, className = '' }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.6, delay, ease: EASE }}
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

export function Eyebrow({ children, className }: any) {
  return <p className={cn('font-plex text-xs uppercase tracking-[0.18em] text-zinc-500', className)}>{children}</p>;
}

export function SectionHeading({ eyebrow, title, lead, center = true }: any) {
  return (
    <div className={cn('max-w-2xl', center && 'mx-auto text-center')}>
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
      <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white sm:text-[2rem] sm:leading-[1.1]">{title}</h2>
      {lead && <p className="mt-4 text-[0.97rem] leading-relaxed text-white/55">{lead}</p>}
    </div>
  );
}

export function Panel({ className, children }: any) {
  return <div className={cn('rounded-2xl border border-white/10 bg-white/[0.025]', className)}>{children}</div>;
}

export function Glow({ className }: { className?: string }) {
  return <div className={cn('hero-glow pointer-events-none absolute rounded-full bg-[radial-gradient(circle,rgba(168,168,170,0.14),rgba(92,92,94,0.05)_45%,transparent_72%)] blur-2xl', className)} />;
}

export function PrimaryCTA({ href, children, className }: any) {
  return (
    <Link href={href} className={cn('font-plex inline-flex items-center justify-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-medium text-black transition-transform hover:scale-[1.02]', className)}>
      {children}
    </Link>
  );
}

export function SecondaryCTA({ href, children, className }: any) {
  return (
    <Link href={href} className={cn('font-plex inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-5 py-2.5 text-sm font-medium text-white backdrop-blur transition-colors hover:bg-white/[0.08]', className)}>
      {children}
    </Link>
  );
}
