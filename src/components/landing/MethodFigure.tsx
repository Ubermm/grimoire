//@ts-nocheck
'use client';
// fig. 1 — the method, animated as a chalkboard derivation. Evidence is
// asserted as facts, the compiled rule consumes them term by term, the query
// runs, and the verdict stamps with ∎. Loops; prefers-reduced-motion gets the
// finished proof, static.
import React, { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { EASE, Panel } from '@/components/landing/ui';

// Steps: 0 idle · 1–3 facts asserted · 4 rule appears · 5–7 terms satisfied ·
// 8 query · 9 verdict (hold, then loop). Durations are how long each step holds.
const STEP_MS = [500, 700, 700, 800, 700, 520, 520, 620, 900, 3600];
const LAST = STEP_MS.length - 1;

const FACTS = [
  { head: 'signature', src: 'QA sign-off' },
  { head: 'training_log', src: 'LMS export' },
  { head: 'audit_trail', src: 'system log' },
];

function Line({ on, children, className = '' }) {
  return (
    <motion.div
      initial={false}
      animate={on ? { opacity: 1, y: 0 } : { opacity: 0, y: 5 }}
      transition={{ duration: 0.45, ease: EASE }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function MethodFigure() {
  const reduce = useReducedMotion();
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (reduce) {
      setStep(LAST);
      return;
    }
    const t = setTimeout(() => setStep((s) => (s + 1) % STEP_MS.length), STEP_MS[step]);
    return () => clearTimeout(t);
  }, [step, reduce]);

  const stage = step >= 8 ? 'verdict' : step >= 4 ? 'rules' : 'evidence';

  return (
    <figure>
      <Panel>
        <div className="flex items-center justify-between border-b rule px-4 py-2.5">
          <span className="font-plex text-[0.7rem] uppercase tracking-[0.16em] text-emerald-300/90">derivation — batch_42</span>
          <span className={`font-plex text-[0.7rem] ${step >= LAST ? 'text-emerald-300' : 'text-white/45'}`} aria-hidden>
            {step >= LAST ? 'Q.E.D.' : 'fig. 1'}
          </span>
        </div>

        {/* Screen readers get the finished argument, not the choreography. */}
        <p className="sr-only">
          Evidence documents are asserted as Prolog facts; the regulation, compiled as a rule,
          is satisfied term by term; the engine derives that the batch is compliant.
        </p>

        <div aria-hidden className="font-plex p-5 text-[12.5px] leading-relaxed text-white/75">
          {/* 1 — evidence, asserted as facts */}
          <p className="text-white/55">% evidence, asserted as facts</p>
          {FACTS.map((f, i) => (
            <Line key={f.head} on={step >= i + 1} className="flex flex-wrap items-baseline justify-between gap-x-4">
              <span>
                <span className="text-white/55">→ </span>
                <span className={step >= i + 5 ? 'text-white' : 'text-white/75'}>{f.head}</span>(batch_42).
              </span>
              <span className="shrink-0 text-[11px] text-white/45">{f.src} ✓</span>
            </Line>
          ))}

          {/* 2 — the regulation, compiled */}
          <Line on={step >= 4}>
            <p className="mt-4 text-white/55">% the regulation, compiled</p>
            <p><span className="text-white">compliant</span>(B) :-</p>
            {FACTS.map((f, i) => (
              <p key={f.head} className="pl-6">
                <span className={`transition-colors duration-300 ${step >= i + 5 ? 'text-white' : 'text-white/45'}`}>
                  {f.head}(B)
                </span>
                {i < FACTS.length - 1 ? ',' : '.'}
                {step >= i + 5 && <span className="ml-3 text-[11px] text-emerald-300/90">✓ fact found</span>}
              </p>
            ))}
          </Line>

          {/* 3 — the query and its verdict */}
          <Line on={step >= 8} className="mt-4">
            <span className="text-white/55">?- </span>compliant(batch_42).
          </Line>
          <Line on={step >= LAST} className="flex flex-wrap items-baseline justify-between gap-x-4">
            <span>
              true<span className="text-white/55">.</span>{' '}
              <span className="text-emerald-300">⊢ compliant</span>{'  '}
              <span className="text-white/60">∎</span>
            </span>
            <span className="shrink-0 text-[11px] uppercase tracking-[0.14em] text-white/60">verdict · proven</span>
          </Line>
        </div>
      </Panel>

      {/* the pipeline, restated — the active stage carries the underline */}
      <figcaption className="mt-4 flex flex-wrap items-baseline gap-3 font-plex text-[0.7rem] uppercase tracking-[0.18em]">
        {[
          ['evidence', 'evidence'],
          ['rules', 'rules'],
          ['verdict', 'verdict'],
        ].map(([key, label], i) => (
          <React.Fragment key={key}>
            {i > 0 && <span className="text-white/45" aria-hidden>{i === 2 ? '⊢' : '→'}</span>}
            <span
              className={`border-b pb-1 transition-colors duration-300 ${
                stage === key ? 'border-emerald-300/80 text-emerald-300' : 'border-transparent text-white/55'
              }`}
            >
              {label}
            </span>
          </React.Fragment>
        ))}
      </figcaption>
    </figure>
  );
}
