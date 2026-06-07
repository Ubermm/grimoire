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
          <tr className="border-b border-neutral-200 text-left text-xs uppercase tracking-wide text-neutral-400">
            <th className="px-5 py-3 font-medium">System</th>
            <th className="px-5 py-3 font-medium">Provider</th>
            <th className="px-5 py-3 font-medium">Risk level</th>
            <th className="px-5 py-3 font-medium">Status</th>
            <th className="px-5 py-3" />
          </tr>
        </thead>
        <tbody>
          {systems.map((s) => (
            <tr key={s._id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50/60">
              <td className="px-5 py-3.5">
                <Link href={`/ai-act/registry/${s._id}`} className="font-medium text-neutral-900 hover:text-[var(--acc)]">
                  {s.name}
                </Link>
                {s.isGPAI && <span className="ml-2 rounded bg-violet-50 px-1.5 py-0.5 text-[10px] font-medium text-violet-600">GPAI</span>}
              </td>
              <td className="px-5 py-3.5 text-neutral-500">{s.provider || '—'}</td>
              <td className="px-5 py-3.5"><RiskBadge level={s.riskLevel} /></td>
              <td className="px-5 py-3.5 capitalize text-neutral-500">{s.status || 'draft'}</td>
              <td className="px-5 py-3.5 text-right">
                <div className="flex items-center justify-end gap-1.5">
                  {onDelete && (
                    <button
                      onClick={() => onDelete(s._id)}
                      className="rounded p-1.5 text-neutral-300 transition-colors hover:bg-red-50 hover:text-red-500"
                      aria-label="Delete system"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                  <Link href={`/ai-act/registry/${s._id}`} className="rounded p-1.5 text-neutral-300 hover:text-neutral-600">
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
