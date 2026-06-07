import { Boxes, Workflow, ShieldAlert, Eye, Cpu, FileText, ScrollText, PenSquare, GitCompare } from 'lucide-react';
import { PageHeader, EntryCard } from '@/components/ai-act/ui';

export default function AIActHub() {
  return (
    <>
      <PageHeader
        title="EU AI Act compliance"
        subtitle="Classify, screen, document and formally verify your AI systems against Regulation (EU) 2024/1689 — proofs, not checklists."
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <EntryCard href="/ai-act/registry" icon={<Boxes className="h-5 w-5" />} title="AI system registry" desc="Inventory your AI systems and track compliance status." />
        <EntryCard href="/ai-act/classify" icon={<Workflow className="h-5 w-5" />} title="Risk classification" desc="Determine prohibited / high-risk / GPAI / limited / minimal — verified in Prolog." />
        <EntryCard href="/ai-act/screen/article-5" icon={<ShieldAlert className="h-5 w-5" />} title="Article 5 screening" desc="Check for prohibited AI practices." />
        <EntryCard href="/ai-act/screen/article-50" icon={<Eye className="h-5 w-5" />} title="Article 50 transparency" desc="Disclosure & synthetic-content labelling obligations." />
        <EntryCard href="/ai-act/gpai" icon={<Cpu className="h-5 w-5" />} title="GPAI provider obligations" desc="Transparency, copyright & training-data summary (Art. 53)." />
        <EntryCard href="/ai-act/annex-iv" icon={<FileText className="h-5 w-5" />} title="Annex IV documentation" desc="Build the 9-section technical file for high-risk systems." />
        <EntryCard href="/ai-act/audit" icon={<ScrollText className="h-5 w-5" />} title="Full AI Act audit" desc="Article-by-article audit with formal validation & report." />
        <EntryCard href="/ai-act/authoring" icon={<PenSquare className="h-5 w-5" />} title="Rule authoring" desc="LLM-generate a validation form for any article, then edit it." />
        <EntryCard href="/ai-act/cross-regulation" icon={<GitCompare className="h-5 w-5" />} title="Cross-regulation" desc="Where FDA 21 CFR and the AI Act overlap." />
      </div>
    </>
  );
}
