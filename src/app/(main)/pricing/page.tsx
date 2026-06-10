//@ts-nocheck
'use client';
// Pricing, set like a rate card in a working paper: a ruled three-column
// comparison (no card chrome), serif old-style prices, ⊢ feature lists, and
// a hairline-ruled closer. Same engine on every line.
import React from 'react';
import { motion } from 'framer-motion';
import {
  MarketingPage, Reveal, SectionRule, SerifTitle, ProvesItem, QED,
  PrimaryCTA, SecondaryCTA, EASE,
} from '@/components/landing/ui';

const TIERS = [
  {
    n: '01', name: 'Starter', price: 'Free', blurb: 'Explore the engine on a single regulation.',
    features: ['1 active audit', 'Risk classification', 'Warning-letter analysis', 'Community support'],
    cta: 'Start free', href: '/register', highlight: false,
  },
  {
    n: '02', name: 'Team', price: '$490', unit: '/mo', blurb: 'For compliance teams shipping regulated products.',
    features: ['Unlimited audits', 'FDA 21 CFR + EU AI Act', 'Annex IV builder & evidence export', 'Autofill from documents', 'Priority support'],
    cta: 'Start a trial', href: '/contact', highlight: true,
  },
  {
    n: '03', name: 'Enterprise', price: 'Custom', blurb: 'SSO, custom regulations and deployment.',
    features: ['Everything in Team', 'Custom rule authoring', 'SSO & audit logs', 'On-prem / VPC options', 'Dedicated solutions engineer'],
    cta: 'Talk to us', href: '/contact', highlight: false,
  },
];

export default function PricingPage() {
  return (
    <MarketingPage>
      {/* ============================================================== Hero */}
      <section className="relative overflow-hidden">
        <div className="relative mx-auto max-w-6xl px-6 pb-16 pt-20 sm:pt-28">
          {/* running head */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, ease: EASE }}
            className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 border-b rule pb-4"
          >
            <p className="font-plex text-[0.7rem] uppercase tracking-[0.22em] text-white/60">Grimoire One — pricing</p>
            <p className="font-plex hidden text-[0.7rem] tracking-[0.08em] text-white/50 sm:block" aria-hidden>three tiers · one engine</p>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.05, ease: EASE }}
            className="font-serif-display mt-14 max-w-3xl text-[2.6rem] font-medium leading-[1.06] tracking-[-0.015em] text-white sm:text-[3.8rem]"
          >
            Simple, <em className="font-normal text-white/85">transparent</em> pricing.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.16, ease: EASE }}
            className="mt-6 max-w-xl text-[0.97rem] leading-relaxed text-white/70"
          >
            Start free, scale when you ship. Every plan runs the same
            formally-verified engine. <QED />
          </motion.p>
        </div>
      </section>

      {/* ================================================== § 01 — The tiers */}
      <section className="pb-24">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal><SectionRule n="01" title="The tiers" aside="same derivation at every price" /></Reveal>

          <div className="mt-10 grid divide-y divide-white/[0.09] border-t rule lg:grid-cols-3 lg:divide-x lg:divide-y-0">
            {TIERS.map((t, i) => (
              <Reveal key={t.name} delay={i * 0.08} className="relative flex h-full flex-col py-9 lg:px-8 lg:first:pl-0 lg:last:pr-0">
                {/* the recommended tier carries a thin top rule + a mono tag, not a pill */}
                {t.highlight && (
                  <span className="absolute inset-x-0 top-0 hidden h-px bg-white/60 lg:block" aria-hidden />
                )}
                <div className="flex items-baseline justify-between gap-4">
                  <span className="font-plex text-[0.78rem] text-white/50">{t.n}</span>
                  {t.highlight && (
                    <span className="font-plex text-[0.65rem] uppercase tracking-[0.22em] text-white/70">Recommended</span>
                  )}
                </div>

                <h3 className="font-serif-display mt-4 text-[1.7rem] font-medium leading-tight text-white sm:text-[2rem]">{t.name}</h3>

                <p className="mt-5 flex items-baseline gap-1.5 border-b rule pb-6">
                  <span className="font-serif-display serif-oldstyle-nums text-4xl font-medium tracking-tight text-white sm:text-5xl">{t.price}</span>
                  {t.unit && <span className="font-plex text-[0.78rem] text-white/60">{t.unit}</span>}
                </p>

                <p className="mt-5 text-sm leading-relaxed text-white/70">{t.blurb}</p>

                <ul className="mt-6 flex-1 space-y-3">
                  {t.features.map((f) => (
                    <ProvesItem key={f}>{f}</ProvesItem>
                  ))}
                </ul>

                <div className="mt-9">
                  {t.highlight
                    ? <PrimaryCTA href={t.href} className="w-full">{t.cta} →</PrimaryCTA>
                    : <SecondaryCTA href={t.href} className="w-full">{t.cta} →</SecondaryCTA>}
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={0.2}>
            <p className="font-plex mt-10 text-[0.78rem] text-white/55">
              <span className="text-white/55" aria-hidden>∴</span>&ensp;the engine — and the proof it produces — is identical on every plan.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ============================================================ Closer */}
      <section className="pb-28">
        <Reveal className="mx-auto max-w-6xl px-6">
          <div className="border-t rule pt-14 text-center">
            <p className="font-plex text-[0.7rem] uppercase tracking-[0.22em] text-white/60">Not sure which plan?</p>
            <SerifTitle className="mx-auto mt-4 max-w-xl">
              We&apos;ll help you <em className="font-normal">scope it.</em>
            </SerifTitle>
            <div className="mt-8 flex justify-center">
              <SecondaryCTA href="/contact">Book a walkthrough →</SecondaryCTA>
            </div>
          </div>
        </Reveal>
      </section>
    </MarketingPage>
  );
}
