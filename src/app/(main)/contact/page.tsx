//@ts-nocheck
'use client';
import React, { useState } from 'react';
import { Mail, MessageSquare, Check, Loader2 } from 'lucide-react';
import { MarketingPage, Reveal, SectionHeading, Panel, Glow } from '@/components/landing/ui';

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
      <section className="relative overflow-hidden">
        <Glow className="left-1/2 top-[-34%] h-[42rem] w-[42rem] -translate-x-1/2" />
        <div className="relative mx-auto max-w-3xl px-6 pb-10 pt-28 text-center sm:pt-32">
          <Reveal><SectionHeading eyebrow="Contact" title="Talk to us" lead="Questions about coverage, pricing or a deployment? Send a note and we'll get back to you." /></Reveal>
        </div>
      </section>

      <section className="pb-24">
        <div className="mx-auto grid max-w-5xl gap-8 px-6 lg:grid-cols-[1fr_1.3fr]">
          <Reveal className="space-y-5">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/[0.06] ring-1 ring-white/10"><Mail className="h-5 w-5 text-zinc-200" /></div>
              <div>
                <p className="font-plex text-sm font-semibold">Email</p>
                <a href="mailto:support@grimoireone.com" className="text-sm text-white/55 hover:text-white">support@grimoireone.com</a>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/[0.06] ring-1 ring-white/10"><MessageSquare className="h-5 w-5 text-zinc-200" /></div>
              <div>
                <p className="font-plex text-sm font-semibold">What to expect</p>
                <p className="text-sm text-white/55">A reply within two business days — usually faster.</p>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.08}>
            <Panel className="p-6">
              {status === 'sent' ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/15 ring-1 ring-emerald-400/20"><Check className="h-6 w-6 text-emerald-300" /></div>
                  <p className="font-plex mt-4 text-base font-semibold">Message sent</p>
                  <p className="mt-1 text-sm text-white/55">Thanks — we&apos;ll be in touch shortly.</p>
                </div>
              ) : (
                <form onSubmit={submit} className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Name"><input value={form.name} onChange={set('name')} className="ct-field" placeholder="Jane Doe" /></Field>
                    <Field label="Email"><input type="email" value={form.email} onChange={set('email')} className="ct-field" placeholder="jane@company.com" /></Field>
                  </div>
                  <Field label="Subject"><input value={form.subject} onChange={set('subject')} className="ct-field" placeholder="What's this about?" /></Field>
                  <Field label="Message"><textarea value={form.message} onChange={set('message')} className="ct-field min-h-[120px] resize-y" placeholder="Tell us a little more…" /></Field>
                  {status === 'error' && <p className="text-sm text-red-400">Something went wrong. Please email us directly.</p>}
                  <button type="submit" disabled={!valid || status === 'sending'} className="font-plex inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-medium text-black transition-transform hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-40">
                    {status === 'sending' ? <Loader2 className="h-4 w-4 animate-spin" /> : null} Send message
                  </button>
                </form>
              )}
            </Panel>
          </Reveal>
        </div>
      </section>

      <style jsx global>{`
        .ct-field {
          width: 100%;
          border-radius: 0.75rem;
          border: 1px solid rgba(255, 255, 255, 0.12);
          background: rgba(255, 255, 255, 0.03);
          padding: 0.55rem 0.8rem;
          font-size: 0.875rem;
          color: #fff;
          transition: border-color 0.15s ease, box-shadow 0.15s ease;
        }
        .ct-field::placeholder { color: rgba(255, 255, 255, 0.3); }
        .ct-field:focus { outline: none; border-color: rgba(255, 255, 255, 0.35); box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.06); }
      `}</style>
    </MarketingPage>
  );
}

function Field({ label, children }: any) {
  return (
    <label className="block">
      <span className="font-plex mb-1.5 block text-xs font-medium uppercase tracking-wide text-white/45">{label}</span>
      {children}
    </label>
  );
}
