//@ts-nocheck
'use client';
import React from 'react';
import { Check, ArrowRight } from 'lucide-react';
import { MarketingPage, Reveal, Eyebrow, SectionHeading, Panel, Glow, PrimaryCTA, SecondaryCTA } from '@/components/landing/ui';

const TIERS = [
  {
    name: 'Starter', price: 'Free', blurb: 'Explore the engine on a single regulation.',
    features: ['1 active audit', 'Risk classification', 'Warning-letter analysis', 'Community support'],
    cta: 'Start free', href: '/register', highlight: false,
  },
  {
    name: 'Team', price: '$490', unit: '/mo', blurb: 'For compliance teams shipping regulated products.',
    features: ['Unlimited audits', 'FDA 21 CFR + EU AI Act', 'Annex IV builder & evidence export', 'Autofill from documents', 'Priority support'],
    cta: 'Start a trial', href: '/contact', highlight: true,
  },
  {
    name: 'Enterprise', price: 'Custom', blurb: 'SSO, custom regulations and deployment.',
    features: ['Everything in Team', 'Custom rule authoring', 'SSO & audit logs', 'On-prem / VPC options', 'Dedicated solutions engineer'],
    cta: 'Talk to us', href: '/contact', highlight: false,
  },
];

export default function PricingPage() {
  return (
    <MarketingPage>
      <section className="relative overflow-hidden">
        <Glow className="left-1/2 top-[-30%] h-[44rem] w-[44rem] -translate-x-1/2" />
        <div className="relative mx-auto max-w-3xl px-6 pb-12 pt-28 text-center sm:pt-32">
          <Reveal><SectionHeading eyebrow="Pricing" title="Simple, transparent pricing" lead="Start free, scale when you ship. Every plan runs the same formally-verified engine." /></Reveal>
        </div>
      </section>

      <section className="pb-20">
        <div className="mx-auto grid max-w-5xl gap-5 px-6 lg:grid-cols-3">
          {TIERS.map((t, i) => (
            <Reveal key={t.name} delay={i * 0.08}>
              <Panel className={`flex h-full flex-col p-7 ${t.highlight ? 'border-white/25 bg-white/[0.05] ring-1 ring-white/10' : ''}`}>
                <div className="flex items-center justify-between">
                  <h3 className="font-plex text-base font-semibold">{t.name}</h3>
                  {t.highlight && <span className="font-plex rounded-full bg-white/10 px-2.5 py-0.5 text-xs text-white/70">Popular</span>}
                </div>
                <p className="mt-4 flex items-baseline gap-1">
                  <span className="font-plex text-3xl font-semibold tracking-tight">{t.price}</span>
                  {t.unit && <span className="text-sm text-white/40">{t.unit}</span>}
                </p>
                <p className="mt-2 text-sm text-white/50">{t.blurb}</p>
                <ul className="mt-6 space-y-2.5">
                  {t.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-white/65"><Check className="mt-0.5 h-4 w-4 shrink-0 text-zinc-300" /> {f}</li>
                  ))}
                </ul>
                <div className="mt-7 pt-2">
                  {t.highlight
                    ? <PrimaryCTA href={t.href} className="w-full">{t.cta} <ArrowRight className="h-4 w-4" /></PrimaryCTA>
                    : <SecondaryCTA href={t.href} className="w-full">{t.cta}</SecondaryCTA>}
                </div>
              </Panel>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="border-t border-white/5 py-16">
        <Reveal className="mx-auto max-w-2xl px-6 text-center">
          <Eyebrow>Not sure which plan?</Eyebrow>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight">We&apos;ll help you scope it.</h2>
          <div className="mt-7 flex justify-center"><SecondaryCTA href="/contact">Book a walkthrough</SecondaryCTA></div>
        </Reveal>
      </section>
    </MarketingPage>
  );
}
