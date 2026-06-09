//@ts-nocheck
// Route: /app/terms/page.tsx
// The terms of service, set as a statute: a running head, a serif title,
// § -numbered articles divided by hairline rules, and a closing ∎.
// Static server component — a legal instrument doesn't need to animate.
import React from 'react';
import { MarketingPage, QED } from '@/components/landing/ui';

const SECTIONS = [
  {
    n: '1',
    title: 'Acceptance of Terms',
    body: (
      <p>By accessing and using Grimoire.corp&apos;s FDA compliance analysis platform (&quot;Service&quot;), you agree to be bound by these Terms of Service (&quot;Terms&quot;). If you disagree with any part of the terms, you may not access the Service.</p>
    ),
  },
  {
    n: '2',
    title: 'Description of Service',
    body: (
      <p>Grimoire.corp provides tools for analyzing FDA warning letters, comparing regulatory documents, and validating compliance measures. The Service includes similarity analysis, warning letter comparison, and Prolog-based validation features.</p>
    ),
  },
  {
    n: '3',
    title: 'Use License',
    body: (
      <p>We grant you a limited, non-exclusive, non-transferable license to use the Service for your internal business purposes, subject to these Terms.</p>
    ),
  },
  {
    n: '4',
    title: 'User Responsibilities',
    body: (
      <ul className="space-y-2.5">
        {[
          'You are responsible for maintaining the confidentiality of your account.',
          'You must not misuse the Service or interfere with its operation.',
          'You agree to use the Service in compliance with all applicable laws and regulations.',
        ].map((item, i) => (
          <li key={i} className="flex items-start gap-3.5">
            <span className="font-plex mt-px shrink-0 select-none text-[0.72rem] text-white/30" aria-hidden>
              {String(i + 1).padStart(2, '0')}
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    ),
  },
  {
    n: '5',
    title: 'Data Analysis and Results',
    body: (
      <p>While we strive for accuracy, the Service&apos;s analysis results are provided &quot;as is&quot; and should not be considered legal advice. Users should verify all results and consult qualified professionals for regulatory compliance decisions.</p>
    ),
  },
  {
    n: '6',
    title: 'Intellectual Property',
    body: (
      <p>All content, features, and functionality of the Service are owned by Grimoire.corp and are protected by international copyright, trademark, and other intellectual property laws.</p>
    ),
  },
  {
    n: '7',
    title: 'Limitation of Liability',
    body: (
      <p>Grimoire.corp shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use or inability to use the Service.</p>
    ),
  },
  {
    n: '8',
    title: 'Changes to Terms',
    body: (
      <p>We reserve the right to modify these Terms at any time. We will notify users of any material changes via email or through the Service.</p>
    ),
  },
  {
    n: '9',
    title: 'Contact Information',
    body: (
      <p>For questions about these Terms, please contact us at support@grimoireone.com</p>
    ),
  },
];

const TermsPage = () => {
  return (
    <MarketingPage className="min-h-screen">
      <div className="mx-auto max-w-3xl px-6 pb-28 pt-16 sm:pt-24">
        {/* running head */}
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 border-b rule pb-4">
          <p className="font-plex text-[0.7rem] uppercase tracking-[0.22em] text-white/45">
            Grimoire One — terms of service
          </p>
          <p className="font-plex text-[0.7rem] uppercase tracking-[0.14em] text-white/30">
            last revised · 2025
          </p>
        </div>

        {/* title */}
        <header className="mt-14">
          <h1 className="font-serif-display text-[2.6rem] font-medium leading-[1.06] tracking-[-0.015em] text-white sm:text-[3.4rem]">
            Terms of Service.
          </h1>
          <p className="font-plex mt-5 text-[0.7rem] uppercase tracking-[0.22em] text-white/40">
            §§ 1–9 <span className="mx-2 text-white/20" aria-hidden>·</span> binding upon use of the service
          </p>
        </header>

        {/* the instrument */}
        <div className="mt-12 divide-y divide-white/[0.09] border-t rule">
          {SECTIONS.map((s) => (
            <section key={s.n} className="grid gap-3 py-9 sm:grid-cols-12 sm:gap-6">
              <p className="font-plex pt-1 text-[0.78rem] text-white/35 sm:col-span-2">
                § {s.n}
              </p>
              <div className="sm:col-span-10">
                <h2 className="font-serif-display text-[1.35rem] font-medium leading-snug text-white sm:text-[1.55rem]">
                  {s.title}
                </h2>
                <div className="mt-3 text-[0.95rem] leading-relaxed text-white/60">
                  {s.body}
                </div>
              </div>
            </section>
          ))}
        </div>

        {/* end of instrument */}
        <div className="flex items-baseline justify-between border-t rule pt-5">
          <p className="font-plex text-[0.7rem] uppercase tracking-[0.18em] text-white/30">
            End of terms
          </p>
          <QED />
        </div>
      </div>
    </MarketingPage>
  );
};

export default TermsPage;
