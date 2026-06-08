// FDA audits dashboard. The legacy monolithic <Audit /> flow (src/components/
// Audit.tsx) is retired in favour of this lean, light multi-route flow; the old
// component is left inert in the repo for reference.
import { AuditList } from '@/components/fda-audit/AuditList';

export default function AuditPage() {
  return <AuditList />;
}
