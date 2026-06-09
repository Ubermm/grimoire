'use client';
import { Surface } from './ui';

export function CrossRegulationView({ result }: { result: any }) {
  if (!result) return null;
  return (
    <div className="space-y-6">
      {result.summary && (
        <Surface className="p-6">
          <p className="font-accent text-[0.72rem] font-medium uppercase tracking-[0.16em] text-[var(--ink-faint)]">Summary</p>
          <p className="mt-2 text-sm leading-relaxed text-[var(--ink)]">{result.summary}</p>
        </Surface>
      )}

      {Array.isArray(result.overlaps) && result.overlaps.length > 0 && (
        <Surface className="overflow-hidden">
          <p className="font-accent border-b border-[var(--line)] px-5 py-3 text-[0.72rem] font-medium uppercase tracking-[0.16em] text-[var(--ink)]">Overlapping requirements</p>
          <table className="w-full text-sm">
            <thead>
              <tr className="font-accent text-left text-[0.68rem] uppercase tracking-[0.12em] text-[var(--ink-faint)]">
                <th className="px-5 py-2.5 font-medium">Topic</th>
                <th className="px-5 py-2.5 font-medium">FDA 21 CFR</th>
                <th className="px-5 py-2.5 font-medium">EU AI Act</th>
                <th className="px-5 py-2.5 font-medium">Satisfies both</th>
              </tr>
            </thead>
            <tbody>
              {result.overlaps.map((o: any, i: number) => (
                <tr key={i} className="border-t border-[var(--line)] align-top">
                  <td className="px-5 py-3 font-medium text-[var(--ink)]">{o.topic}</td>
                  <td className="font-accent px-5 py-3 text-xs text-[var(--ink-muted)]">{o.fda}</td>
                  <td className="font-accent px-5 py-3 text-xs text-[var(--ink-muted)]">{o.aiAct}</td>
                  <td className="px-5 py-3 text-[var(--ink-muted)]">{o.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Surface>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <Surface className="p-6">
          <p className="font-accent mb-3 flex items-center gap-2 text-[0.72rem] font-medium uppercase tracking-[0.16em] text-[var(--ink)]"><span>🇺🇸</span> FDA-only requirements</p>
          <ul className="space-y-2 text-sm">
            {(result.fdaOnly || []).map((r: any, i: number) => (
              <li key={i} className="text-[var(--ink-muted)]"><span className="font-accent text-xs text-[var(--ink-faint)]">{r.reference}</span> — {r.requirement}</li>
            ))}
            {(!result.fdaOnly || result.fdaOnly.length === 0) && <li className="text-[var(--ink-faint)]">None identified.</li>}
          </ul>
        </Surface>
        <Surface className="p-6">
          <p className="font-accent mb-3 flex items-center gap-2 text-[0.72rem] font-medium uppercase tracking-[0.16em] text-[var(--ink)]"><span>🇪🇺</span> AI Act-only requirements</p>
          <ul className="space-y-2 text-sm">
            {(result.aiActOnly || []).map((r: any, i: number) => (
              <li key={i} className="text-[var(--ink-muted)]"><span className="font-accent text-xs text-[var(--ink-faint)]">{r.reference}</span> — {r.requirement}</li>
            ))}
            {(!result.aiActOnly || result.aiActOnly.length === 0) && <li className="text-[var(--ink-faint)]">None identified.</li>}
          </ul>
        </Surface>
      </div>
    </div>
  );
}
