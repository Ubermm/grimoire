//@ts-nocheck
'use client';
// § 05 — Procedure, told as a scroll-driven derivation. Four copy blocks
// scroll past on the left; a pinned panel on the right evolves through four
// stages: the statute → the compiled rule → the asserted evidence → the
// derived verdict. Native scroll only — the page is never hijacked.
// Below lg the four stages render stacked and static; prefers-reduced-motion
// keeps the scroll-driven stage state but swaps instantly (duration 0).
import React, { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import { EASE, Panel } from '@/components/landing/ui';

/* ------------------------------------------------------------ stage figures */

// Underlined statute phrase — the same treatment reappears on the Prolog
// comments in stage ii so the correspondence reads at a glance.
function U({ children }) {
  return <span className="border-b border-white/40 pb-px">{children}</span>;
}

// i. the statute, set in the law's voice
function StageLaw() {
  return (
    <div>
      <p className="font-serif-display text-[1.12rem] leading-[1.75] text-white/85">
        <em>
          &ldquo;Batch production and control records shall be prepared for each batch&hellip;{' '}
          <U>reviewed and approved</U>&hellip; and shall include <U>complete records</U> of, and
          the <U>signature</U> of the person performing, each significant step.&rdquo;
        </em>
      </p>
      <p className="font-plex mt-6 text-[0.7rem] uppercase tracking-[0.18em] text-white/60">
        21 CFR § 211.188 — the source of truth
      </p>
    </div>
  );
}

// ii. the same requirement, compiled — each clause carries the phrase it encodes
const CLAUSES = [
  { term: 'signature(B),', phrase: 'the signature of the person' },
  { term: 'reviewed(B),', phrase: 'reviewed and approved' },
  { term: 'records_complete(B).', phrase: 'complete records' },
];

function StageRule() {
  return (
    <div className="font-plex text-[12.5px] leading-[2] text-white/80">
      <p className="text-white/55">% 21 CFR § 211.188, compiled</p>
      <p className="mt-2">
        <span className="text-white">compliant</span>(B) :-
      </p>
      {CLAUSES.map((c) => (
        <p key={c.term} className="flex flex-wrap items-baseline justify-between gap-x-4 pl-6">
          <span>{c.term}</span>
          <span className="text-[11px] text-white/55">
            % <span className="border-b border-white/25 pb-px">{c.phrase}</span>
          </span>
        </p>
      ))}
      <p className="mt-5 border-t rule pt-4 text-[0.7rem] uppercase tracking-[0.18em] text-white/60">
        one clause per obligation — nothing paraphrased away
      </p>
    </div>
  );
}

// iii. the evidence ledger, then the facts it asserts
const LEDGER = [
  { doc: 'Batch record 42', src: 'QA sign-off' },
  { doc: 'Review log', src: 'QMS export' },
  { doc: 'Record index', src: 'DMS' },
];
const FACTS = ['signature(batch_42).', 'reviewed(batch_42).', 'records_complete(batch_42).'];

function StageEvidence() {
  return (
    <div>
      <div className="divide-y divide-white/[0.09]">
        {LEDGER.map((r) => (
          <div key={r.doc} className="flex flex-wrap items-baseline justify-between gap-x-4 py-2.5">
            <span className="text-sm text-white/80">{r.doc}</span>
            <span className="font-plex text-[11px] text-white/60">{r.src} ✓</span>
          </div>
        ))}
      </div>
      <div className="font-plex mt-5 border-t rule pt-4 text-[12.5px] leading-[1.9] text-white/80">
        <p className="text-white/55">% facts asserted</p>
        {FACTS.map((f) => (
          <p key={f}>
            <span className="text-white/55">→ </span>
            {f}
          </p>
        ))}
      </div>
    </div>
  );
}

// iv. the query, the verdict, and the report it exports
function StageVerdict() {
  return (
    <div className="font-plex text-[12.5px] leading-relaxed text-white/80">
      <p>
        <span className="text-white/55">?- </span>compliant(batch_42).
      </p>
      <p className="mt-2 flex flex-wrap items-baseline justify-between gap-x-4">
        <span>
          true<span className="text-white/55">.</span>{' '}
          <span className="text-emerald-300">⊢ compliant</span>{'  '}
          <span className="text-white/60">∎</span>
        </span>
        <span className="text-[11px] uppercase tracking-[0.14em] text-white/60">
          verdict · proven
        </span>
      </p>
      <div className="mt-6 border-t rule pt-4">
        <p className="text-[0.7rem] uppercase tracking-[0.18em] text-white/60">
          Evidence report — CFR-211-188
        </p>
        <p className="mt-2 text-[0.78rem] text-white/70">
          the clauses that fired · timestamps · exportable{' '}
          <span className="text-white/45" aria-hidden>∎</span>
        </p>
      </div>
    </div>
  );
}

/* ----------------------------------------------------------- the narrative */

const STAGES = [
  {
    numeral: 'i.',
    title: 'Start from the law',
    label: 'the statute',
    body: 'Every audit begins with the regulation itself — the paragraph an inspector would read aloud. Grimoire One treats that text as the source of truth, phrase by phrase.',
    Figure: StageLaw,
  },
  {
    numeral: 'ii.',
    title: 'Compile it into logic',
    label: 'the compiled rule',
    body: 'Each obligation becomes a clause of an executable Prolog rule. The underlined phrases reappear, one to one, as the terms of the program — the law, now machine-checkable.',
    Figure: StageRule,
  },
  {
    numeral: 'iii.',
    title: 'Assert your evidence',
    label: 'the evidence',
    body: 'Your documents become facts. A batch record, a review log, a record index — each is asserted into the program as ground truth. No scoring, no judgment calls.',
    Figure: StageEvidence,
  },
  {
    numeral: 'iv.',
    title: 'Derive the verdict',
    label: 'the verdict',
    body: 'The engine runs the query and the verdict follows — pass, fail, or escalate, with the exact clauses that fired. Every audit exports the derivation as a report an inspector could reproduce.',
    Figure: StageVerdict,
  },
];

function StepCopy({ s, active = true }) {
  return (
    <div className="transition-colors duration-300">
      <p className={`font-serif-display text-2xl italic ${active ? 'text-white/55' : 'text-white/40'}`} aria-hidden>
        {s.numeral}
      </p>
      <h3 className={`font-serif-display mt-3 text-2xl font-medium transition-colors duration-300 ${active ? 'text-white' : 'text-white/50'}`}>
        {s.title}
      </h3>
      <p className={`mt-3 max-w-md text-[0.95rem] leading-relaxed transition-colors duration-300 ${active ? 'text-white/70' : 'text-white/40'}`}>
        {s.body}
      </p>
    </div>
  );
}

function PanelHeader({ label, index }) {
  return (
    <div className="flex items-center justify-between border-b rule px-5 py-3">
      <span className="font-plex text-[0.7rem] uppercase tracking-[0.22em] text-emerald-300/90">{label}</span>
      <span className="font-plex text-[0.7rem] text-emerald-300/50">
        <span className="text-emerald-300">0{index + 1}</span> / 04
      </span>
    </div>
  );
}

/* -------------------------------------------------------------- component */

export default function ScrollStory() {
  const reduce = useReducedMotion();
  const trackRef = useRef(null);
  const [stage, setStage] = useState(0);

  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ['start 0.6', 'end 0.65'],
  });
  const progressScale = useTransform(scrollYProgress, [0, 1], [0, 1]);

  useEffect(() => {
    const unsubscribe = scrollYProgress.on('change', (v) =>
      setStage(Math.min(3, Math.floor(v * 4))),
    );
    return unsubscribe;
  }, [scrollYProgress]);

  return (
    <div>
      {/* The argument, for screen readers — the panel below merely illustrates it. */}
      <p className="sr-only">
        Four stages: first, the statute — 21 CFR § 211.188 requires reviewed and approved batch
        records, complete records, and the signature of the person performing each step. Second,
        that requirement is compiled into an executable Prolog rule, one clause per obligation.
        Third, your evidence — batch record, review log, record index — is asserted as facts.
        Fourth, the engine derives the verdict, compliant, and exports the derivation as an
        evidence report with the clauses that fired and timestamps.
      </p>

      {/* ------------------------------------------ desktop: pinned derivation */}
      <div ref={trackRef} className="relative hidden min-h-[320vh] lg:grid lg:grid-cols-2 lg:gap-16">
        {/* left — the four steps scroll past */}
        <div>
          {STAGES.map((s, i) => (
            <div key={s.title} className="flex min-h-[75vh] items-center">
              <StepCopy s={s} active={i === stage} />
            </div>
          ))}
        </div>

        {/* right — the pinned figure */}
        <div>
          <div className="sticky top-28" aria-hidden>
            <Panel className="relative">
              {/* progress hairline — fills the panel's left edge as the proof unfolds */}
              <div className="absolute bottom-0 left-0 top-0 w-px bg-white/15">
                <motion.div
                  style={{
                    scaleY: progressScale,
                    backgroundImage: 'linear-gradient(180deg, #34d399, #2dd4bf)',
                  }}
                  className="h-full w-full origin-top"
                />
              </div>

              <PanelHeader label={STAGES[stage].label} index={stage} />

              <div className="relative min-h-[24rem]">
                {STAGES.map((s, i) => (
                  <motion.div
                    key={s.title}
                    initial={false}
                    animate={i === stage ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                    transition={{ duration: reduce ? 0 : 0.45, ease: EASE }}
                    className={`absolute inset-0 p-6 ${i === stage ? '' : 'pointer-events-none'}`}
                  >
                    <s.Figure />
                  </motion.div>
                ))}
              </div>
            </Panel>
          </div>
        </div>
      </div>

      {/* ------------------------------------ mobile: stacked, static, complete */}
      <div className="space-y-16 lg:hidden">
        {STAGES.map((s, i) => (
          <div key={s.title}>
            <StepCopy s={s} />
            <Panel className="mt-6">
              <PanelHeader label={s.label} index={i} />
              <div className="p-5">
                <s.Figure />
              </div>
            </Panel>
          </div>
        ))}
      </div>
    </div>
  );
}
