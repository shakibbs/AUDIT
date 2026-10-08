'use client';

import { useActions, useAlerts, useConsent, useHealth, useMetrics, useScore, useSession } from '@/api/queries';
import { Loader } from '@/components/ui/Loader';
import { PageHead } from '@/components/ui/PageHead';
import { SectionTitle } from '@/components/ui/SectionTitle';
import { StatusMixCard } from '@/screens/consent/StatusMixCard';
import { usePortal } from '@/state/PortalContext';
import { DataHealthCard } from './DataHealthCard';
import { FamilyScores } from './FamilyScores';
import { KeyNumbers } from './KeyNumbers';
import { ScoreCard } from './ScoreCard';
import { ScoreTrendCard } from './ScoreTrendCard';
import { TopActions } from './TopActions';
import { UrgentAlertsCard } from './UrgentAlertsCard';

/** The dashboard: consent and domains and data health first, then the score, what needs attention, and the key numbers. */
export function OverviewScreen() {
  const { period } = usePortal();
  const score = useScore(period);
  const metrics = useMetrics(period);
  const actions = useActions();
  const alerts = useAlerts();
  const consent = useConsent();
  const health = useHealth();
  const months = useSession().data?.periods ?? [];
  const index = Math.max(0, months.findIndex((p) => p.id === period));
  const since = months[index + 1]?.label.slice(0, 3) ?? 'last month';
  return (
    <>
      <PageHead eyebrow="Your position" title="Overview" sub="Where your calling and texting records stand this month, what needs attention, and how complete the data is." />
      <Loader query={score}>
        {(s) => (
          <div className="flex flex-col gap-5">
            <section>
              <SectionTitle title="Consent and domains" sub="Permission on record, and the six families of checks" />
              <div className="grid gap-5 lg:grid-cols-2">
                {consent.data && <StatusMixCard consent={consent.data} />}
                <FamilyScores score={s} />
              </div>
            </section>

            {health.data && (
              <section>
                <SectionTitle title="Data health" sub="Is the data behind these numbers connected and complete?" />
                <DataHealthCard health={health.data} />
              </section>
            )}
            <section>
              <SectionTitle title="Where you stand" sub="Score, what limits it, and how it moved" />
              <div className="grid items-stretch gap-5 lg:grid-cols-3">
                <ScoreCard score={s} />
                <ScoreTrendCard score={s} />
              </div>
            </section>

            <section>
              <SectionTitle title="Needs attention" sub="Most urgent first" />
              <div className="grid gap-5 lg:grid-cols-2">
                {alerts.data && <UrgentAlertsCard alerts={alerts.data} />}
                {actions.data && <TopActions actions={actions.data} />}
              </div>
            </section>

            <section>
              <SectionTitle title="Key numbers" sub="Select a number for its detail" />
              {metrics.data && <KeyNumbers metrics={metrics.data} health={health.data} since={since} />}
            </section>

          </div>
        )}
      </Loader>
    </>
  );
}
