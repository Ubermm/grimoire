//@ts-nocheck
'use client';
// The landing page, set like a working paper: a serif argument (Newsreader),
// mono apparatus (Plex), statute-numbered sections, hairline rules, footnotes,
// and proof notation (⊢ ∴ ∎) in place of icon-pack decoration.
import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  MarketingPage, Reveal, Counter, SectionRule, SerifTitle, ProvesItem, QED,
  FnRef, Footnote, Panel, PrimaryCTA, SecondaryCTA, TextLink, EASE,
} from '@/components/landing/ui';
import MethodFigure from '@/components/landing/MethodFigure';
import ScrollStory from '@/components/landing/ScrollStory';

const FRAMEWORKS = ['FDA 21 CFR', 'EU AI Act 2024/1689', 'GxP', 'ISO/IEC 42001', '21 CFR Part 11'];

const REGS = [
  {
    n: '01', href: '/audit', title: 'FDA Title 21', sub: 'Code of Federal Regulations',
    desc: 'Title 21 audits, warning-letter analysis and Prolog validation — proven, not claimed.',
    cta: 'Start an audit',
  },
  {
    n: '02', href: '/ai-act', title: 'EU AI Act', sub: 'Regulation (EU) 2024/1689',
    desc: 'Risk classification, Article 5 & 50 screening, GPAI obligations and Annex IV documentation.',
    cta: 'Classify a system',
  },
];

const FAQ = [
  { q: 'How is this different from a compliance checklist?', a: 'Checklists record opinions. Grimoire One compiles the regulation into a Prolog program and derives a verdict from your evidence — every pass or fail is backed by the exact rules that fired.' },
  { q: 'Which regulations are supported?', a: 'FDA Title 21 CFR (audits, Part 11, warning-letter analysis) and the EU AI Act (Regulation 2024/1689) today, with a shared engine designed to take on more.' },
  { q: 'Can I export evidence for an auditor?', a: 'Yes. Every classification and audit produces a report containing the verdict, its basis, the underlying Prolog, and timestamps — ready to hand over.' },
  { q: 'Do I have to write Prolog?', a: 'No. You answer plain-language screening forms (and can autofill them from documents). The logic runs underneath.' },
];

