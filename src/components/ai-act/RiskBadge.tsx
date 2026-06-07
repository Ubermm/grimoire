'use client';
import { RISK_LEVELS, type RiskLevel } from '@/lib/ai-act/constants';
import { cn } from '@/lib/utils';

export function RiskBadge({ level, className }: { level: RiskLevel; className?: string }) {
  const meta = RISK_LEVELS[level] || RISK_LEVELS.unclassified;
  return (
    <span className={cn('inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium', meta.badge, className)}>
      {meta.label}
    </span>
  );
}
