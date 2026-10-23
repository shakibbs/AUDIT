'use client';

import { useLeads, useProvenance } from '@/api/queries';
import { BarList } from '@/components/charts/BarList';
import { StackedBar } from '@/components/charts/StackedBar';
import { Card } from '@/components/ui/Card';
import { Kpi } from '@/components/ui/Kpi';
import { Loader } from '@/components/ui/Loader';
import { PageHead } from '@/components/ui/PageHead';
import { SectionTitle } from '@/components/ui/SectionTitle';
import { formatCount } from '@/lib/format';
import { useDrawer } from '@/state/DrawerContext';
import { LadderCard } from './LadderCard';
import { ProofRequestsCard } from './ProofRequestsCard';
import { TopSourcesCard } from './TopSourcesCard';
import { UntracedCard } from './UntracedCard';
import { UploadsCard } from './UploadsCard';

export function LeadsScreen() {
  const leads = useLeads();
  const provenance = useProvenance();
  const { open } = useDrawer();
  return (
    <>
      <PageHead eyebrow="Intelligence" title="Lead Provenance" sub="Where leads came from and what their records show. Signals describe the record; they are not a judgement about a lead or a vendor." />
      <div className="flex flex-col gap-5">
        <Loader query={leads}>
          {(l) => {
            const pct = (n: number) => `${formatCount(n)} · ${l.inspected ? ((n / l.inspected) * 100).toFixed(0) : 0}%`;
            const share = (n: number | null) => (n === null ? 'Not measured' : `${n.toFixed(1)}%`);
            return (
              <div className="flex flex-col gap-5">
                <div className="grid gap-4 sm:grid-cols-3">
                  <Kpi tag="Leads inspected" value={formatCount(l.inspected)} foot="Every lead delivered this period" />
                  <Kpi tag="Consent completeness" value={share(l.completeness)} foot="Leads whose consent record has every checklist item" onClick={() => open('metric', 'M28')} />
                  <Kpi tag="Page match" value={share(l.pageMatch)} foot="Certificate snapshot matches CiV’s page capture" onClick={() => open('metric', 'M27')} />
                </div>
                <Card title="Leads by signal level" sub="How many signals each lead record carries">
                  {l.few === null || l.some === null || l.high === null
                    ? <p className="m-0 text-[13px] text-txt-2"><span className="pill pill-gray mr-2">Not measured</span>Comes with lead inspection (signals read from each lead record).</p>
                    : <StackedBar height={22} label="Leads by signal level" segments={[
                      { label: 'Few signals (0–1)', value: l.few, color: 'var(--series-1)', display: pct(l.few) },
                      { label: 'Some signals (2–3)', value: l.some, color: 'var(--series-2)', display: pct(l.some) },
                      { label: 'High signals (4 or more)', value: l.high, color: 'var(--series-3)', display: pct(l.high) },
                    ]} />}
                </Card>
                <div className="grid gap-5 lg:grid-cols-2">
                  <Card title="Most frequent signals" sub="Leads carrying each signal">
                    {l.signals.length ? <BarList labelWidth={200} rows={l.signals.map((s) => ({ key: s.label, label: s.label, value: s.count, display: formatCount(s.count) }))} />
                      : <p className="m-0 text-[13px] text-txt-2"><span className="pill pill-gray mr-2">Not measured</span>Comes with lead inspection.</p>}
                  </Card>
                  <Card title="Most often missing" sub="Checklist items absent from the consent record">
                    {l.missing.length ? <BarList labelWidth={250} rows={l.missing.map((s) => ({ key: s.label, label: s.label, value: s.count, display: formatCount(s.count) }))} />
                      : <p className="m-0 text-[13px] text-txt-2">Nothing missing on the consent pages CiV has photographed (or none photographed yet).</p>}
                  </Card>
                </div>
              </div>
            );
          }}
        </Loader>
        <SectionTitle title="Where your numbers came from" sub="Every number you called, traced to its source, and the lists you uploaded." />
        <Loader query={provenance}>
          {(page) => (
            <div className="flex flex-col gap-5">
              <LadderCard page={page} />
              <TopSourcesCard page={page} />
              <UntracedCard page={page} />
              <UploadsCard page={page} />
            </div>
          )}
        </Loader>
        <ProofRequestsCard />
      </div>
    </>
  );
}
