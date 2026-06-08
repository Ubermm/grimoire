//@ts-nocheck
'use client';
import React from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import {
  ShieldCheck, Sparkles, ArrowRight, ArrowUpRight, Cpu, ScrollText, GitCompare,
  FileCheck2, Workflow, Layers, Check, ChevronDown,
} from 'lucide-react';
import {
  MarketingPage, Reveal, Counter, Eyebrow, SectionHeading, Panel, Glow, PrimaryCTA, SecondaryCTA, EASE,
} from '@/components/landing/ui';

const HeroLottie = dynamic(() => import('@/components/landing/HeroLottie'), { ssr: false });

const FRAMEWORKS = ['FDA 21 CFR', 'EU AI Act 2024/1689', 'GxP', 'ISO/IEC 42001', '21 CFR Part 11'];

const REGS = [
  { href: '/audit', icon: ShieldCheck, title: 'FDA 21 CFR', desc: 'Title 21 audits, warning-letter analysis and Prolog validation — proven, not claimed.', cta: 'Start an audit' },
  { href: '/ai-act', icon: Sparkles, title: 'EU AI Act', desc: 'Risk classification, Article 5 & 50 screening, GPAI obligations and Annex IV docs.', cta: 'Classify a system' },
];

const STEPS = [
  { icon: Layers, title: 'Compile the rule', body: 'Regulatory text is compiled into an executable Prolog program — the law as logic.' },
  { icon: FileCheck2, title: 'Answer & assert', body: 'Your responses become facts. Documents autofill the forms; nothing is hand-waved.' },
  { icon: Workflow, title: 'Prove compliance', body: 'The engine derives a pass/fail verdict and records the exact rules behind it.' },
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
      {/* ============================================================ Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <Glow className="left-1/2 top-[-22%] h-[52rem] w-[52rem] -translate-x-1/2" />
          <div className="absolute inset-0 hero-grid opacity-60" />
          <HeroLottie src="/lottie/network.json" className="absolute right-[-10%] top-[4%] hidden h-[36rem] w-[36rem] opacity-[0.16] [filter:grayscale(1)] lg:block" />
        </div>

        <div className="relative mx-auto max-w-5xl px-6 pb-24 pt-28 text-center sm:pt-36">
          <motion.h1
            initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.05, ease: EASE }}
            className="mx-auto max-w-4xl text-4xl font-semibold leading-[1.05] tracking-tight sm:text-6xl"
          >
            Prove compliance.<br /><span className="text-sheen">Don&apos;t just claim it.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.14, ease: EASE }}
            className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-white/55 sm:text-lg"
          >
            Grimoire One compiles regulations into executable logic and validates your evidence against them — turning FDA 21 CFR and the EU AI Act into provable, auditable verdicts.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.22, ease: EASE }}
            className="mt-9 flex flex-wrap items-center justify-center gap-3"
          >
            <PrimaryCTA href="/audit">Start an audit <ArrowRight className="h-4 w-4" /></PrimaryCTA>
            <SecondaryCTA href="/ai-act">EU AI Act</SecondaryCTA>
            <Link href="/docs" className="font-plex inline-flex items-center gap-1.5 px-3 py-2.5 text-sm text-white/55 transition-colors hover:text-white">
              Read the docs <ArrowUpRight className="h-4 w-4" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ====================================================== Frameworks strip */}
      <section className="border-t border-white/5 py-12">
        <div className="mx-auto max-w-5xl px-6">
          <Reveal className="flex flex-col items-center gap-6">
            <Eyebrow>Coverage across the frameworks that matter</Eyebrow>
            <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
              {FRAMEWORKS.map((f) => (
                <span key={f} className="font-plex text-sm text-white/40 transition-colors hover:text-white/70">{f}</span>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ====================================================== Regulation hub */}
      <section className="border-t border-white/5 py-20">
        <div className="mx-auto max-w-5xl px-6">
          <Reveal className="mb-10"><SectionHeading eyebrow="Choose your regulation" title="One engine, every framework" /></Reveal>
          <div className="grid gap-5 sm:grid-cols-2">
            {REGS.map((r, i) => (
              <Reveal key={r.href} delay={i * 0.08}>
                <Link href={r.href} className="group block h-full rounded-2xl border border-white/10 bg-white/[0.025] p-7 transition-all hover:-translate-y-0.5 hover:border-white/25 hover:bg-white/[0.05]">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/[0.06] ring-1 ring-white/10 transition-colors group-hover:bg-white/[0.12]">
                    <r.icon className="h-5 w-5 text-zinc-200" />
                  </div>
                  <h3 className="font-plex mt-5 text-lg font-semibold">{r.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/50">{r.desc}</p>
                  <span className="font-plex mt-5 inline-flex items-center gap-1.5 text-sm text-white/80 transition-all group-hover:gap-2.5">{r.cta} <ArrowRight className="h-4 w-4" /></span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* =============================================== Feature 1 — verification */}
      <section className="border-t border-white/5 py-20">
        <div className="mx-auto grid max-w-5xl items-center gap-12 px-6 lg:grid-cols-2">
          <Reveal>
            <Eyebrow>Formal verification</Eyebrow>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">The law, as a program</h2>
            <p className="mt-4 text-[0.97rem] leading-relaxed text-white/55">
              Every requirement is compiled into Prolog. Your answers become facts, and the engine <em>derives</em> the verdict — deterministic, repeatable, and impossible to fudge.
            </p>
            <ul className="mt-6 space-y-2.5">
              {['Deterministic pass/fail, not a confidence score', 'Every verdict cites the rules that fired', 'Re-run any time and get the same answer'].map((t) => (
                <li key={t} className="flex items-start gap-2.5 text-sm text-white/65"><Check className="mt-0.5 h-4 w-4 shrink-0 text-zinc-300" /> {t}</li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={0.1}>
            <Panel className="overflow-hidden">
              <div className="flex items-center gap-1.5 border-b border-white/10 px-4 py-3">
                <span className="h-2.5 w-2.5 rounded-full bg-white/15" /><span className="h-2.5 w-2.5 rounded-full bg-white/15" /><span className="h-2.5 w-2.5 rounded-full bg-white/15" />
                <span className="font-plex ml-2 text-xs text-white/35">classification.pl</span>
              </div>
              <pre className="font-plex overflow-x-auto p-5 text-[12.5px] leading-relaxed text-white/70">
<span className="text-white/35">% high-risk if a listed Annex III use</span>{'\n'}
<span className="text-zinc-200">high_risk</span>(System) :-{'\n'}
{'    '}annex_iii_use(System),{'\n'}
{'    '}\+ article_6_3_exempt(System).{'\n\n'}
<span className="text-white/35">?- </span>classify(acme_hiring_ai, Risk).{'\n'}
Risk = <span className="text-emerald-300">high</span>.  <span className="text-emerald-300/80">✓ proven</span>
              </pre>
            </Panel>
          </Reveal>
        </div>
      </section>

      {/* =============================================== Feature 2 — evidence */}
      <section className="border-t border-white/5 py-20">
        <div className="mx-auto grid max-w-5xl items-center gap-12 px-6 lg:grid-cols-2">
          <Reveal className="lg:order-2">
            <Eyebrow>Evidence-ready</Eyebrow>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">Hand an auditor proof, not a promise</h2>
            <p className="mt-4 text-[0.97rem] leading-relaxed text-white/55">
              Each audit and classification produces a report: the verdict, its basis, the underlying logic, and timestamps. Export it and move on.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {['Classification basis', 'Validation results', 'Annex IV sections', 'The Prolog itself'].map((t) => (
                <span key={t} className="font-plex rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-white/55">{t}</span>
              ))}
            </div>
          </Reveal>
          <Reveal delay={0.1} className="lg:order-1">
            <Panel className="overflow-hidden">
              <div className="flex items-center justify-between border-b border-white/10 px-5 py-3.5">
                <div className="flex items-center gap-2">
                  <FileCheck2 className="h-4 w-4 text-white/40" />
                  <span className="font-plex text-[0.7rem] uppercase tracking-[0.16em] text-white/40">Evidence report</span>
                </div>
                <span className="font-plex text-xs text-white/30">ACT-7F3A</span>
              </div>

              <div className="px-5 pt-4">
                <p className="text-sm font-medium text-white/90">ACME Hiring Model v2.3</p>
                <p className="font-plex mt-0.5 text-xs text-white/40">high-risk · Reg (EU) 2024/1689</p>
              </div>

              <div className="mt-4 border-t border-white/[0.06]">
                {[
                  ['Article 5', 'Prohibited practices', 'clear'],
                  ['Annex III(4)', 'Employment use', 'identified'],
                  ['Annex IV', 'Technical file', '9 / 9'],
                  ['Article 50', 'Transparency', 'disclosed'],
                ].map(([ref, label, val]) => (
                  <div key={ref} className="flex items-center justify-between gap-4 border-b border-white/[0.06] px-5 py-2.5 last:border-b-0">
                    <div className="flex min-w-0 items-baseline gap-3">
                      <span className="font-plex w-[5.5rem] shrink-0 text-xs text-white/45">{ref}</span>
                      <span className="truncate text-sm text-white/70">{label}</span>
                    </div>
                    <span className="font-plex text-xs text-white/80">{val}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center border-t border-white/10 px-5 py-3">
                <span className="font-plex text-[0.7rem] text-white/30">Derived by the Prolog engine · Reg (EU) 2024/1689</span>
              </div>
            </Panel>
          </Reveal>
        </div>
      </section>

      {/* =============================================================== Stats */}
      <section className="border-t border-white/5 py-20">
        <div className="mx-auto max-w-5xl px-6">
          <div className="grid gap-8 sm:grid-cols-3">
            {[
              { to: 3000, suffix: '+', label: 'FDA warning letters analyzed' },
              { to: 50, suffix: '+', label: 'Regulatory citations per letter' },
              { to: 100, suffix: '%', label: 'Title 21 CFR section coverage' },
            ].map((s, i) => (
              <Reveal key={s.label} delay={i * 0.08} className="text-center">
                <p className="font-plex text-4xl font-semibold tracking-tight sm:text-5xl"><Counter to={s.to} suffix={s.suffix} /></p>
                <p className="mt-2 text-sm text-white/45">{s.label}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================= How it works */}
      <section className="border-t border-white/5 py-20">
        <div className="mx-auto max-w-5xl px-6">
          <Reveal className="mb-12"><SectionHeading eyebrow="How it works" title="The law, compiled and proven" /></Reveal>
          <div className="grid gap-5 md:grid-cols-3">
            {STEPS.map((s, i) => (
              <Reveal key={s.title} delay={i * 0.08}>
                <Panel className="h-full p-6">
                  <div className="flex items-center gap-3">
                    <span className="font-plex flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.06] text-sm text-white/70 ring-1 ring-white/10">{i + 1}</span>
                    <s.icon className="h-5 w-5 text-white/35" />
                  </div>
                  <h3 className="font-plex mt-4 text-base font-semibold">{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/50">{s.body}</p>
                </Panel>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* =============================================================== Quote */}
      <section className="border-t border-white/5 py-20">
        <Reveal className="mx-auto max-w-3xl px-6 text-center">
          <ScrollText className="mx-auto h-6 w-6 text-white/30" />
          <p className="mt-6 text-xl font-medium leading-relaxed tracking-tight text-white/85 sm:text-2xl">
            “Sampling tells you what you checked. Formal verification tells you what&apos;s true — across every requirement, every time.”
          </p>
          <p className="font-plex mt-5 text-xs uppercase tracking-[0.14em] text-white/40">The Grimoire One thesis</p>
        </Reveal>
      </section>

      {/* ================================================================= FAQ */}
      <section className="border-t border-white/5 py-20">
        <div className="mx-auto max-w-3xl px-6">
          <Reveal className="mb-10"><SectionHeading eyebrow="FAQ" title="Questions, answered" /></Reveal>
          <div className="divide-y divide-white/10 border-y border-white/10">
            {FAQ.map((f, i) => (
              <Reveal key={f.q} delay={i * 0.04}>
                <details className="group py-5">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
                    <span className="font-plex text-[0.97rem] font-medium text-white/90">{f.q}</span>
                    <ChevronDown className="h-4 w-4 shrink-0 text-white/40 transition-transform group-open:rotate-180" />
                  </summary>
                  <p className="mt-3 text-[1.02rem] leading-relaxed text-white/65">{f.a}</p>
                </details>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================= Final CTA */}
      <section className="relative overflow-hidden border-t border-white/5 py-24">
        <Glow className="left-1/2 top-1/2 h-[32rem] w-[32rem] -translate-x-1/2 -translate-y-1/2" />
        <Reveal className="relative mx-auto max-w-2xl px-6 text-center">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Make your next inspection a formality.</h2>
          <p className="mx-auto mt-4 max-w-xl text-white/55">Start with a single CFR audit or classify an AI system against the EU AI Act — and walk away with proof.</p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <PrimaryCTA href="/audit">Build an audit <ArrowRight className="h-4 w-4" /></PrimaryCTA>
            <SecondaryCTA href="/pricing">See pricing</SecondaryCTA>
          </div>
        </Reveal>
      </section>
    </MarketingPage>
  );
}
