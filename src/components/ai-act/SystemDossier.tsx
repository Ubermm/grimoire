'use client';
import Link from 'next/link';
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
              <h2 className="text-xl text-[var(--ink)]">{system.name}</h2>
              <RiskBadge level={system.riskLevel} />
              {system.isGPAI && <span className="font-accent rounded-[2px] bg-violet-50 px-2 py-0.5 text-xs font-medium text-violet-600">GPAI</span>}
            </div>
            {system.description && <p className="mt-2 max-w-2xl text-sm text-[var(--ink-muted)]">{system.description}</p>}
            <p className="font-accent mt-3 text-xs text-[var(--ink-faint)]">
              {system.provider ? `Provider: ${system.provider} · ` : ''}Role: <span className="capitalize">{system.role || 'provider'}</span>
            </p>
          </div>
          <EvidenceExport system={system} />
        </div>

        {basis.length > 0 && (
          <div className="mt-5 border border-[var(--line)] bg-[var(--acc-soft)]/60 p-4">
            <p className="font-accent mb-2 flex items-center gap-1.5 text-[0.68rem] font-medium uppercase tracking-[0.16em] text-[var(--ink-faint)]">
              <span aria-hidden>⊢</span> Classification basis
            </p>
            <ul className="space-y-1.5 text-sm text-[var(--ink-muted)]">
              {basis.map((b, i) => <li key={i} className="flex gap-2"><span className="text-[var(--acc)]">•</span>{b}</li>)}
            </ul>
          </div>
        )}
      </Surface>

      {/* Quick actions */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <DossierAction href={`/ai-act/classify?system=${system._id}`} index="01" label="Re-classify risk" />
        <DossierAction href={`/ai-act/screen/article-5?system=${system._id}`} index="02" label="Article 5 screening" />
        <DossierAction href={`/ai-act/annex-iv/${system._id}`} index="03" label={`Annex IV · ${techPct}%`} />
        <DossierAction href={`/ai-act/audit?system=${system._id}`} index="04" label="Run full audit" />
      </div>

      {/* Article 50 obligations */}
      {obligations.length > 0 && (
        <Surface className="p-6">
          <p className="font-accent mb-3 text-[0.72rem] font-medium uppercase tracking-[0.16em] text-[var(--ink)]">Article 50 transparency obligations</p>
          <ul className="space-y-1.5 text-sm text-[var(--ink-muted)]">
            {obligations.map((o, i) => <li key={i} className="flex gap-2"><span className="text-blue-500">•</span>{o}</li>)}
          </ul>
        </Surface>
      )}

      {/* Validation history */}
      <Surface className="p-6">
        <p className="font-accent mb-3 text-[0.72rem] font-medium uppercase tracking-[0.16em] text-[var(--ink)]">Validation results</p>
        {validations.length === 0 ? (
          <p className="text-sm text-[var(--ink-faint)]">No validations recorded yet. Run a screening or audit to populate this.</p>
        ) : (
          <div className="space-y-3">
            {validations.map((v, i) => {
              const passedCount = (v.passed || []).filter(Boolean).length;
              const total = (v.passed || []).length;
              return (
                <div key={i} className="flex items-center justify-between border border-[var(--line)] px-4 py-2.5">
                  <span className="font-accent text-xs text-[var(--ink-muted)]">{v.formCode}</span>
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

function DossierAction({ href, index, label }: { href: string; index: string; label: string }) {
  return (
    <Link href={href} className="group flex items-center gap-2.5 border border-[var(--line)] bg-[var(--surface)] px-4 py-3 text-sm font-medium text-[var(--ink)] transition-colors hover:border-[var(--ink)]">
      <span className="font-accent text-[0.72rem] text-[var(--ink-faint)]">{index}</span>
      {label}
      <span className="font-accent ml-auto text-[var(--ink-faint)] opacity-0 transition-opacity group-hover:opacity-100" aria-hidden>→</span>
    </Link>
  );
}
