//@ts-nocheck
'use client';
// Company page, set like the about page of a university press: a running head,
// a serif thesis, a measure-limited essay, ruled principles, and a QED.
import React from 'react';
import {
  MarketingPage, Reveal, SectionRule, SerifTitle, ProvesItem, QED,
  PrimaryCTA, SecondaryCTA, EASE,
} from '@/components/landing/ui';
import { motion } from 'framer-motion';

const VALUES = [
  { n: '01', title: 'Proof over paperwork', body: 'Compliance should be derived and checkable — not asserted in a slide deck.' },
  { n: '02', title: 'Determinism', body: 'The same inputs always produce the same verdict. No vibes, no drift.' },
  { n: '03', title: 'Auditability', body: 'Every result carries its reasoning, ready to hand to a regulator.' },
  { n: '04', title: 'One engine, many laws', body: 'Regulations differ; the verification machinery underneath shouldn\'t.' },
];

export default function CompanyPage() {
  return (
    <MarketingPage>
      {/* ============================================================ Front matter */}
      <section className="relative overflow-hidden">
        <div className="relative mx-auto max-w-6xl px-6 pb-16 pt-20 sm:pt-28">
          {/* running head */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, ease: EASE }}
            className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 border-b rule pb-4"
          >
            <p className="font-plex text-[0.7rem] uppercase tracking-[0.22em] text-white/45">Company — on Grimoire One</p>
            <p className="font-plex hidden text-[0.7rem] tracking-[0.08em] text-white/30 sm:block" aria-hidden>an editorial note</p>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.05, ease: EASE }}
            className="font-serif-display mt-14 max-w-3xl text-[2.6rem] font-medium leading-[1.06] tracking-[-0.015em] text-white sm:text-[3.8rem]"
          >
            Compliance, <em className="font-normal text-white/85">made provable.</em>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.16, ease: EASE }}
            className="mt-7 max-w-prose text-[0.98rem] leading-relaxed text-white/60"
          >
            Grimoire One turns regulations into executable logic, so regulated teams can prove
            adherence instead of arguing it.
          </motion.p>
        </div>
      </section>

      {/* =============================================== § 01 — The argument */}
      <section className="pb-20">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal><SectionRule n="01" title="The argument" aside="why this exists" /></Reveal>
          <Reveal delay={0.06} className="mt-10 max-w-prose space-y-5 text-[0.98rem] leading-relaxed text-white/60">
            <p>
              Most compliance tooling stores documents and tracks tasks. None of it can tell you
              whether you are actually compliant — it just records that someone said so.
            </p>
            <p>
              We took a different path: compile the regulation itself into a Prolog program, turn
              your evidence into facts, and let the machine derive the verdict. The result is
              compliance you can <em className="font-serif-display text-white/85">prove</em>, line
              by line, against FDA 21 CFR and the EU AI Act today — with the same engine ready for
              whatever comes next.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ================================================ § 02 — Principles */}
      <section className="pb-20">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal><SectionRule n="02" title="What we believe" aside="principles, not slogans" /></Reveal>

          <Reveal delay={0.05} className="mt-10">
            <SerifTitle className="max-w-2xl">Principles, <em className="font-normal">not slogans.</em></SerifTitle>
          </Reveal>

          <ul className="mt-10 grid gap-x-12 gap-y-8 sm:grid-cols-2">
            {VALUES.map((v, i) => (
              <Reveal key={v.title} delay={i * 0.06}>
                <ProvesItem>
                  <span className="font-plex mr-3 text-[0.72rem] text-white/30">{v.n}</span>
                  <span className="font-serif-display text-base font-medium text-white">{v.title}</span>
                  <span className="mt-1.5 block text-sm leading-relaxed text-white/55">{v.body}</span>
                </ProvesItem>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {/* ================================================ Colophon — closing */}
      <section className="pb-28">
        <Reveal className="mx-auto max-w-6xl px-6">
          <div className="border-t rule pt-14">
            <h2 className="font-serif-display max-w-2xl text-3xl font-medium leading-[1.1] tracking-[-0.01em] text-white sm:text-4xl">
              Building in a regulated space?
            </h2>
            <p className="mt-4 max-w-lg text-[0.95rem] leading-relaxed text-white/55">
              We&apos;d love to hear what you&apos;re working on. <QED />
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <PrimaryCTA href="/contact">Get in touch →</PrimaryCTA>
              <SecondaryCTA href="/docs">Read the docs</SecondaryCTA>
            </div>
          </div>
        </Reveal>
      </section>
    </MarketingPage>
  );
}
