//@ts-nocheck
'use client';
// The expert system takes a deposition. Instead of a form, the engine asks
// its questions one at a time in a green-on-black console; answers become the
// same `responses` map the form uses, so the form remains the reviewable
// artifact afterwards. Commands: :skip :back :attach :form :help.
// Attachments (docs / images) flow through the caller-provided uploadAutofill,
// which rides the existing /api/autofill machinery.
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { TerminalPanel, Caret, TERM } from '@/components/module/terminal';

type Responses = Record<string, string>;
type Tone = 'sys' | 'bright' | 'faint' | 'user' | 'warn';
type Entry = { tone: Tone; text: string };

const TONE_COLOR: Record<Tone, string> = {
  sys: TERM.green,
  bright: TERM.bright,
  faint: TERM.dim,
  user: TERM.user,
  warn: TERM.warn,
};

const pad2 = (n: number) => String(n).padStart(2, '0');

function optionsOf(q: any): string[] {
  if (q.type === 'NUMERIC' || q.type === 'DATE' || q.type === 'TIME' || q.type === 'TEXT') return [];
  return q.options && q.options.length ? q.options : ['true', 'false'];
}

function questionBlock(q: any, idx: number, total: number, current?: string): Entry[] {
  const out: Entry[] = [{ tone: 'faint', text: '' }];
  out.push({ tone: 'bright', text: `Q.${pad2(idx + 1)}/${pad2(total)}  ${q.text}` });
  const ref = q.reference || q.cfr_reference;
  if (ref) out.push({ tone: 'faint', text: `        ${ref}` });
  const opts = optionsOf(q);
  opts.forEach((o, i) => out.push({ tone: 'sys', text: `        [${i + 1}] ${o}` }));
  if (q.type === 'CHECKBOX') out.push({ tone: 'faint', text: '        comma-separate multiple, e.g. 1,3' });
  if (q.type === 'NUMERIC') out.push({ tone: 'faint', text: '        enter a number' });
  if (q.type === 'DATE') out.push({ tone: 'faint', text: '        enter a date, YYYY-MM-DD' });
  if (q.type === 'TIME') out.push({ tone: 'faint', text: '        enter a time, HH:MM' });
  if (current) out.push({ tone: 'faint', text: `        current: ${current} — press enter to keep` });
  return out;
}

// Parse raw console input against the question type. Returns the canonical
// response string, or null (with `error`) when unrecognized.
function parseAnswer(q: any, raw: string): { value?: string; error?: string } {
  const input = raw.trim();
  const opts = optionsOf(q);

  if (q.type === 'NUMERIC') {
    if (!/^-?\d+(\.\d+)?$/.test(input)) return { error: 'expected a number' };
    return { value: input };
  }
  if (q.type === 'DATE') {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(input)) return { error: 'expected YYYY-MM-DD' };
    return { value: input };
  }
  if (q.type === 'TIME') {
    if (!/^\d{2}:\d{2}$/.test(input)) return { error: 'expected HH:MM' };
    return { value: input };
  }
  if (q.type === 'TEXT') {
    if (!input) return { error: 'expected text' };
    return { value: input };
  }
  if (q.type === 'CHECKBOX') {
    const parts = input.split(',').map((p) => p.trim()).filter(Boolean);
    if (!parts.length) return { error: `expected one or more of 1..${opts.length}` };
    const picked: string[] = [];
    for (const p of parts) {
      const n = parseInt(p, 10);
      const byNum = !Number.isNaN(n) && n >= 1 && n <= opts.length ? opts[n - 1] : null;
      const byName = opts.find((o) => o.toLowerCase() === p.toLowerCase());
      const v = byNum || byName;
      if (!v) return { error: `"${p}" is not one of 1..${opts.length}` };
      if (!picked.includes(v)) picked.push(v);
    }
    return { value: picked.join(',') };
  }
  // segmented / select / boolean
  const n = parseInt(input, 10);
  if (!Number.isNaN(n) && n >= 1 && n <= opts.length) return { value: opts[n - 1] };
  const byName = opts.find((o) => o.toLowerCase() === input.toLowerCase());
  if (byName) return { value: byName };
  const yes = opts.find((o) => /^(yes|true)$/i.test(o));
  const no = opts.find((o) => /^(no|false)$/i.test(o));
  if (/^y(es)?$/i.test(input) && yes) return { value: yes };
  if (/^n(o)?$/i.test(input) && no) return { value: no };
  return { error: `expected 1..${opts.length}, or the option text` };
}

