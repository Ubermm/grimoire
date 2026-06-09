//@ts-nocheck
'use client';
// Contact page in the scholarly-press language: a running head, a serif
// heading, hairline-ruled correspondence details, and a form set as flat
// bottom-bordered fields — no card chrome, no icons.
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MarketingPage, Reveal, SectionRule, QED, EASE } from '@/components/landing/ui';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const set = (k: string) => (e: any) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const valid = form.name.trim() && form.email.trim() && form.subject.trim();

  const submit = async (e: any) => {
    e.preventDefault();
    if (!valid) return;
    setStatus('sending');
    try {
      const r = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      setStatus(r.ok ? 'sent' : 'error');
    } catch { setStatus('error'); }
  };

  return (
    <MarketingPage>
      {/* ============================================================ Front matter */}
      <section className="relative overflow-hidden">
        <div className="relative mx-auto max-w-6xl px-6 pb-14 pt-20 sm:pt-28">
          {/* running head */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, ease: EASE }}
            className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 border-b rule pb-4"
          >
            <p className="font-plex text-[0.7rem] uppercase tracking-[0.22em] text-white/45">Contact — correspondence</p>
            <p className="font-plex hidden text-[0.7rem] tracking-[0.08em] text-white/30 sm:block" aria-hidden>letters to the editor</p>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.05, ease: EASE }}
            className="font-serif-display mt-14 max-w-3xl text-[2.6rem] font-medium leading-[1.06] tracking-[-0.015em] text-white sm:text-[3.8rem]"
          >
            Talk <em className="font-normal text-white/85">to us.</em>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.16, ease: EASE }}
            className="mt-7 max-w-prose text-[0.98rem] leading-relaxed text-white/60"
          >
            Questions about coverage, pricing or a deployment? Send a note and we&apos;ll get back to you.
          </motion.p>
        </div>
      </section>

      {/* ============================================== § 01 — Correspondence */}
      <section className="pb-28">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal><SectionRule n="01" title="Correspondence" aside="a reply, not a ticket" /></Reveal>

          <div className="mt-12 grid gap-14 lg:grid-cols-[1fr_1.4fr] lg:gap-16">
            {/* details, set like a masthead */}
            <Reveal className="space-y-8">
              <div className="border-t rule pt-4">
                <p className="font-plex text-[0.7rem] uppercase tracking-[0.22em] text-white/40">Email</p>
                <a
                  href="mailto:support@grimoireone.com"
                  className="font-plex mt-3 inline-block text-[0.85rem] text-white/70 underline decoration-white/25 underline-offset-4 transition-colors hover:text-white hover:decoration-white/60"
                >
                  support@grimoireone.com
                </a>
              </div>
              <div className="border-t rule pt-4">
                <p className="font-plex text-[0.7rem] uppercase tracking-[0.22em] text-white/40">What to expect</p>
                <p className="mt-3 max-w-xs text-sm leading-relaxed text-white/55">
                  A reply within two business days — usually faster.
                </p>
              </div>
            </Reveal>

            {/* the form */}
            <Reveal delay={0.08}>
              {status === 'sent' ? (
                <div className="border-t rule pt-10">
                  <p className="font-serif-display text-2xl font-medium text-white">
                    Message sent. <QED className="text-base" />
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-white/55">Thanks — we&apos;ll be in touch shortly.</p>
                </div>
              ) : (
                <form onSubmit={submit} className="space-y-9">
                  <div className="grid gap-9 sm:grid-cols-2">
                    <Field n="01" label="Name">
                      <input value={form.name} onChange={set('name')} className="ct-field" placeholder="Jane Doe" />
                    </Field>
                    <Field n="02" label="Email">
                      <input type="email" value={form.email} onChange={set('email')} className="ct-field" placeholder="jane@company.com" />
                    </Field>
                  </div>
                  <Field n="03" label="Subject">
                    <input value={form.subject} onChange={set('subject')} className="ct-field" placeholder="What's this about?" />
                  </Field>
                  <Field n="04" label="Message">
                    <textarea value={form.message} onChange={set('message')} className="ct-field min-h-[120px] resize-y" placeholder="Tell us a little more…" />
                  </Field>
                  {status === 'error' && (
                    <p className="font-plex text-[0.78rem] text-red-400">Something went wrong. Please email us directly.</p>
                  )}
                  <button
                    type="submit"
                    disabled={!valid || status === 'sending'}
                    className="font-plex inline-flex items-center justify-center gap-2 border border-[#e8e6e1] bg-[#e8e6e1] px-5 py-2.5 text-[0.8rem] font-medium uppercase tracking-[0.12em] text-[#0b0a09] transition-colors hover:bg-transparent hover:text-[#e8e6e1] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-[#e8e6e1] disabled:hover:text-[#0b0a09]"
                  >
                    {status === 'sending' ? 'Sending…' : <>Send message <span aria-hidden>→</span></>}
                  </button>
                </form>
              )}
            </Reveal>
          </div>
        </div>
      </section>

      <style jsx global>{`
        .ct-field {
          width: 100%;
          border: 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.12);
          background: transparent;
          padding: 0.5rem 0;
          font-size: 0.9rem;
          color: #e8e6e1;
          transition: border-color 0.15s ease;
        }
        .ct-field::placeholder { color: rgba(255, 255, 255, 0.28); }
        .ct-field:focus { outline: none; border-bottom-color: rgba(255, 255, 255, 0.5); }
      `}</style>
    </MarketingPage>
  );
}

function Field({ n, label, children }: any) {
  return (
    <label className="block">
      <span className="font-plex mb-2 block text-[0.7rem] uppercase tracking-[0.22em] text-white/40">
        <span className="mr-2.5 text-white/25">{n}</span>{label}
      </span>
      {children}
    </label>
  );
}
