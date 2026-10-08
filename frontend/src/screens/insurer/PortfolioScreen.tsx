'use client';

import { useRouter } from 'next/navigation';
import { useInsureds } from '@/api/queries';
import { Card } from '@/components/ui/Card';
import { Kpi } from '@/components/ui/Kpi';
import { Loader } from '@/components/ui/Loader';
import { PageHead } from '@/components/ui/PageHead';
import { lossModel, money } from '@/lib/lossModel';
import { usePortal } from '@/state/PortalContext';
import { CoverageChip } from './CoverageChip';
import { ExposureCell } from './ExposureCell';

const pct = (v: number | null) => (v === null ? '—' : `${Math.round(v * 100)}%`);

/** Every insured on one scale, with how much of each figure rests on evidence. */
export function PortfolioScreen() {
  const insureds = useInsureds();
  const { setInsuredId } = usePortal();
  const router = useRouter();
  return (
    <>
      <PageHead eyebrow="Falcon Risk · underwriting" title="Portfolio" sub="Every insured on one scale, refreshed monthly by independent measurement. Unverified fields are priced at worst case. Select a row for the attestation." />
      <Loader query={insureds}>
        {(list) => {
          const rows = list.map((i) => ({ i, lm: lossModel(i) }));
          const total = rows.reduce((sum, r) => sum + r.lm.expectedLoss, 0);
          return (
            <div className="flex flex-col gap-5">
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <Kpi tag="Insureds" value={String(list.length)} foot={`${list.filter((i) => i.monitoring === 'Live').length} monitored · ${list.filter((i) => i.selfReported).length} outside-in only`} />
                <Kpi tag="Portfolio expected annual loss" value={money(total)} foot="Loss model v0, uncalibrated" />
                <Kpi tag="Below 60% evidence coverage" value={String(list.filter((i) => i.coverage < 0.6).length)} foot="Grade capped; priced at worst case" />
                <Kpi tag="Statement conflicts" value={String(list.reduce((sum, i) => sum + i.conflicts.length, 0))} foot="Stated vs observed, across the book" />
              </div>
              <Card title="Insureds" sub="Higher Exposure Indicator = more exposed" flush>
                <div className="overflow-x-auto">
                  <table className="tbl">
                    <thead><tr><th>Insured</th><th>Exposure Indicator</th><th>Evidence</th><th>Flags</th><th>Consent proof</th><th>Chance of suit / yr</th><th>Expected annual loss</th></tr></thead>
                    <tbody>
                      {rows.map(({ i, lm }) => (
                        <tr key={i.id} className="clickrow" onClick={() => { setInsuredId(i.id); router.push('/attestation'); }}>
                          <td className="min-w-[230px]"><button type="button" className="border-0 bg-transparent p-0 text-left text-[13px] font-semibold text-txt">{i.name}</button><div className="tiny">{i.industry} · {i.contactsPerMonth.toLocaleString('en-US')} contacts/mo{i.selfReported ? ' (stated)' : ''}</div><div className="mt-1">{i.monitoring === 'Live' ? <span className="pill pill-green">Monitoring live</span> : <span className="pill pill-amber">{i.monitoring}</span>}</div></td>
                          <td className="min-w-[190px]"><ExposureCell insured={i} /></td>
                          <td><CoverageChip value={i.coverage} /><div className="tiny mt-1">coverage · records {i.completeness === null ? '—' : <span style={{ color: i.completeness < 0.9 ? 'var(--bad-ink)' : undefined }}>{i.completeness.toFixed(2)}</span>}</div></td>
                          <td className="text-[12.5px]"><div>{i.conflicts.length} {i.conflicts.length === 1 ? 'conflict' : 'conflicts'}</div><div className="tiny">{i.unknownCallerIds === null ? 'caller IDs not checked' : `${i.unknownCallerIds} unknown caller ${i.unknownCallerIds === 1 ? 'ID' : 'IDs'}`}</div></td>
                          <td className="mono">{pct(i.consentProof)}{i.consentProof === null && <div className="tiny">worst case 60%</div>}</td>
                          <td className="mono">{(lm.chance * 100).toFixed(1)}%</td>
                          <td className="mono font-semibold">{money(lm.expectedLoss)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="tiny m-0 px-[22px] py-3">The underwriter sees scores and attestation fields only. Contact-level records, numbers and certificates stay with each insured; CiV holds fingerprints only. A company that shares nothing is priced as if it were bad: that is the incentive to connect logs.</p>
              </Card>
            </div>
          );
        }}
      </Loader>
    </>
  );
}
