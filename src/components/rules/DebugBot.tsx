//@ts-nocheck
'use client';
// The debug bot: a green-on-black consultation about ONE failing verdict.
// Diagnoses why the Prolog query failed (against the live program and the
// user's actual answers), proposes a minimal patch, verifies it (parse-check +
// re-run), and — on the auditor's word — mutates the stored form snapshot.
// Human feedback re-runs the diagnosis with the auditor's intent attached.
import React, { useEffect, useRef, useState } from 'react';
import { TerminalPanel, TERM } from '@/components/module/terminal';

type Tone = 'sys' | 'bright' | 'faint' | 'user' | 'warn' | 'err';
const COLOR: Record<Tone, string> = {
  sys: TERM.green, bright: TERM.bright, faint: TERM.dim, user: TERM.user, warn: TERM.warn, err: '#f87171',
};
type Entry = { tone: Tone; text: string };

const vline = (v?: { status?: string; reason?: string }) =>
  v ? `${v.status}${v.reason ? ` — ${v.reason}` : ''}` : '?';

export function DebugBot({
  form,
  responses,
  queryIndex,
  description,
  onApply,
  onClose,
  autoConsult = true,
}: {
  form: any;
  responses: Record<string, string>;
  queryIndex: number;
  description?: string;
  // Receives the patched form; parent persists it to the audit snapshot.
  onApply: (patchedForm: any) => void;
  onClose: () => void;
  // true → diagnose immediately (a failing verdict); false → edit mode: wait
  // for the auditor to describe the change first.
  autoConsult?: boolean;
}) {
  const [transcript, setTranscript] = useState<Entry[]>([]);
  const [busy, setBusy] = useState(false);
  const [input, setInput] = useState('');
  const [proposal, setProposal] = useState<any>(null); // last result with a fix
  const [lastDiagnosis, setLastDiagnosis] = useState('');
  const bodyRef = useRef<HTMLDivElement>(null);
  const ranFor = useRef(-1);

  const say = (...e: Entry[]) => setTranscript((t) => [...t, ...e]);

  const consult = async (feedback?: string) => {
    setBusy(true);
    setProposal(null);
    say({ tone: 'faint', text: feedback ? 'reconsidering with your feedback …' : 'consulting the engine — assembling the live program …' });
    try {
      const res = await fetch('/api/rules/debug', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ form, responses, queryIndex, feedback, priorDiagnosis: lastDiagnosis || undefined }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d?.error || 'debug failed');
      setLastDiagnosis(d.diagnosis || '');
      say({ tone: 'faint', text: ' ' }, { tone: 'bright', text: '% diagnosis' }, { tone: 'sys', text: d.diagnosis });
      if (d.form) {
        setProposal(d);
        const v = d.verification || {};
        say(
          { tone: 'faint', text: ' ' },
          { tone: 'bright', text: `% proposed repair — ${d.summary || 'minimal patch'}` },
          { tone: 'faint', text: `compiler: parse ${v.parses ? '✓' : '✗'} · attempts ${d.attempts}` },
          { tone: v.after?.status === 'pass' ? 'bright' : v.after?.status === 'escalate' ? 'warn' : 'err',
            text: `re-run with your current answers: ${vline(v.before)} → ${vline(v.after)}` },
          { tone: 'faint', text: ' ' },
          { tone: 'bright', text: 'apply this fix? — y mutates the program and this audit’s stored form · n discards · or describe what to change.' },
        );
      } else {
        say({ tone: 'faint', text: ' ' }, { tone: 'warn', text: 'no patch proposed — the verdict appears to be correct for these answers. describe your intent below if I’m wrong.' });
      }
    } catch (e: any) {
      say({ tone: 'err', text: `debug failed: ${e?.message || e}` });
    }
    setBusy(false);
  };

  useEffect(() => {
    if (ranFor.current === queryIndex) return;
    ranFor.current = queryIndex;
    setTranscript([
      { tone: 'faint', text: `GRIMOIRE/1 — ${autoConsult ? 'debug' : 'edit'} · rule ${String(queryIndex + 1).padStart(2, '0')}` },
      ...(description ? [{ tone: 'sys', text: `% ${description}` } as Entry] : []),
    ]);
    if (autoConsult) consult();
    else say(
      { tone: 'faint', text: ' ' },
      { tone: 'sys', text: 'edit mode — describe what this rule should do differently. I will rewrite the program and, if the question itself captures the wrong shape of data, reshape the form too.' },
    );
  }, [queryIndex]);

  useEffect(() => {
    const el = bodyRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [transcript, busy]);

  const submitFeedback = () => {
    const raw = input.trim();
    if (!raw || busy) return;
    setInput('');
    say({ tone: 'user', text: `> ${raw}` });
    // A pending proposal turns the prompt into an interactive y/n.
    if (proposal) {
      if (/^y(es)?$/i.test(raw)) {
        onApply(proposal.form);
        say({ tone: 'bright', text: '∎ program mutated — re-validate to derive fresh verdicts.' });
        setProposal(null);
        return;
      }
      if (/^n(o)?$/i.test(raw)) {
        say({ tone: 'faint', text: 'discarded. describe what you’d rather change, or close.' });
        setProposal(null);
        return;
      }
      // Anything else is feedback — re-diagnose with it.
    }
    consult(raw);
  };

  return (
    <TerminalPanel
      title={`${autoConsult ? 'debug' : 'edit'} — GRIMOIRE/1`}
      status={
        <button type="button" onClick={onClose} className="underline-offset-2 hover:underline" style={{ color: TERM.dim }}>
          close ✕
        </button>
      }
    >
      <div ref={bodyRef} className="max-h-[22rem] min-h-[10rem] overflow-y-auto px-4 py-3 text-[12.5px] leading-[1.9]">
        {transcript.map((e, i) => (
          <div key={i} className="term-in whitespace-pre-wrap break-words" style={{ color: COLOR[e.tone] }}>{e.text}</div>
        ))}
        {busy && <span className="term-blink inline-block h-[1.02em] w-[0.55em]" style={{ background: TERM.green }} />}
        {!busy && (
          <div className="mt-1 flex items-baseline gap-2" style={{ color: TERM.user }}>
            <span style={{ color: TERM.green }} aria-hidden>{'>'}</span>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') submitFeedback(); }}
              placeholder={proposal ? 'y to apply · n to discard · or describe what to change…' : autoConsult ? 'tell the bot what the rule should actually mean…' : 'describe the change — e.g. ask one aggregate yes/no instead of per-member entries…'}
              spellCheck={false}
              aria-label="Debug feedback"
              className="min-w-0 flex-1 border-0 bg-transparent p-0 text-[12.5px] outline-none placeholder:text-[#4ade80]/35"
              style={{ color: TERM.user, caretColor: TERM.green, fontFamily: 'inherit' }}
            />
          </div>
        )}
      </div>
    </TerminalPanel>
  );
}
