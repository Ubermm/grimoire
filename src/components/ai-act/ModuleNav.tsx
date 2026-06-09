'use client';
// EU AI Act instance of the shared ModuleNav (wordmark + section tabs).
import { ModuleNav as BaseModuleNav } from '@/components/module/ModuleNav';

const TABS = [
  { href: '/ai-act', label: 'Overview', exact: true },
  { href: '/ai-act/registry', label: 'Registry' },
  { href: '/ai-act/classify', label: 'Classify' },
  { href: '/ai-act/audit', label: 'Audit' },
  { href: '/ai-act/authoring', label: 'Authoring' },
  { href: '/ai-act/cross-regulation', label: 'Cross-reg' },
];

export function ModuleNav() {
  return (
    <BaseModuleNav
      wordmark={{ href: '/ai-act', icon: <span className="font-accent text-[0.8rem] leading-none" aria-hidden>§</span>, label: 'AI Act', suffix: 'Grimoire One' }}
      tabs={TABS}
    />
  );
}
