'use client';
// Reading-progress hairline for docs articles — editorial marginalia, not a
// feature banner. A 2px track in var(--line) under the DocHero rule carries an
// ink fill whose scaleX is scroll-linked to the article column; a mono
// eyebrow / "nn %" pair sits above it. Sticky below the fixed navbar on a
// canvas strip. Hidden (height still reserved — no layout shift) when the
// article is shorter than ~1.5 viewport heights. prefers-reduced-motion drops
// the spring and binds the raw motion value; there is no autonomous animation.
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { motion, useReducedMotion, useScroll, useSpring } from 'framer-motion';
import { cn } from '@/lib/utils';

// Client components still server-render in Next; swap to useEffect on the server.
const useIsoLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export function DocReadingProgress({ eyebrow }: { eyebrow?: string }) {
  const stripRef = useRef<HTMLDivElement>(null);
  const articleRef = useRef<HTMLElement | null>(null);
  const [pct, setPct] = useState(0);
  const [longEnough, setLongEnough] = useState(true);
  const reduced = useReducedMotion();

  // Resolve the article container (the docs layout's content column) before
  // useScroll measures — layout effects run ahead of framer-motion's setup.
  useIsoLayoutEffect(() => {
    const el = stripRef.current;
    if (!el) return;
    articleRef.current =
      (el.closest('[data-doc-article]') as HTMLElement | null) ?? el.parentElement;
  }, []);

  const { scrollYProgress } = useScroll({
    target: articleRef,
    offset: ['start start', 'end end'],
  });
  const smoothed = useSpring(scrollYProgress, { stiffness: 220, damping: 34, restDelta: 0.001 });

  // Live "nn %" readout — subscribe rather than re-rendering per frame elsewhere.
  useEffect(() => {
    const toPct = (v: number) => Math.min(100, Math.max(0, Math.round(v * 100)));
    setPct(toPct(scrollYProgress.get()));
    return scrollYProgress.on('change', (v) => setPct(toPct(v)));
  }, [scrollYProgress]);

  // Short-article guard: nothing to track if the piece fits in ~1.5 viewports.
  useEffect(() => {
    const el = articleRef.current;
    if (!el) return;
    const measure = () => setLongEnough(el.scrollHeight > window.innerHeight * 1.5);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener('resize', measure);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, []);

  return (
    <div
      ref={stripRef}
      aria-hidden
      className={cn(
        // top-16 clears the fixed global navbar (~4rem); canvas backs the strip
        // so article text scrolling beneath it is not visible through it.
        'sticky top-16 z-30 bg-[var(--canvas)]',
        !longEnough && 'invisible'
      )}
    >
      <div className="flex items-baseline justify-between pb-1.5 pt-2">
        <span className="font-accent text-[0.65rem] uppercase tracking-[0.18em] text-[var(--ink-muted)]">
          {eyebrow}
        </span>
        <span className="font-accent text-[0.65rem] uppercase tracking-[0.18em] tabular-nums text-[#047857]">
          {pct} %{pct >= 100 && <span aria-hidden>&ensp;∎</span>}
        </span>
      </div>
      <div className="h-[2px] w-full bg-[var(--line)]">
        <motion.div
          className="h-full w-full origin-left"
          style={{
            scaleX: reduced ? scrollYProgress : smoothed,
            backgroundImage: 'linear-gradient(90deg, #047857, #0d9488)',
          }}
        />
      </div>
    </div>
  );
}
