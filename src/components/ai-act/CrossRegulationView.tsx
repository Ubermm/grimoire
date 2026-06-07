'use client';
import { Surface } from './ui';

export function CrossRegulationView({ result }: { result: any }) {
  if (!result) return null;
  return (
    <div className="space-y-6">
      {result.summary && (
        <Surface className="p-6">
          <p className="text-xs font-medium uppercase tracking-wide text-neutral-400">Summary</p>
          <p className="mt-2 text-sm leading-relaxed text-neutral-700">{result.summary}</p>
        </Surface>
      )}

      {Array.isArray(result.overlaps) && result.overlaps.length > 0 && (
        <Surface className="overflow-hidden">
          <p className="border-b border-neutral-100 px-5 py-3 text-sm font-semibold text-neutral-900">Overlapping requirements</p>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-neutral-400">
                <th className="px-5 py-2.5 font-medium">Topic</th>
                <th className="px-5 py-2.5 font-medium">FDA 21 CFR</th>
                <th className="px-5 py-2.5 font-medium">EU AI Act</th>
                <th className="px-5 py-2.5 font-medium">Satisfies both</th>
              </tr>
            </thead>
            <tbody>
              {result.overlaps.map((o: any, i: number) => (
                <tr key={i} className="border-t border-neutral-100 align-top">
                  <td className="px-5 py-3 font-medium text-neutral-800">{o.topic}</td>
                  <td className="px-5 py-3 font-mono text-xs text-neutral-500">{o.fda}</td>
                  <td className="px-5 py-3 font-mono text-xs text-neutral-500">{o.aiAct}</td>
                  <td className="px-5 py-3 text-neutral-600">{o.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Surface>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <Surface className="p-6">
          <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-neutral-900"><span>🇺🇸</span> FDA-only requirements</p>
          <ul className="space-y-2 text-sm">
            {(result.fdaOnly || []).map((r: any, i: number) => (
              <li key={i} className="text-neutral-600"><span className="font-mono text-xs text-neutral-400">{r.reference}</span> — {r.requirement}</li>
            ))}
            {(!result.fdaOnly || result.fdaOnly.length === 0) && <li className="text-neutral-400">None identified.</li>}
          </ul>
        </Surface>
        <Surface className="p-6">
          <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-neutral-900"><span>🇪🇺</span> AI Act-only requirements</p>
          <ul className="space-y-2 text-sm">
            {(result.aiActOnly || []).map((r: any, i: number) => (
              <li key={i} className="text-neutral-600"><span className="font-mono text-xs text-neutral-400">{r.reference}</span> — {r.requirement}</li>
            ))}
            {(!result.aiActOnly || result.aiActOnly.length === 0) && <li className="text-neutral-400">None identified.</li>}
          </ul>
        </Surface>
      </div>
    </div>
  );
}
