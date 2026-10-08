import type { Insured } from '@/api/types';
import { StackedBar } from '@/components/charts/StackedBar';
import { Card } from '@/components/ui/Card';
import { GRADE_INFO, SourceGradeChip } from './SourceGradeChip';

const COLOUR = { A: 'var(--series-1)', B: 'var(--series-2)', C: 'var(--brand-2)', D: 'var(--series-3)', S: 'var(--warn)', N: 'var(--bad)' } as const;

/** What the score rests on: share of inputs by source grade, and how that becomes evidence coverage. */
export function BasisMixCard({ insured }: { insured: Insured }) {
  const coverage = insured.basisMix.reduce((sum, m) => sum + m.share * GRADE_INFO[m.grade].weight, 0);
  return (
    <Card title="What the score rests on" sub="Share of score inputs by source grade">
      <StackedBar legend={false} height={14} label="Score inputs by source grade" segments={insured.basisMix.map((m) => ({ label: `Source grade ${m.grade}`, value: m.share, color: COLOUR[m.grade], display: `${m.share}%` }))} />
      <table className="tbl mt-3">
        <thead><tr><th>Source grade</th><th>Share</th><th>Weight</th><th>Counts toward coverage</th></tr></thead>
        <tbody>
          {insured.basisMix.map((m) => (
            <tr key={m.grade}><td><SourceGradeChip grade={m.grade} /></td><td className="mono">{m.share}%</td><td className="mono">{GRADE_INFO[m.grade].weight}</td><td className="mono">{(m.share * GRADE_INFO[m.grade].weight).toFixed(1)}%</td></tr>
          ))}
          <tr><td className="font-semibold">Evidence coverage</td><td /><td /><td className="mono font-semibold">{coverage.toFixed(0)}%</td></tr>
        </tbody>
      </table>
      <p className="tiny mb-0 mt-3">A company export weighs 0.7 because a spreadsheet can be edited; a record CiV reads by API is fingerprinted when fetched. Statements and missing sources count for nothing.</p>
    </Card>
  );
}
