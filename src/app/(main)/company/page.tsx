//@ts-nocheck
'use client';
import React from 'react';
import { Cpu, ShieldCheck, ScrollText, GitCompare } from 'lucide-react';
import { MarketingPage, Reveal, Eyebrow, SectionHeading, Panel, Glow, PrimaryCTA, SecondaryCTA } from '@/components/landing/ui';

const VALUES = [
  { icon: Cpu, title: 'Proof over paperwork', body: 'Compliance should be derived and checkable — not asserted in a slide deck.' },
  { icon: ShieldCheck, title: 'Determinism', body: 'The same inputs always produce the same verdict. No vibes, no drift.' },
  { icon: ScrollText, title: 'Auditability', body: 'Every result carries its reasoning, ready to hand to a regulator.' },
  { icon: GitCompare, title: 'One engine, many laws', body: 'Regulations differ; the verification machinery underneath shouldn\'t.' },
];

export default function CompanyPage() {
  return (
    <MarketingPage>
      <section className="relative overflow-hidden">
        <Glow className="left-1/2 top-[-30%] h-[44rem] w-[44rem] -translate-x-1/2" />
        <div className="relative mx-auto max-w-3xl px-6 pb-12 pt-28 text-center sm:pt-32">
          <Reveal><SectionHeading eyebrow="Company" title="Compliance, made provable" lead="Grimoire One turns regulations into executable logic, so regulated teams can prove adherence instead of arguing it." /></Reveal>
        </div>
      </section>

      <section className="pb-8">
        <Reveal className="mx-auto max-w-3xl space-y-5 px-6 text-[0.98rem] leading-relaxed text-white/60">
          <p>Most compliance tooling stores documents and tracks tasks. None of it can tell you whether you are actually compliant — it just records that someone said so.</p>
          <p>We took a different path: compile the regulation itself into a Prolog program, turn your evidence into facts, and let the machine derive the verdict. The result is compliance you can <span className="text-white/85">prove</span>, line by line, against FDA 21 CFR and the EU AI Act today — with the same engine ready for whatever comes next.</p>
        </Reveal>
      </section>

      <section className="border-t border-white/5 py-20">
        <div className="mx-auto max-w-5xl px-6">
          <Reveal className="mb-10"><SectionHeading eyebrow="What we believe" title="Principles, not slogans" /></Reveal>
          <div className="grid gap-5 sm:grid-cols-2">
            {VALUES.map((v, i) => (
              <Reveal key={v.title} delay={i * 0.06}>
                <Panel className="h-full p-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.06] ring-1 ring-white/10"><v.icon className="h-5 w-5 text-zinc-200" /></div>
                  <h3 className="font-plex mt-4 text-base font-semibold">{v.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/55">{v.body}</p>
                </Panel>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-white/5 py-20">
        <Reveal className="mx-auto max-w-2xl px-6 text-center">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Building in a regulated space?</h2>
          <p className="mx-auto mt-4 max-w-lg text-white/55">We&apos;d love to hear what you&apos;re working on.</p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <PrimaryCTA href="/contact">Get in touch</PrimaryCTA>
            <SecondaryCTA href="/docs">Read the docs</SecondaryCTA>
          </div>
        </Reveal>
      </section>
    </MarketingPage>
  );
}
