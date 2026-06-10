//@ts-nocheck
'use client';
// The engine's voice: green phosphor on black, embedded in the daylight
// product pages. TerminalPanel is the chrome; PrologView renders the ACTUAL
// program /api/validate assembles (same substitution rules — {i} placeholders,
// REPLACE_FOR_BACKSLASH, quote mapping), live against the user's answers.
// Nothing here is a mock: what you see is what the engine runs.
import React, { useMemo } from 'react';
import { cn } from '@/lib/utils';

export const TERM = {
  bg: '#060807',
  line: '#1c3527',
  green: '#4ade80',
  bright: '#86efac',
  dim: 'rgba(74,222,128,0.62)',
  faint: 'rgba(74,222,128,0.36)',
  user: '#e8e6e1',
  warn: '#fbbf24',
};

export function TerminalPanel({
  title,
  status,
  children,
  className = '',
}: {
  title: string;
  status?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn('overflow-hidden border bg-[#060807] text-[#4ade80]', className)}
      style={{ borderColor: TERM.line, fontFamily: 'var(--font-plex-mono), ui-monospace, SFMono-Regular, Menlo, monospace' }}
    >
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-b px-4 py-2" style={{ borderColor: TERM.line }}>
        <span className="text-[0.68rem] uppercase tracking-[0.22em]" style={{ color: TERM.dim }}>{title}</span>
        {status && <span className="text-[0.68rem] tracking-[0.08em]" style={{ color: TERM.faint }}>{status}</span>}
      </div>
      <div className="relative">
        {/* faint CRT scanlines */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              'repeating-linear-gradient(0deg, rgba(134,239,172,0.035) 0px, rgba(134,239,172,0.035) 1px, transparent 1px, transparent 3px)',
          }}
        />
        {children}
      </div>
    </div>
  );
}

export function Caret({ className = '' }) {
  return (
    <span
      aria-hidden
      className={cn('term-blink inline-block h-[1.02em] w-[0.55em] translate-y-[0.15em]', className)}
      style={{ background: TERM.green }}
    />
  );
}

/* ----------------------------------------------------- program assembly */
// Mirrors convertToPrologValue in /api/validate exactly.
export function convertToPrologValue(value: string, type: string): string {
  switch (type) {
    case 'BOOLEAN':
      return value.toLowerCase() === 'true' ? 'true' : 'false';
    case 'NUMERIC':
      return value;
    case 'SELECT':
    case 'TEXT':
      return `'${value.replace(/'/g, "\\'")}'`;
    case 'CHECKBOX':
      return `[${value.split(',').map((v) => `'${v.trim().replace(/'/g, "\\'")}'`).join(', ')}]`;
    default:
      return `'${value.replace(/'/g, "\\'")}'`;
  }
}

// Substitute {i} placeholders; answered values are wrapped in \u0000…\u0001
// sentinels so the renderer can tint them as the user's asserted facts.
function substitute(template: string, form: any, responses: Record<string, any>) {
  const t = template.replaceAll('REPLACE_FOR_BACKSLASH', '\\').replaceAll('"', "'");
  return t.replace(/\{(\d+)\}/g, (_, m) => {
    const qi = parseInt(m, 10) - 1;
    const q = form.questions?.[qi];
    const v = q ? responses?.[q.id] : null;
    if (q && v != null && v !== '' && v !== 'Does not apply') {
      return `\u0000${convertToPrologValue(String(v), q.type)}\u0001`;
    }
    return `{${m}}`;
  });
}

type ProgLine = { kind: 'comment' | 'code' | 'query'; text: string; pending?: boolean };

export function buildProgramLines(form: any, responses: Record<string, any>): ProgLine[] {
  const lines: ProgLine[] = [];
  if (!form?.questions) return lines;

  lines.push({ kind: 'comment', text: '% facts — asserted from your answers' });
  (form.facts || []).forEach((fact: any) => {
    const sub = substitute(fact.template, form, responses);
    for (const part of sub.split('\n')) {
      lines.push({ kind: 'code', text: part, pending: /\{\d+\}/.test(part) });
    }
  });

  if ((form.validations || []).length) {
    lines.push({ kind: 'comment', text: '% the regulation, compiled' });
    (form.validations || []).forEach((v: any) => {
      const rule = v.rule.replaceAll('REPLACE_FOR_BACKSLASH', '\\').replaceAll('"', "'");
      for (const part of rule.split('\n')) lines.push({ kind: 'code', text: part });
    });
  }

  lines.push({ kind: 'comment', text: '% queries — the verdicts to derive' });
  (form.queries || []).forEach((q: any) => {
    const text = substitute(q.query, form, responses).replace(/^\s*\?-\s*/, '');
    lines.push({ kind: 'query', text, pending: /\{\d+\}/.test(text) });
  });

  return lines;
}

// One line, sentinel-aware: \u0000value\u0001 spans render in bone-white.
function Segs({ text, base }: { text: string; base: string }) {
  const parts = text.split(/([\u0000\u0001])/);
  let inVal = false;
  return (
    <>
      {parts.map((p, i) => {
        if (p === '\u0000') { inVal = true; return null; }
        if (p === '\u0001') { inVal = false; return null; }
        if (!p) return null;
        return (
          <span key={i} style={{ color: inVal ? TERM.user : base }}>{p}</span>
        );
      })}
    </>
  );
}

export function PrologView({
  form,
  responses,
  className = '',
}: {
  form: any;
  responses: Record<string, any>;
  className?: string;
}) {
  const lines = useMemo(() => buildProgramLines(form, responses), [form, responses]);
  return (
    <pre className={cn('overflow-x-auto p-4 text-[12.5px] leading-[1.85]', className)} style={{ color: TERM.green }}>
      {lines.map((l, i) => (
        <div key={i} style={{ opacity: l.pending ? 0.42 : 1 }}>
          {l.kind === 'comment' ? (
            <span style={{ color: TERM.faint }}>{l.text}</span>
          ) : l.kind === 'query' ? (
            <>
              <span style={{ color: TERM.faint }}>?- </span>
              <Segs text={l.text} base={TERM.bright} />
            </>
          ) : (
            <Segs text={l.text} base={TERM.green} />
          )}
        </div>
      ))}
    </pre>
  );
}
