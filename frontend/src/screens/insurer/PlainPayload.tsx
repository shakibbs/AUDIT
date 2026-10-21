/** The attestation payload in plain words: the same fields the insurer's software receives, one line each. */
type Row = [string, string];

const pct = (v: unknown) => (typeof v === 'number' ? `${(v * 100).toFixed(v < 0.2 && v > 0 ? 1 : 0)}%` : 'Not measured');
const num = (v: unknown) => (typeof v === 'number' ? v.toLocaleString('en-US') : 'Not measured');
const text = (v: unknown) => (v === null || v === undefined || v === '' ? 'Not measured' : String(v));

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function PlainPayload({ payload }: { payload: any }) {
  const f = payload.frequency;
  const ev = payload.evidence;
  const groups: [string, Row[]][] = [
    ['Company', [['Name', text(payload.insured.name)], ['Industry', text(payload.insured.industry)], ['As of', text(payload.as_of)], ['Sheet fingerprint', text(payload.sheet_sha256)]]],
    ['What makes a suit more likely', [
      ['Marketing contacts per month', num(f.marketing_contacts_month)], ['Prerecorded or AI voice share', pct(f.prerecorded_share)],
      ['Contacts from purchased leads', pct(f.purchased_lead_share)], ['Consent proof rate', pct(f.consent_proof_rate)],
      ['Opt-out: median hours to stop', num(f.optout_median_hours)], ['Opt-outs not honored', pct(f.optout_fail_share)],
      ['Contacts after an opt-out', num(f.contacts_after_optout)], ['Contacts after internal-list entry', num(f.internal_list_contacts)],
      ['Reassigned check before calling', pct(f.reassigned_check_rate)], ['Contacts to known litigators', num(f.litigator_contacts)],
      ['States where people can sue', num(f.pra_states)], ['Prior matters, 3 years', num(f.prior_matters_3y)],
    ]],
    ['Can the numbers be trusted', [
      ['Evidence coverage', pct(ev.coverage)], ['Records completeness', typeof ev.records_completeness === 'number' ? ev.records_completeness.toFixed(2) : 'No logs'],
      ['Statement conflicts', num(ev.statement_conflicts)], ['Unknown caller IDs', num(ev.unknown_caller_ids)], ['Fields at worst case', num(ev.worst_case_fields)],
    ]],
  ];
  const e = payload.exposure_indicator;
  if (e) groups.push(['Exposure Indicator', [['Score · grade', `${e.exposure} · ${e.grade}${e.capped ? ' (capped)' : ''}`], ['Defect term D', String(e.defect_term)],
    ['Multipliers', `venue ${e.multipliers.venue} · targeting ${e.multipliers.targeting} · volume ${e.multipliers.volume}`], ['Basis', e.basis === 'inside_out' ? 'Measured from records' : 'Modeled from public evidence']]]);
  const m = payload.model_v0;
  if (m === null) groups.push(['Loss estimate (model v0)', [['Expected annual loss', 'Not measured']]]);
  if (m) groups.push(['Loss estimate (model v0)', [['Chance of a suit in 12 months', pct(m.p_suit_12m)], ['Expected cost if sued', `$${num(m.expected_cost)}`], ['Expected annual loss', `$${num(m.expected_annual_loss)}`]]]);
  return (
    <div className="max-h-[520px] overflow-auto rounded-[10px] bg-surface-3 p-3">
      {groups.map(([title, rows]) => (
        <section key={title} className="mb-3 last:mb-0">
          <h3 className="m-0 mb-1 text-[12.5px] font-semibold">{title}</h3>
          <dl className="m-0">{rows.map(([k, v]) => <div key={k} className="kv"><dt>{k}</dt><dd>{v}</dd></div>)}</dl>
        </section>
      ))}
    </div>
  );
}
