'use client';

import { useRegChanges, useSession } from '@/api/queries';
import { Loader } from '@/components/ui/Loader';
import { PageHead } from '@/components/ui/PageHead';
import { ChangeCard } from './ChangeCard';
import { SuggestChange } from './SuggestChange';
import { useMonth } from '@/state/PortalContext';

export function RegulatoryScreen() {
  const changes = useRegChanges(useMonth());
  const session = useSession().data;
  const readOnly = session?.view === 'underwriter';
  // Only the company's lawyer reviews drafts and suggests changes; CiV alone approves.
  const lawyer = Boolean(session?.isCounsel) && !readOnly;
  return (
    <>
      <PageHead eyebrow="Engagement" title="Regulatory Changes" sub="Only the rule changes that touch your states, channels and settings. Stated as fact; how to respond is for you and your counsel." />
      <Loader query={changes}>
        {(list) => (
          <div className="flex flex-col gap-4">
            {[...list].sort((a, b) => Number(a.confirmed) - Number(b.confirmed) || b.date.localeCompare(a.date)).map((c) => <ChangeCard key={c.id} change={c} canReview={lawyer} readOnly={readOnly} />)}
            {lawyer && <SuggestChange />}
            <p className="tiny m-0">A new rule value is used only after CiV approves it, from its start date. Your lawyer can review drafts; until CiV decides, checks keep using the value in force, or do not run.</p>
          </div>
        )}
      </Loader>
    </>
  );
}
