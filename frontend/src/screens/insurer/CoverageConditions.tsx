import { Card } from '@/components/ui/Card';

const CONDITIONS: [string, string][] = [
  ['Monitoring maintained', 'Independent monthly monitoring for the policy term; a 60-day lapse is a notice event.'],
  ['Evidence coverage at least 60%', 'At least 60% of the score rests on records, tests or third parties, not on the insured’s statements.'],
  ['Records complete at least 0.9', 'Call and text logs reconcile to carrier and platform invoices within 10%.'],
  ['Statements signed', 'Every Insured states field is signed by an officer.'],
  ['Score review trigger', 'A score below 70 for two consecutive months triggers an underwriting review, not cancellation.'],
  ['Attestation currency', 'A sheet dated within 30 days accompanies the application and each renewal.'],
  ['Decision records', 'High findings carry a recorded decision within 30 days. The decision, not the fix, is the condition.'],
  ['Counsel-directed routing', 'Alerts go to counsel first for the term.'],
  ['Vendor terms', 'Lead vendors supplying more than 10% of contacts have signed indemnification on file.'],
];

/** Draft conditions of coverage for the carrier's counsel. CiV supplies measurements; the carrier sets terms. */
export function CoverageConditions() {
  return (
    <Card title="Conditions of coverage" sub="Draft for the carrier’s counsel" flush>
      {CONDITIONS.map(([t, d], k) => (
        <div key={t} className="row-item !items-start">
          <span className="rank">{k + 1}</span>
          <span><span className="block text-[13px] font-semibold">{t}</span><span className="tiny">{d}</span></span>
        </div>
      ))}
    </Card>
  );
}
