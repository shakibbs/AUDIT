'use client';

import { useState } from 'react';
import { useInsured } from '@/api/queries';
import type { Insured } from '@/api/types';
import { Card } from '@/components/ui/Card';
import { Loader } from '@/components/ui/Loader';
import { PageHead } from '@/components/ui/PageHead';
import { exposureOf } from '@/lib/exposure';
import { lossModel } from '@/lib/lossModel';
import { CoverageConditions } from './CoverageConditions';
import { InsuredPicker } from './InsuredPicker';
import { useViewer } from './useViewer';

/** The civ.attestation.v1 payload. The client's copy leaves out the insurer's own risk estimates (decision D36). */
function payloadFor(i: Insured, underwriter: boolean) {
  const reading = i.exposure.inside ?? i.exposure.outside;
  const lm = lossModel(i);
  const base = {
    schema: 'civ.attestation.v1', insured: { id: i.id, name: i.name, industry: i.industry }, as_of: i.asOf, sheet_sha256: i.sheetHash,
    frequency: { marketing_contacts_month: i.contactsPerMonth, prerecorded_share: i.prerecordedShare, purchased_lead_share: i.purchasedShare, consent_proof_rate: i.consentProof,
      optout_median_hours: i.optOutMedianHours, optout_fail_share: i.optOutFailShare, contacts_after_optout: i.contactsAfterOptOut, internal_list_contacts: i.internalListContacts,
      reassigned_check_rate: i.reassignedCheckRate, litigator_contacts: i.litigatorContacts, pra_states: i.praStates, prior_matters_3y: Math.max(i.priorStated, i.priorDocket) },
    evidence: { coverage: i.coverage, records_completeness: i.completeness, statement_conflicts: i.conflicts.length, unknown_caller_ids: i.unknownCallerIds, worst_case_fields: lm.worstCaseFields },
  };
  if (!underwriter) return base;
  const e = reading ? exposureOf(reading) : null;
  return { ...base,
    exposure_indicator: e && reading ? { model: 'v2.2', basis: i.exposure.inside ? 'inside_out' : 'outside_in', factors: reading.factors, defect_term: e.defect, multipliers: { venue: reading.venue, targeting: reading.targeting, volume: reading.volume }, exposure: e.exposure, grade: e.grade, capped: e.capped } : null,
    model_v0: { p_suit_12m: Number(lm.chance.toFixed(4)), expected_cost: Math.round(lm.costIfSued), expected_annual_loss: Math.round(lm.expectedLoss) } };
}

/** What a rating engine ingests, and the conditions that make the score part of the policy. */
export function ExportScreen() {
  const { underwriter, insuredId, eyebrow } = useViewer();
  const insured = useInsured(insuredId);
  const [sent, setSent] = useState('');
  return (
    <>
      <PageHead eyebrow={eyebrow} title="Underwriting Export" sub={underwriter ? 'What a rating engine ingests, and the conditions that make the score a term of the policy.' : 'Exactly what your insurer receives about your company each month, except the insurer’s own risk estimates.'}>
        <InsuredPicker />
      </PageHead>
      <Loader query={insured}>
        {(i) => {
          const json = JSON.stringify(payloadFor(i, underwriter), null, 1);
          return (
            <div className="grid gap-5 xl:grid-cols-2">
              <Card title="Attestation payload" sub="GET /v1/insureds/{id}/attestation?as_of=2026-09 · bearer token scoped to the carrier · every call logged in the insured’s access log">
                <pre className="mono m-0 max-h-[520px] overflow-auto rounded-[10px] bg-surface-3 p-3 text-[11.5px]">{json}</pre>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {underwriter && <button type="button" className="btn btn-primary btn-sm" onClick={() => setSent('Accepted by the rating engine (sample) · logged in the insured’s access log')}>Send to rating engine</button>}
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => { void navigator.clipboard?.writeText(json); setSent('Copied'); }}>Copy JSON</button>
                  <span className="tiny" role="status">{sent}</span>
                </div>
                {!underwriter && <p className="tiny mb-0 mt-3">Your insurer’s copy also carries its own Exposure Indicator and loss estimate. Phone numbers, tokens, certificates, recordings, message text and agent names are never sent.</p>}
              </Card>
              <div className="flex flex-col gap-5">
                <CoverageConditions />
                <Card title="Monthly feed">
                  <dl className="m-0">
                    <div className="kv"><dt>Cadence</dt><dd className="font-normal">First business day; a webhook on any 5-point score change or a new open matter</dd></div>
                    <div className="kv"><dt>History</dt><dd className="font-normal">Every prior sheet kept with its fingerprint</dd></div>
                    <div className="kv"><dt>Who else sees it</dt><dd className="font-normal">The insured sees its own sheet, read-only. Nobody else unless the insured grants it</dd></div>
                  </dl>
                </Card>
              </div>
            </div>
          );
        }}
      </Loader>
    </>
  );
}
