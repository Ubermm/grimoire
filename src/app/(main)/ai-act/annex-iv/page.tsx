'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { PageHeader, Surface, Spinner, EmptyState, AccentButton } from '@/components/ai-act/ui';
import { RiskBadge } from '@/components/ai-act/RiskBadge';
import { completionPercentage } from '@/lib/ai-act/annex-iv-sections';

export default function AnnexIVIndex() {
  const [systems, setSystems] = useState<any[] | null>(null);
  useEffect(() => { fetch('/api/ai-act/systems').then(async (r) => setSystems(r.ok ? await r.json() : [])); }, []);

  return (
    <>
      <PageHeader title="Annex IV — Technical documentation" subtitle="Select a system to build or continue its 9-section technical file." />
      {systems === null ? (
        <div className="flex justify-center py-16"><Spinner className="h-6 w-6 text-neutral-400" /></div>
      ) : systems.length === 0 ? (
        <EmptyState title="No AI systems yet" hint="Register a system first." action={<Link href="/ai-act/registry"><AccentButton>Go to registry</AccentButton></Link>} />
      ) : (
        <div className="space-y-3">
          {systems.map((s) => {
            const pct = completionPercentage(s.technicalDocumentation);
            return (
              <Link key={s._id} href={`/ai-act/annex-iv/${s._id}`}>
                <Surface className="flex items-center justify-between p-5 transition-colors hover:border-[var(--ink)]">
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-[var(--ink)]">{s.name}</span>
                    <RiskBadge level={s.riskLevel} />
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-accent text-sm tabular-nums text-[var(--ink-muted)]">{pct}% complete</span>
                    <ChevronRight className="h-4 w-4 text-[var(--ink-faint)]" />
                  </div>
                </Surface>
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
}
