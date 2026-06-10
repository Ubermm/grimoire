//@ts-nocheck
'use client';
// Replays an ALREADY-COMPLETE validation as terminal theater: the program
// loads line by line, each query derives its verdict, the proof stamps.
// Brisk by design (~3–4s total) — the engine finished before this mounts;
// nothing here waits on anything. Reduced motion (or "skip") shows the
// finished transcript instantly. "↓ program.pl" downloads the actual
// program plus queries and verdicts as comments.
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { TerminalPanel, TERM, buildProgramLines } from '@/components/module/terminal';

type Result = { passed: boolean[]; description: string[]; status?: string[]; reason?: string[] };

const statusOf = (r: Result, i: number) => r.status?.[i] || (r.passed?.[i] ? 'pass' : 'fail');
const strip = (s: string) => s.replace(/[\u0000\u0001]/g, '');

type Entry = { text: string; color: string; delay: number; indent?: boolean };

function buildTimeline(form: any, responses: Record<string, any>, results: Result): Entry[] {
  const lines = buildProgramLines(form, responses);
  const program = lines.filter((l) => l.kind !== 'query');
  const queries = lines.filter((l) => l.kind === 'query');
  const t: Entry[] = [];

  t.push({ text: '$ tau-prolog — consult(program)', color: TERM.faint, delay: 0 });
  program.forEach((l, i) => {
    t.push({
      text: strip(l.text) || ' ',
      color: l.kind === 'comment' ? TERM.faint : TERM.green,
      delay: i === 0 ? 220 : 28,
    });
  });
  t.push({ text: `% program loaded — ${program.filter((l) => l.kind === 'code' && l.text.trim()).length} clauses`, color: TERM.faint, delay: 240 });

  queries.forEach((q, i) => {
    const st = statusOf(results, i);
    const reason = results.reason?.[i];
    const desc = results.description?.[i];
    t.push({ text: ' ', color: TERM.faint, delay: 180 });
    if (desc) t.push({ text: `% ${desc}`, color: TERM.faint, delay: 60 });
    t.push({ text: `?- ${strip(q.text)}`, color: TERM.bright, delay: 90 });
    const verdict =
      st === 'pass' ? { text: 'true.  ⊢ proven', color: TERM.bright }
      : st === 'escalate' ? { text: 'escalate. ! review', color: TERM.warn }
      : { text: 'false. ✗ refuted', color: '#f87171' };
    t.push({
      text: verdict.text + (reason ? `   % ${reason}` : ''),
      color: verdict.color,
      delay: 300,
      indent: true,
    });
  });

  const states = queries.map((_, i) => statusOf(results, i));
  const fails = states.filter((s) => s === 'fail').length;
  const escal = states.filter((s) => s === 'escalate').length;
  t.push({ text: ' ', color: TERM.faint, delay: 220 });
  t.push(
    fails === 0 && escal === 0
      ? { text: '∎ Q.E.D. — every query proven.', color: TERM.bright, delay: 80 }
      : { text: `derivation complete — ${fails} refuted · ${escal} escalated · ${states.length - fails - escal} proven.`, color: fails ? '#f87171' : TERM.warn, delay: 80 },
  );
  return t;
}

function programText(form: any, responses: Record<string, any>, results: Result): string {
  const lines = buildProgramLines(form, responses);
  const out: string[] = [
    '% Grimoire One — validation program (as executed)',
    ':- use_module(library(lists)).',
    ':- use_module(library(format)).',
    '',
  ];
  for (const l of lines) {
    if (l.kind === 'query') continue;
    out.push(strip(l.text));
  }
  out.push('', '% queries — verdicts as derived');
  lines.filter((l) => l.kind === 'query').forEach((q, i) => {
    const st = statusOf(results, i);
    out.push(`?- ${strip(q.text)}`);
    out.push(`%  => ${st}${results.reason?.[i] ? ` — ${results.reason[i]}` : ''}`);
  });
  return out.join('\n');
}

export function ExecutionReplay({
  form,
  responses,
  results,
  contextLabel,
}: {
  form: any;
  responses: Record<string, any>;
  results: Result;
  contextLabel?: string;
}) {
  const timeline = useMemo(() => buildTimeline(form, responses, results), [form, responses, results]);
  const [shown, setShown] = useState(0);
  const bodyRef = useRef<HTMLDivElement>(null);
  const reduced = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    setShown(reduced ? timeline.length : 0);
  }, [timeline, reduced]);

  useEffect(() => {
    if (shown >= timeline.length) return;
    const t = setTimeout(() => setShown((s) => s + 1), timeline[shown]?.delay ?? 40);
    return () => clearTimeout(t);
  }, [shown, timeline]);

  useEffect(() => {
    const el = bodyRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [shown]);

  const running = shown < timeline.length;

  const download = () => {
    const blob = new Blob([programText(form, responses, results)], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(contextLabel || 'validation').replace(/[^\w.-]+/g, '_')}.pl`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <TerminalPanel
      title={`execution${contextLabel ? ` — ${contextLabel}` : ''}`}
      status={
        <span className="flex items-center gap-3">
          {running ? (
            <button type="button" onClick={() => setShown(timeline.length)} className="underline-offset-2 hover:underline" style={{ color: TERM.dim }}>
              skip ≫
            </button>
          ) : (
            <button type="button" onClick={() => setShown(0)} className="underline-offset-2 hover:underline" style={{ color: TERM.dim }}>
              replay ↻
            </button>
          )}
          <button type="button" onClick={download} className="underline-offset-2 hover:underline" style={{ color: TERM.dim }}>
            ↓ program.pl
          </button>
        </span>
      }
    >
      <div ref={bodyRef} className="max-h-[26rem] overflow-y-auto px-4 py-3 text-[12.5px] leading-[1.85]">
        <pre className="whitespace-pre-wrap break-words" style={{ fontFamily: 'inherit' }}>
          {timeline.slice(0, shown).map((e, i) => (
            <div key={i} className="term-in" style={{ color: e.color, paddingLeft: e.indent ? '1.5rem' : 0 }}>
              {e.text}
            </div>
          ))}
          {running && <span className="term-blink inline-block h-[1.02em] w-[0.55em]" style={{ background: TERM.green }} />}
        </pre>
      </div>
    </TerminalPanel>
  );
}
