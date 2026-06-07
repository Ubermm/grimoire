'use client';
import Link from 'next/link';
import { ShieldCheck, FileText, ListChecks, ScrollText, Workflow } from 'lucide-react';
import { RiskBadge } from './RiskBadge';
import { Surface } from './ui';
import { EvidenceExport } from './EvidenceExport';
import { completionPercentage } from '@/lib/ai-act/annex-iv-sections';

export function SystemDossier({ system }: { system: any }) {
  const techPct = completionPercentage(system.technicalDocumentation);
  const basis: string[] = system.classificationBasis || [];
  const obligations: string[] = system.article50Obligations || [];
  const validations: any[] = system.validationResults || [];

  return (
    <div className="space-y-6">
      {/* Header card */}
      <Surface className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-semibold text-neutral-900">{system.name}</h2>
              <RiskBadge level={system.riskLevel} />
              {system.isGPAI && <span className="rounded bg-violet-50 px-2 py-0.5 text-xs font-medium text-violet-600">GPAI</span>}
            </div>
            {system.description && <p className="mt-2 max-w-2xl text-sm text-neutral-500">{system.description}</p>}
            <p className="mt-3 text-xs text-neutral-400">
              {system.provider ? `Provider: ${system.provider} · ` : ''}Role: <span className="capitalize">{system.role || 'provider'}</span>
            </p>
          </div>
          <EvidenceExport system={system} />
        </div>

        {basis.length > 0 && (
          <div className="mt-5 rounded-lg border border-neutral-100 bg-neutral-50/60 p-4">
            <p className="mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-neutral-400">
              <ShieldCheck className="h-3.5 w-3.5" /> Classification basis
            </p>
            <ul className="space-y-1.5 text-sm text-neutral-600">
              {basis.map((b, i) => <li key={i} className="flex gap-2"><span className="text-[#10A37F]">•</span>{b}</li>)}
            </ul>
          </div>
        )}
      </Surface>

      {/* Quick actions */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <DossierAction href={`/ai-act/classify?system=${system._id}`} icon={<Workflow className="h-4 w-4" />} label="Re-classify risk" />
        <DossierAction href={`/ai-act/screen/article-5?system=${system._id}`} icon={<ListChecks className="h-4 w-4" />} label="Article 5 screening" />
        <DossierAction href={`/ai-act/annex-iv/${system._id}`} icon={<FileText className="h-4 w-4" />} label={`Annex IV · ${techPct}%`} />
        <DossierAction href={`/ai-act/audit?system=${system._id}`} icon={<ScrollText className="h-4 w-4" />} label="Run full audit" />
      </div>

      {/* Article 50 obligations */}
      {obligations.length > 0 && (
        <Surface className="p-6">
          <p className="mb-3 text-sm font-medium text-neutral-900">Article 50 transparency obligations</p>
          <ul className="space-y-1.5 text-sm text-neutral-600">
            {obligations.map((o, i) => <li key={i} className="flex gap-2"><span className="text-blue-500">•</span>{o}</li>)}
          </ul>
        </Surface>
      )}

      {/* Validation history */}
      <Surface className="p-6">
        <p className="mb-3 text-sm font-medium text-neutral-900">Validation results</p>
        {validations.length === 0 ? (
          <p className="text-sm text-neutral-400">No validations recorded yet. Run a screening or audit to populate this.</p>
        ) : (
          <div className="space-y-3">
            {validations.map((v, i) => {
              const passedCount = (v.passed || []).filter(Boolean).length;
              const total = (v.passed || []).length;
              return (
                <div key={i} className="flex items-center justify-between rounded-lg border border-neutral-100 px-4 py-2.5">
                  <span className="font-mono text-xs text-neutral-500">{v.formCode}</span>
                  <span className={passedCount === total ? 'text-sm font-medium text-emerald-600' : 'text-sm font-medium text-amber-600'}>
                    {passedCount}/{total} passed
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </Surface>
    </div>
  );
}

function DossierAction({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link href={href} className="flex items-center gap-2.5 rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm font-medium text-neutral-700 shadow-sm transition-colors hover:border-neutral-300 hover:bg-neutral-50">
      <span className="text-[#10A37F]">{icon}</span>
      {label}
    </Link>
  );
}
