'use client';
import Link from 'next/link';
import { ChevronRight, Trash2 } from 'lucide-react';
import { RiskBadge } from './RiskBadge';
import { Surface } from './ui';

interface SystemRow {
  _id: string;
  name: string;
  provider?: string;
  role?: string;
  isGPAI?: boolean;
  riskLevel: any;
  status?: string;
}

export function SystemRegistryTable({ systems, onDelete }: { systems: SystemRow[]; onDelete?: (id: string) => void }) {
  return (
    <Surface className="overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="font-accent border-b border-[var(--line-strong)] text-left text-[0.68rem] uppercase tracking-[0.12em] text-[var(--ink-faint)]">
            <th className="px-5 py-3 font-medium">System</th>
            <th className="px-5 py-3 font-medium">Provider</th>
            <th className="px-5 py-3 font-medium">Risk level</th>
            <th className="px-5 py-3 font-medium">Status</th>
            <th className="px-5 py-3" />
          </tr>
        </thead>
        <tbody>
          {systems.map((s) => (
            <tr key={s._id} className="border-b border-[var(--line)] last:border-0 hover:bg-black/[0.015]">
              <td className="px-5 py-3.5">
                <Link href={`/ai-act/registry/${s._id}`} className="font-medium text-[var(--ink)] hover:text-[var(--acc-hover)]">
                  {s.name}
                </Link>
                {s.isGPAI && <span className="font-accent ml-2 rounded-[2px] bg-violet-50 px-1.5 py-0.5 text-[10px] font-medium text-violet-600">GPAI</span>}
              </td>
              <td className="px-5 py-3.5 text-[var(--ink-muted)]">{s.provider || '—'}</td>
              <td className="px-5 py-3.5"><RiskBadge level={s.riskLevel} /></td>
              <td className="px-5 py-3.5 capitalize text-[var(--ink-muted)]">{s.status || 'draft'}</td>
              <td className="px-5 py-3.5 text-right">
                <div className="flex items-center justify-end gap-1.5">
                  {onDelete && (
                    <button
                      onClick={() => onDelete(s._id)}
                      className="p-1.5 text-[var(--ink-faint)] transition-colors hover:bg-red-50 hover:text-red-500"
                      aria-label="Delete system"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                  <Link href={`/ai-act/registry/${s._id}`} className="p-1.5 text-[var(--ink-faint)] hover:text-[var(--ink)]">
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Surface>
  );
}
