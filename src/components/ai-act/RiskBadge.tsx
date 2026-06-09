'use client';
import { RISK_LEVELS, type RiskLevel } from '@/lib/ai-act/constants';
import { cn } from '@/lib/utils';

export function RiskBadge({ level, className }: { level: RiskLevel; className?: string }) {
  const meta = RISK_LEVELS[level] || RISK_LEVELS.unclassified;
  return (
    <span className={cn('font-accent inline-flex items-center rounded-[2px] px-2.5 py-0.5 text-[0.68rem] font-medium uppercase tracking-[0.08em]', meta.badge, className)}>
      {meta.label}
    </span>
  );
}