export function ConsoleInterview({
  systemName = 'GRIMOIRE/1',
  contextLabel,
  form,
  initialResponses,
  onFinish,
  uploadAutofill,
}: {
  systemName?: string;
  contextLabel?: string;
  form: any;
  initialResponses?: Responses;
  // Called when the deposition ends (all questions answered, or :form).
  onFinish: (responses: Responses, completed: boolean) => void;
  // Optional doc/image ingestion: returns {questionId: value} plus optional meta.
  uploadAutofill?: (file: File) => Promise<Record<string, string>>;
}) {
  const questions = form?.questions || [];
  const total = questions.length;

  const [responses, setResponses] = useState<Responses>(() => ({ ...(initialResponses || {}) }));
  // The deposition always walks every question in order; pre-answered ones
  // show their current value and accept a bare Enter to keep it.
  const [idx, setIdx] = useState(0);
  const [transcript, setTranscript] = useState<Entry[]>(() => [
    { tone: 'faint', text: `${systemName} — expert system${contextLabel ? ` · ${contextLabel}` : ''}` },
    { tone: 'sys', text: `interrogation begins. ${total} assertions required.` },
    { tone: 'faint', text: 'answer to assert · :skip :back :attach :form :help' },
  ]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const bodyRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const printedFor = useRef(-1);

  const say = (...entries: Entry[]) => setTranscript((t) => [...t, ...entries]);

  const answeredCount = useMemo(
    () => questions.filter((q: any) => responses[q.id] != null && responses[q.id] !== '').length,
    [questions, responses],
  );

  // Print the current question once per arrival.
  useEffect(() => {
    if (done || idx >= total || printedFor.current === idx) return;
    printedFor.current = idx;
    say(...questionBlock(questions[idx], idx, total, responses[questions[idx].id]));
  }, [idx, done, total]);

  // React to live rule authoring: when the auditor compiles a new rule into
  // this audit's snapshot, announce it and — if the deposition had already
  // ended — reopen at the first new question.
  const prevCounts = useRef({ q: total, r: (form?.queries || []).length });
  const ruleCount = (form?.queries || []).length;
  useEffect(() => {
    const { q: qPrev, r: rPrev } = prevCounts.current;
    if (ruleCount > rPrev) {
      const added = (form.queries || []).slice(rPrev).map((x: any) => x.description).filter(Boolean);
      say({ tone: 'sys', text: `% rule compiled into the program${added.length ? `: ${added.join(' · ')}` : ''}` });
    }
    if (total > qPrev) {
      const n = total - qPrev;
      say({ tone: 'faint', text: `% ${n} new question${n > 1 ? 's' : ''} appended to the deposition.` });
      if (done) {
        setDone(false);
        printedFor.current = -1;
        setIdx(qPrev);
      }
    }
    prevCounts.current = { q: total, r: ruleCount };
  }, [total, ruleCount, done]);

  // Pin scroll to the latest line.
  useEffect(() => {
    const el = bodyRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [transcript, done]);

  const finish = (completed: boolean, finalResponses: Responses) => {
    setDone(true);
    say(
      { tone: 'faint', text: '' },
      { tone: 'sys', text: `deposition ${completed ? 'complete' : 'suspended'} — ${Object.values(finalResponses).filter(Boolean).length}/${total} asserted.` },
      { tone: 'bright', text: 'rendering the form for review. you may amend any answer there. ∎' },
    );
    setTimeout(() => onFinish(finalResponses, completed), 900);
  };

  const advance = (next: Responses) => {
    // Strictly sequential: every question gets its turn, answered or not.
    if (idx + 1 < total) { setIdx(idx + 1); return; }
    finish(questions.every((q: any) => next[q.id]), next);
  };

  const handleCommand = (cmd: string) => {
    if (cmd === ':help') {
      say(
        { tone: 'faint', text: ':skip    leave this question blank and move on' },
        { tone: 'faint', text: ':back    return to the previous question' },
        { tone: 'faint', text: ':attach  read a document or image and assert what it proves' },
        { tone: 'faint', text: ':form    end the deposition and review the form' },
      );
      return;
    }
    if (cmd === ':form') { finish(false, responses); return; }
    if (cmd === ':skip') {
      say({ tone: 'faint', text: 'skipped.' });
      const next = { ...responses };
      delete next[questions[idx].id];
      if (idx + 1 < total) { printedFor.current = -1; setIdx(idx + 1); }
      else finish(false, next);
      return;
    }
    if (cmd === ':back') {
      if (idx === 0) { say({ tone: 'warn', text: 'already at the first question.' }); return; }
      printedFor.current = -1;
      setIdx(idx - 1);
      return;
    }
    if (cmd === ':attach') {
      if (!uploadAutofill) { say({ tone: 'warn', text: 'attachments are not available here.' }); return; }
      fileRef.current?.click();
      return;
    }
    say({ tone: 'warn', text: `unknown command ${cmd} — try :help` });
  };

  const submit = () => {
    if (busy || done) return;
    const raw = input;
    if (!raw.trim()) {
      // Bare Enter keeps an existing answer and flows on.
      const q = questions[idx];
      if (q && responses[q.id]) {
        say({ tone: 'user', text: '>' }, { tone: 'faint', text: `kept: ${q.id} = ${responses[q.id]}` });
        advance(responses);
      }
      return;
    }
    setInput('');
    say({ tone: 'user', text: `> ${raw}` });

    if (raw.trim().startsWith(':')) { handleCommand(raw.trim().toLowerCase()); return; }

    const q = questions[idx];
    const { value, error } = parseAnswer(q, raw);
    if (error) { say({ tone: 'warn', text: `?  ${error}` }); return; }

    const next = { ...responses, [q.id]: value };
    setResponses(next);
    say({ tone: 'faint', text: `asserted: ${q.id} = ${value}` });
    advance(next);
  };

  const handleFile = async (file: File | undefined) => {
    if (!file || !uploadAutofill) return;
    setBusy(true);
    say({ tone: 'sys', text: `reading ${file.name} …` });
    try {
      const values = await uploadAutofill(file);
      const next = { ...responses };
      const filled: string[] = [];
      for (const q of questions) {
        const v = values?.[q.id];
        if (v && !next[q.id]) { next[q.id] = String(v); filled.push(`${q.id} = ${v}`); }
      }
      if (!filled.length) {
        say({ tone: 'warn', text: 'nothing in the document answered an open question.' });
      } else {
        setResponses(next);
        say(
          { tone: 'sys', text: `${filled.length} assertion${filled.length === 1 ? '' : 's'} extracted:` },
          ...filled.map((f) => ({ tone: 'faint', text: `  ${f}` }) as Entry),
          { tone: 'faint', text: 'review them on the form afterwards — nothing is auto-accepted as final.' },
        );
        advance(next);
      }
    } catch {
      say({ tone: 'warn', text: 'could not read the document. try again, or answer directly.' });
    }
    setBusy(false);
    if (fileRef.current) fileRef.current.value = '';
  };

  return (
    <TerminalPanel
      title={`${systemName} — deposition`}
      status={`${answeredCount}/${total} asserted`}
      className="cursor-text"
    >
      <div
        ref={bodyRef}
        onClick={() => inputRef.current?.focus()}
        className="max-h-[26rem] min-h-[18rem] overflow-y-auto px-4 py-3 text-[12.5px] leading-[1.9]"
      >
        {transcript.map((e, i) => (
          <div key={i} className="term-in whitespace-pre-wrap break-words" style={{ color: TONE_COLOR[e.tone] }}>
            {e.text || ' '}
          </div>
        ))}

        {!done && (
          <div className="flex items-baseline gap-2" style={{ color: TERM.user }}>
            <span style={{ color: TERM.green }} aria-hidden>{busy ? '…' : '>'}</span>
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') submit(); }}
              disabled={busy}
              autoFocus
              spellCheck={false}
              autoComplete="off"
              aria-label="Console answer"
              className="min-w-0 flex-1 border-0 bg-transparent p-0 text-[12.5px] outline-none"
              style={{ color: TERM.user, caretColor: TERM.green, fontFamily: 'inherit' }}
            />
            {!input && !busy && <Caret />}
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-t px-4 py-2" style={{ borderColor: TERM.line }}>
        <span className="text-[0.7rem] tracking-[0.08em]" style={{ color: 'rgba(134,239,172,0.85)' }}>
          answer to assert · :skip :back {uploadAutofill ? ':attach ' : ''}:form :help
        </span>
        <span className="text-[0.7rem] tracking-[0.08em]" style={{ color: TERM.dim }} aria-hidden>
          evidence ⊢ verdict
        </span>
      </div>

      {uploadAutofill && (
        <input
          ref={fileRef}
          type="file"
          accept=".pdf,.txt,.md,.doc,.docx,image/*"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
      )}
    </TerminalPanel>
  );
}
