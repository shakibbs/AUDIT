import type { ProvenancePage } from '@/api/types';
import { BarList } from '@/components/charts/BarList';
import { Card } from '@/components/ui/Card';
import { Empty } from '@/components/ui/Empty';
import { formatCount } from '@/lib/format';

/** Vendors named in your CRM and websites in your certificates, by numbers called. Names are shown as written. */
export function TopSourcesCard({ page }: { page: ProvenancePage }) {
  return (
    <Card title="Top sources" sub="Vendors named in your CRM and websites in your certificates, as written">
      {page.topSources.length === 0 ? <Empty>No named source in {page.period}.</Empty> : (
        <BarList labelWidth={240} rows={page.topSources.map((s) => ({ key: `${s.basis}-${s.name}`, label: `${s.name} · ${s.basis}`, value: s.count, display: formatCount(s.count) }))} />
      )}
    </Card>
  );
}