export default function HomePage() {
  return (
    <MarketingPage>
      {/* ============================================================== Hero */}
      <section className="relative overflow-hidden">
        <div className="paper-rules pointer-events-none absolute inset-0" aria-hidden />

        <div className="relative mx-auto max-w-6xl px-6 pb-20 pt-20 sm:pt-28">
          {/* running head */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, ease: EASE }}
            className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 border-b rule pb-4"
          >
            <p className="font-plex text-[0.7rem] uppercase tracking-[0.22em] text-white/60">Grimoire One — a compliance engine</p>
            <p className="font-plex hidden text-[0.7rem] tracking-[0.08em] text-white/50 sm:block" aria-hidden>evidence ⊢ verdict</p>
          </motion.div>

          <div className="mt-14 grid gap-12 lg:grid-cols-12 lg:gap-8">
            {/* the claim */}
            <div className="lg:col-span-8">
              <motion.h1
                initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.05, ease: EASE }}
                className="font-serif-display text-[2.9rem] font-medium leading-[1.04] tracking-[-0.015em] text-white sm:text-[4.4rem]"
              >
                Prove compliance.
                <br />
                <em className="font-normal text-white/85">Don&apos;t just claim it.</em>
              </motion.h1>

              <motion.div
                initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.18, ease: EASE }}
                className="mt-10 flex flex-wrap items-center gap-4"
              >
                <PrimaryCTA href="/audit">Start an audit →</PrimaryCTA>
                <SecondaryCTA href="/ai-act">EU AI Act</SecondaryCTA>
                <TextLink href="/docs">Read the docs</TextLink>
              </motion.div>
            </div>

            {/* the abstract, set like a paper's front matter */}
            <motion.aside
              initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.26, ease: EASE }}
              className="self-end lg:col-span-4"
            >
              <div className="border-l rule pl-5">
                <p className="font-plex text-[0.7rem] uppercase tracking-[0.22em] text-white/60">Abstract</p>
                <p className="mt-3 text-[0.92rem] leading-relaxed text-white/70">
                  Grimoire One compiles regulations into executable logic and validates evidence
                  against them — turning FDA 21 CFR and the EU AI Act into derivable, auditable
                  verdicts. A pass is a theorem; the report is its proof. <QED />
                </p>
              </div>
            </motion.aside>
          </div>

          {/* coverage index */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.38, ease: EASE }}
            className="mt-16 flex flex-wrap items-baseline gap-x-3 gap-y-2 border-t rule pt-4"
          >
            <span className="font-plex text-[0.7rem] uppercase tracking-[0.22em] text-white/55">Coverage</span>
            {FRAMEWORKS.map((f, i) => (
              <span key={f} className="font-plex text-[0.78rem] text-white/70">
                {f}{i < FRAMEWORKS.length - 1 && <span className="ml-3 text-white/20" aria-hidden>·</span>}
              </span>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ================================================ § 01 — Regulations */}
      <section className="py-20">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal><SectionRule n="01" title="The regulations" aside="two frameworks, one engine" /></Reveal>

          <div className="mt-2 divide-y divide-white/[0.09]">
            {REGS.map((r, i) => (
              <Reveal key={r.href} delay={i * 0.07}>
                <Link href={r.href} className="group grid gap-3 py-9 transition-colors sm:grid-cols-12 sm:items-baseline sm:gap-6">
                  <span className="font-plex text-[0.78rem] text-white/50 sm:col-span-1">{r.n}</span>
                  <div className="sm:col-span-4">
                    <h3 className="font-serif-display text-[1.7rem] font-medium leading-tight text-white transition-colors group-hover:text-white/80 sm:text-[2rem]">
                      {r.title}
                    </h3>
                    <p className="font-plex mt-1 text-[0.7rem] uppercase tracking-[0.14em] text-white/55">{r.sub}</p>
                  </div>
                  <p className="text-sm leading-relaxed text-white/70 sm:col-span-5">{r.desc}</p>
                  <span className="font-plex text-[0.75rem] uppercase tracking-[0.12em] text-white/70 transition-colors group-hover:text-white sm:col-span-2 sm:text-right">
                    {r.cta} <span className="inline-block transition-transform group-hover:translate-x-1" aria-hidden>→</span>
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===================================================== § 02 — Method */}
      <section className="py-20">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal><SectionRule n="02" title="Method" aside="the law, as a program" /></Reveal>

          <div className="mt-12 grid items-start gap-12 lg:grid-cols-2">
            <Reveal>
              <SerifTitle>Every requirement becomes a rule; every answer, a fact.</SerifTitle>
              <p className="mt-5 max-w-xl text-[0.95rem] leading-relaxed text-white/70">
                Regulatory text is compiled into Prolog. Your evidence asserts the facts, and the
                engine <em className="font-serif-display text-white/85">derives</em> the verdict —
                deterministic, repeatable, and impossible to fudge.
              </p>
              <ul className="mt-7 space-y-3">
                <ProvesItem>Deterministic pass / fail / escalate — never a confidence score</ProvesItem>
                <ProvesItem>Every verdict cites the exact rules that fired</ProvesItem>
                <ProvesItem>Re-run any time; the derivation is identical</ProvesItem>
              </ul>
            </Reveal>

            <Reveal delay={0.1}>
              <MethodFigure />
            </Reveal>
          </div>
        </div>
      </section>

      {/* =================================================== § 03 — Evidence */}
      <section className="py-20">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal><SectionRule n="03" title="Evidence" aside="proof, not promises" /></Reveal>

          <div className="mt-12 grid items-start gap-12 lg:grid-cols-2">
            <Reveal className="lg:order-2">
              <SerifTitle>Hand an auditor the derivation, not a deck.</SerifTitle>
              <p className="mt-5 max-w-xl text-[0.95rem] leading-relaxed text-white/70">
                Each audit and classification produces a report: the verdict, its basis, the
                underlying logic, and timestamps.<FnRef n={1} /> Export it and move on.
              </p>
              <div className="mt-7 space-y-2 border-t rule pt-5">
                {['Classification basis', 'Validation results', 'Annex IV sections', 'The Prolog itself'].map((t, i) => (
                  <p key={t} className="font-plex text-[0.78rem] text-white/70">
                    <span className="mr-3 text-white/50">{String(i + 1).padStart(2, '0')}</span>{t}
                  </p>
                ))}
              </div>
            </Reveal>

            <Reveal delay={0.1} className="lg:order-1">
              <Panel>
                <div className="flex items-center justify-between border-b rule px-5 py-3">
                  <span className="font-plex text-[0.7rem] uppercase tracking-[0.16em] text-white/60">Evidence report</span>
                  <span className="font-plex text-xs text-white/50">ACT-7F3A</span>
                </div>

                <div className="px-5 pt-4">
                  <p className="font-serif-display text-lg text-white/90">ACME Hiring Model v2.3</p>
                  <p className="font-plex mt-0.5 text-xs text-white/60">high-risk · Reg (EU) 2024/1689</p>
                </div>

                <div className="mt-4 border-t rule">
                  {[
                    ['Article 5', 'Prohibited practices', 'clear'],
                    ['Annex III(4)', 'Employment use', 'identified'],
                    ['Annex IV', 'Technical file', '9 / 9'],
                    ['Article 50', 'Transparency', 'disclosed'],
                  ].map(([ref, label, val]) => (
                    <div key={ref} className="flex items-center justify-between gap-4 border-b rule px-5 py-2.5 last:border-b-0">
                      <div className="flex min-w-0 items-baseline gap-3">
                        <span className="font-plex w-[5.5rem] shrink-0 text-xs text-white/60">{ref}</span>
                        <span className="truncate text-sm text-white/70">{label}</span>
                      </div>
                      <span className="font-plex text-xs text-white/80">{val}</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between border-t rule px-5 py-3">
                  <span className="font-plex text-[0.7rem] text-white/50">Derived by the Prolog engine</span>
                  <QED className="text-[0.7rem]" />
                </div>
              </Panel>
            </Reveal>
          </div>

          <Reveal delay={0.12}>
            <div className="mt-14 max-w-xl border-t rule pt-4">
              <Footnote n={1}>
                The report records which clauses fired and in what order — the same derivation an
                inspector could reproduce by running the program themselves.
              </Footnote>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ================================================== § 04 — In numbers */}
      <section className="py-20">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal><SectionRule n="04" title="In numbers" /></Reveal>
          <div className="mt-2 grid divide-y divide-white/[0.09] sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            {[
              { to: 3000, suffix: '+', label: 'FDA warning letters analyzed' },
              { to: 50, suffix: '+', label: 'Regulatory citations per letter' },
              { to: 100, suffix: '%', label: 'Title 21 CFR section coverage' },
            ].map((s, i) => (
              <Reveal key={s.label} delay={i * 0.07} className="py-8 sm:px-8 sm:first:pl-0 sm:last:pr-0">
                <p className="font-serif-display serif-oldstyle-nums text-5xl font-medium tracking-tight text-white sm:text-6xl">
                  <Counter to={s.to} suffix={s.suffix} />
                </p>
                <p className="font-plex mt-3 text-[0.72rem] uppercase tracking-[0.14em] text-white/60">{s.label}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* =================================================== § 05 — Procedure */}
      <section className="py-20">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal><SectionRule n="05" title="Procedure" aside="scroll — the derivation unfolds" /></Reveal>
          <div className="mt-12">
            <ScrollStory />
          </div>
          <Reveal delay={0.2}>
            <p className="font-plex mt-12 text-[0.78rem] text-white/55">
              <span className="text-white/70" aria-hidden>∴</span>&ensp;the verdict follows from the evidence — not from anyone&apos;s say-so.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ====================================================== Thesis block */}
      <section className="py-24">
        <Reveal className="mx-auto max-w-3xl px-6">
          <blockquote className="border-l rule pl-7 sm:pl-9">
            <p className="font-serif-display text-[1.6rem] font-normal italic leading-snug text-white/90 sm:text-[2rem]">
              Sampling tells you what you checked. Formal verification tells you what&apos;s
              true — across every requirement, every time. <QED className="not-italic" />
            </p>
            <footer className="font-plex mt-6 text-[0.7rem] uppercase tracking-[0.18em] text-white/60">
              — The Grimoire One thesis
            </footer>
          </blockquote>
        </Reveal>
      </section>

      {/* =================================================== § 06 — Questions */}
      <section className="py-20">
        <div className="mx-auto max-w-3xl px-6">
          <Reveal><SectionRule n="06" title="Questions" /></Reveal>
          <div className="mt-2 divide-y divide-white/[0.09]">
            {FAQ.map((f, i) => (
              <Reveal key={f.q} delay={i * 0.04}>
                <details className="group py-6">
                  <summary className="flex cursor-pointer list-none items-baseline justify-between gap-6">
                    <span className="flex items-baseline gap-4">
                      <span className="font-plex shrink-0 text-[0.72rem] text-white/50">Q.{i + 1}</span>
                      <span className="font-serif-display text-lg font-medium text-white/90 sm:text-xl">{f.q}</span>
                    </span>
                    <span className="font-plex shrink-0 select-none text-white/60 transition-transform duration-300 group-open:rotate-45" aria-hidden>+</span>
                  </summary>
                  <p className="mt-4 pl-[2.45rem] text-[0.97rem] leading-relaxed text-white/70">{f.a}</p>
                </details>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================= Colophon CTA */}
      <section className="py-28">
        <Reveal className="mx-auto max-w-6xl px-6">
          <div className="border-t rule pt-14 text-center">
            <h2 className="font-serif-display mx-auto max-w-2xl text-4xl font-medium leading-[1.1] tracking-[-0.01em] text-white sm:text-5xl">
              Make your next inspection <em className="font-normal">a formality.</em>
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-[0.95rem] leading-relaxed text-white/70">
              Start with a single CFR audit or classify an AI system against the EU AI Act — and
              walk away with proof.
            </p>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
              <PrimaryCTA href="/audit">Build an audit →</PrimaryCTA>
              <SecondaryCTA href="/pricing">See pricing</SecondaryCTA>
            </div>
          </div>
        </Reveal>
      </section>
    </MarketingPage>
  );
}
