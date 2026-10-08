'use client';

import { useInsured } from '@/api/queries';
import { Kpi } from '@/components/ui/Kpi';
import { Loader } from '@/components/ui/Loader';
import { PageHead } from '@/components/ui/PageHead';
import { BasisMixCard } from './BasisMixCard';
import { ConflictsCard } from './ConflictsCard';
import { InsuredPicker } from './InsuredPicker';
import { ReconciliationCard } from './ReconciliationCard';
import { useViewer } from './useViewer';

/** Can these numbers be trusted? Evidence coverage, completeness, conflicts and unknown calling systems. */
export function IntegrityScreen() {
  const { insuredId, eyebrow } = useViewer();
  const insured = useInsured(insuredId);
  return (
    <>
      <PageHead eyebrow={eyebrow} title="Data Integrity" sub="Can these numbers be trusted? CiV never takes a statement as a measurement, and checks totals against sources the company does not control.">
        <InsuredPicker />
      </PageHead>
      <Loader query={insured}>
        {(i) => (
          <div className="flex flex-col gap-5">
            <div className="note-box" role="note"><strong>Unverified counts as worst case.</strong> A field CiV cannot verify takes its pessimistic value. What the company states can lower a score, never raise it.</div>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <Kpi tag="Evidence coverage" value={`${Math.round(i.coverage * 100)}%`} foot={i.coverage < 0.6 ? 'Below 60%: grade capped at C' : 'Share of the score backed by records, tests or third parties'} />
              <Kpi tag="Records completeness" value={i.completeness === null ? '—' : i.completeness.toFixed(2)} foot={i.completeness === null ? 'No contact logs: outside-in only' : 'Logs ÷ invoices; below 0.9 flags the period'} />
              <Kpi tag="Statement conflicts" value={String(i.conflicts.length)} foot="Stated vs observed" />
              <Kpi tag="Unknown caller IDs" value={i.unknownCallerIds === null ? '—' : String(i.unknownCallerIds)} foot="Calling on the brand, not in any connected system" />
            </div>
            <div className="grid gap-5 lg:grid-cols-2">
              <BasisMixCard insured={i} />
              <ConflictsCard insured={i} />
            </div>
            <ReconciliationCard insured={i} />
          </div>
        )}
      </Loader>
    </>
  );
}
