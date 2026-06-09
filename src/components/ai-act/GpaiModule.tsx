'use client';
import { Surface } from './ui';
import { LeanValidateFlow } from './LeanValidateFlow';

const PILLARS = [
  { title: 'Transparency', desc: 'Technical documentation (Annex XI) and downstream-provider information (Annex XII).' },
  { title: 'Copyright', desc: 'A policy to comply with Union copyright law and a public training-content summary.' },
  { title: 'Safety & security', desc: 'Systemic-risk models only: safety framework, adversarial testing, incident reporting.' },
];

export function GpaiModule({ systemId }: { systemId?: string }) {
  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-3">
        {PILLARS.map((p, i) => (
          <Surface key={p.title} className="p-5">
            <span className="font-accent text-[0.78rem] text-[var(--ink-faint)]">{String(i + 1).padStart(2, '0')}</span>
            <p className="mt-3 font-medium text-[var(--ink)]">{p.title}</p>
            <p className="mt-1 text-sm text-[var(--ink-muted)]">{p.desc}</p>
          </Surface>
        ))}
      </div>
      <LeanValidateFlow formCode="AIACT_GPAI_CH1" systemId={systemId} />
    </div>
  );
}
