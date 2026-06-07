'use client';
import { FileText, Copyright, ShieldAlert } from 'lucide-react';
import { Surface } from './ui';
import { LeanValidateFlow } from './LeanValidateFlow';

const PILLARS = [
  { icon: FileText, title: 'Transparency', desc: 'Technical documentation (Annex XI) and downstream-provider information (Annex XII).' },
  { icon: Copyright, title: 'Copyright', desc: 'A policy to comply with Union copyright law and a public training-content summary.' },
  { icon: ShieldAlert, title: 'Safety & security', desc: 'Systemic-risk models only: safety framework, adversarial testing, incident reporting.' },
];

export function GpaiModule({ systemId }: { systemId?: string }) {
  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-3">
        {PILLARS.map((p) => (
          <Surface key={p.title} className="p-5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#10A37F]/10 text-[#10A37F]"><p.icon className="h-5 w-5" /></div>
            <p className="mt-3 font-medium text-neutral-900">{p.title}</p>
            <p className="mt-1 text-sm text-neutral-500">{p.desc}</p>
          </Surface>
        ))}
      </div>
      <LeanValidateFlow formCode="AIACT_GPAI_CH1" systemId={systemId} />
    </div>
  );
}
