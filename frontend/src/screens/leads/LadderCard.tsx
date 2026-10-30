import type { ProvenancePage } from '@/api/types';
import { StackedBar } from '@/components/charts/StackedBar';
import { Card } from '@/components/ui/Card';
import { formatCount } from '@/lib/format';

const COLOR: Record<string, string> = { crm_field: 'var(--series-1)', cert_domain: 'var(--series-2)', manual_import: 'var(--series-3)', untraced: 'var(--bad)' };

/** The provenance ladder: where this month's called numbers came from, strongest source first. Counts numbers called. */
export function LadderCard({ page }: { page: ProvenancePage }) {
  const shown = page.ladder.filter((r) => r.available);
  return (
    <Card title="Where your called numbers came from" sub={`${formatCount(page.numbers)} numbers first called in ${page.period}, strongest source first`}>
      {page.numbers === 0 ? <p className="tiny m-0">No numbers called in {page.period}.</p> : (
        <StackedBar height={22} label="Called numbers by source" segments={shown.map((r) => ({
          label: r.label, value: r.count, color: COLOR[r.basis] ?? 'var(--series-muted)', display: `${formatCount(r.count)} · ${r.share.toFixed(0)}%`,
        }))} />
      )}
      <p className="tiny mb-0 mt-3">
        {page.ladder.filter((r) => !r.available).map((r) => r.label).join(' and ')}: not connected yet. CiV reads them when you use one.
      </p>
    </Card>
  );
}
