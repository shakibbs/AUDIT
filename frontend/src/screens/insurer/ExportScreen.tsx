'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useInsured, useSend } from '@/api/queries';
import type { Insured } from '@/api/types';
import { Card } from '@/components/ui/Card';
import { Loader } from '@/components/ui/Loader';
import { PageHead } from '@/components/ui/PageHead';
import { exposureOf } from '@/lib/exposure';
import { lossModel } from '@/lib/lossModel';
import { CoverageConditions } from './CoverageConditions';
import { InsuredPicker } from './InsuredPicker';
import { PlainPayload } from './PlainPayload';
import { RatingEngineCard } from './RatingEngineCard';
import { NoShares } from './NoShares';
import { useViewer } from './useViewer';

/** The civ.attestation.v1 payload. The client's copy leaves out the insurer's own risk estimates (decision D36). */
function payloadFor(i: Insured, underwriter: boolean) {
  const reading = i.exposure.inside ?? i.exposure.outside;
  const lm = lossModel(i);
  const base = {
    schema: 'civ.attestation.v1', insured: { id: i.id, name: i.name, industry: i.industry }, as_of: i.asOf, sheet_sha256: i.sheetHash,
    frequency: { marketing_contacts_month: i.contactsPerMonth, prerecorded_share: i.prerecordedShare, purchased_lead_share: i.purchasedShare, consent_proof_rate: i.consentProof,
      optout_median_hours: i.optOutMedianHours, optout_fail_share: i.optOutFailShare, contacts_after_optout: i.contactsAfterOptOut, internal_list_contacts: i.internalListContacts,
      reassigned_check_rate: i.reassignedCheckRate, litigator_contacts: i.litigatorContacts, pra_states: i.praStates, prior_matters_3y: i.priorStated === null && i.priorDocket === null ? null : Math.max(i.priorStated ?? 0, i.priorDocket ?? 0) },
    evidence: { coverage: i.coverage, records_completeness: i.completeness, statement_conflicts: i.conflicts.length, unknown_caller_ids: i.unknownCallerIds, worst_case_fields: lm.worstCaseFields },
  };
  if (!underwriter) return base;
  const e = reading ? exposureOf(reading) : null;
  return { ...base,
    exposure_indicator: e && reading ? { model: 'v2.2', basis: i.exposure.inside ? 'inside_out' : 'outside_in', factors: reading.factors, defect_term: e.defect, multipliers: { venue: reading.venue, targeting: reading.targeting, volume: reading.volume }, exposure: e.exposure, grade: e.grade, capped: e.capped } : null,
    // No contacts measured: the loss model has nothing to run on.
    model_v0: i.contactsPerMonth === null ? null : { p_suit_12m: Number(lm.chance.toFixed(4)), expected_cost: Math.round(lm.costIfSued), expected_annual_loss: Math.round(lm.expectedLoss) } };
}

/** What a rating engine ingests, and the conditions that make the score part of the policy. */
export function ExportScreen() {
  const { underwriter, preview, insuredId, eyebrow, empty, ready } = useViewer();
  const insured = useInsured(insuredId, ready);
  const [sent, setSent] = useState('');
  const send = useSend<{ ok: boolean; detail: string }>();
  const client = useQueryClient();  // a failed send still refreshes the send history (2026-10-23)
  return (
    <>
      <PageHead eyebrow={eyebrow} title="Underwriting Export" sub={underwriter ? 'What a rating engine ingests, and the conditions that make the score a term of the policy.' : 'Exactly what your insurer receives about your company each month, except the insurer’s own risk estimates.'}>
        <InsuredPicker />
      </PageHead>
      {empty ? <NoShares /> : <Loader query={insured}>
        {(i) => {
          const payload = payloadFor(i, underwriter);
          const json = JSON.stringify(payload, null, 1);
          return (
            <div className="grid gap-5 xl:grid-cols-2">
              <Card title="Attestation payload" sub={`GET /v1/insureds/{id}/attestation?as_of=${i.asOf ? i.asOf.slice(0, 7) : 'latest'} · bearer token scoped to the carrier · every call logged in the insured’s access log`}>
                <PlainPayload payload={payload} />
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {underwriter && !preview && <button type="button" className="btn btn-primary btn-sm" disabled={send.isPending} onClick={() => send.mutate({ method: 'POST', path: '/rating-engine/send', body: { insured: i.id } }, { onSuccess: (r) => setSent(r.detail), onError: (e) => { setSent(e.message); void client.invalidateQueries({ queryKey: ['/rating-engine'] }); } })}>Send to rating engine</button>}
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => { void navigator.clipboard?.writeText(json); setSent('Copied'); }}>Copy JSON</button>
                  <span className="tiny" role="status">{sent}</span>
                </div>
                {!underwriter && <p className="tiny mb-0 mt-3">Your insurer’s copy also carries its own Exposure Indicator and loss estimate. Phone numbers, tokens, certificates, recordings, message text and agent names are never sent.</p>}
              </Card>
              <div className="flex flex-col gap-5">
                {underwriter && !preview && <RatingEngineCard />}
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
      </Loader>}
    </>
  );
}
