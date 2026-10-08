'use client';

import { useInsured } from '@/api/queries';
import type { Insured, SourceGrade } from '@/api/types';
import { Card } from '@/components/ui/Card';
import { Kpi } from '@/components/ui/Kpi';
import { Loader } from '@/components/ui/Loader';
import { PageHead } from '@/components/ui/PageHead';
import { formatDate } from '@/lib/format';
import { lossModel, money } from '@/lib/lossModel';
import { AttestationRow } from './AttestationRow';
import { InsuredPicker } from './InsuredPicker';
import { useViewer } from './useViewer';

// Small shares keep one decimal so 1.5% does not read as 2%.
const pct = (v: number | null) => (v === null ? '—' : v < 0.2 && v > 0 ? `${(v * 100).toFixed(1)}%` : `${Math.round(v * 100)}%`);

// A self-reported company has no measured fields: the grade falls back to S (stated) or N (not supplied).
const g = (i: Insured, measured: SourceGrade, value: unknown): SourceGrade => (value === null ? 'N' : i.selfReported ? 'S' : measured);

/** The standard underwriting data sheet. The client sees its own sheet without dollar figures (decision D36). */
export function AttestationScreen() {
  const { underwriter, insuredId, eyebrow } = useViewer();
  const insured = useInsured(insuredId);
  return (
    <>
      <PageHead eyebrow={eyebrow} title="Risk Attestation" sub="The standard underwriting data sheet. Every field states where it came from. Statements by the insured are signed and shown as statements; they never raise a score.">
        <InsuredPicker />
      </PageHead>
      <Loader query={insured}>
        {(i) => {
          const worst = lossModel(i).worstCaseFields;
          const consent = i.consentProof ?? 0.6;
          return (
            <div className="flex flex-col gap-5">
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <Kpi tag="Evidence coverage" value={`${Math.round(i.coverage * 100)}%`} foot={i.coverage < 0.6 ? 'Below 60%: grade capped at C' : 'At or above the 60% floor'} />
                <Kpi tag="Fields at worst case" value={String(worst)} foot="Not verified, so pessimistic values are used" />
                <Kpi tag="Sheet fingerprint" value={i.sheetHash ?? '—'} foot={i.asOf ? `As of ${formatDate(i.asOf)}` : 'Not yet attested'} />
                <Kpi tag="Monitoring" value={i.monitoring === 'Live' ? 'Live' : 'Not yet'} foot={i.monitoring === 'Live' ? 'Independent monthly monitoring in place' : i.monitoring} />
              </div>
              <Card title="A. Frequency drivers" sub="What makes a suit more likely" flush>
                <div className="overflow-x-auto">
                  <table className="tbl">
                    <thead><tr><th>Field</th><th>Value</th><th>Source grade</th><th>Source</th></tr></thead>
                    <tbody>
                      <AttestationRow field="Marketing contacts per month" value={i.contactsPerMonth.toLocaleString('en-US')} grade={i.selfReported ? 'S' : 'C'} source="Dialer and messaging platform, 30 days; reconciled to invoices" />
                      <AttestationRow field="Prerecorded or AI voice share" value={pct(i.prerecordedShare)} grade={g(i, 'C', i.prerecordedShare)} source="Dialer dial-mode field" note={i.prerecordedShare === null ? 'Worst case used: 20%' : undefined} />
                      <AttestationRow field="Contacts from purchased leads" value={pct(i.purchasedShare)} grade={g(i, 'C', i.purchasedShare)} source="Lead receipts by provenance ladder" note={i.purchasedShare === null ? 'Worst case used: 60%' : undefined} />
                      <AttestationRow field="Manual-import share · evidence found" value={i.manualImportShare === null ? '—' : `${pct(i.manualImportShare)} · ${pct(i.evidenceFoundShare)}`} grade={g(i, 'C', i.manualImportShare)} source="CRM and dialer creation records (M32, M33)" />
                      <AttestationRow field="Lead vendors · with signed indemnification" value={`${i.vendors} · ${pct(i.vendorTermsShare)}`} grade={g(i, 'D', i.vendorTermsShare)} source="Contracts" />
                      <AttestationRow field="Consent proof rate" value={pct(i.consentProof)} grade={g(i, 'B', i.consentProof)} source="Certificates read through the insured’s own key; five-check engine" note={i.consentProof === null ? 'Worst case used: 60%' : undefined} />
                      <AttestationRow field="Opt-out: median time to stop · not honored" value={i.optOutMedianHours === null ? '—' : `${i.optOutMedianHours} h · ${pct(i.optOutFailShare)}`} grade={i.optOutMedianHours === null ? 'N' : 'A'} source="CiV blind test lines" />
                      <AttestationRow field="Contacts after opt-out · opted-out re-added" value={i.contactsAfterOptOut === null ? '—' : `${i.contactsAfterOptOut}${i.reAdded !== null ? ` · ${i.reAdded}` : ''}`} grade={g(i, 'C', i.contactsAfterOptOut)} source="Messaging and dialer logs (M10, M34)" />
                      <AttestationRow field="Contacts after internal-list entry" value={i.internalListContacts ?? '—'} grade={g(i, 'D', i.internalListContacts)} source="Internal list against contact log" />
                      <AttestationRow field="Reassigned exposure (sample)" value={pct(i.rndExposure)} grade={i.rndExposure === null ? 'N' : 'B'} source="CiV query after contact, never before a dial (M35)" />
                      <AttestationRow field="Reassigned check before calling" value={i.reassignedCheckRate === null ? 'Not checked' : pct(i.reassignedCheckRate)} grade={i.reassignedCheckRate === null ? 'S' : 'D'} source="Insured’s query logs; a statement without logs scores as not checked" />
                      <AttestationRow field="Unknown caller IDs on the brand" value={i.unknownCallerIds ?? '—'} grade={i.unknownCallerIds === null ? 'N' : 'A'} source="Test lines, carrier labels, consumer reports" />
                      <AttestationRow field="Prior matters, 3 years" value={`stated ${i.priorStated} · dockets ${i.priorDocket}`} grade="B" source="Court dockets; the higher figure is used" />
                    </tbody>
                  </table>
                </div>
              </Card>
              <div className="grid gap-5 lg:grid-cols-2">
                <Card title="B. Records integrity">
                  <dl className="m-0">
                    <div className="kv"><dt>Records completeness</dt><dd>{i.completeness === null ? 'No logs' : i.completeness.toFixed(2)}</dd></div>
                    {underwriter && <div className="kv"><dt>Theoretical statutory exposure, 12 months</dt><dd>{money(i.contactsPerMonth * 12 * (1 - consent) * 500)} – {money(i.contactsPerMonth * 12 * (1 - consent) * 1500)}</dd></div>}
                    <div className="kv"><dt>Records fingerprinted</dt><dd>{i.controls.fingerprinted ? i.controls.fingerprinted.toLocaleString('en-US') : 'None'}</dd></div>
                    <div className="kv"><dt>Written policy · training currency</dt><dd>{i.controls.policy ? 'Yes' : 'No'} · {pct(i.controls.trainingCurrency)}</dd></div>
                    <div className="kv"><dt>Opt-out tests in 90 days</dt><dd>{i.controls.optOutTests90d}</dd></div>
                  </dl>
                  {!underwriter && <p className="tiny mb-0 mt-3">Your insurer also sees a dollar estimate of exposure on this sheet. Dollar figures are not shown in your portal.</p>}
                </Card>
                <Card title="C. Insured states" sub="Self-reported, signed, never scored up">
                  {[...i.conflicts.map((c) => ({ text: c.stated, conflict: c.observed })), ...i.statements.map((t) => ({ text: t, conflict: null }))].map((s) => (
                    <div key={s.text} className="border-t border-line-2 py-2.5 first:border-t-0">
                      <div className="text-[13px] font-semibold">“{s.text}”</div>
                      <div className="tiny mt-0.5" style={{ color: s.conflict ? 'var(--bad-ink)' : undefined }}>{s.conflict ? `Conflicts with observation: ${s.conflict}` : 'Info only; CiV does not access the DNC registry'}</div>
                    </div>
                  ))}
                  <div className="mt-3 rounded-[10px] bg-surface-3 p-3 text-[12.5px]">
                    <strong>Signed by {i.signedBy ?? 'nobody yet'}{i.asOf ? ` · ${formatDate(i.asOf)}` : ''}</strong>
                    <div className="tiny mt-1">Statements are the insured’s, not CiV’s. CiV’s reliance letter covers its method and observed data only.</div>
                  </div>
                </Card>
              </div>
            </div>
          );
        }}
      </Loader>
    </>
  );
}
