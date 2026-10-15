import type { PlaceRule } from '@/api/types';
import { Card } from '@/components/ui/Card';
import { RuleStatusPill } from './RuleStatusPill';

/** A rule by place (federal, then states that differ). A TBD value is shown as its draft, marked not set yet. */
export function PlaceRulesCard({ title, sub, rows }: { title: string; sub: string; rows: PlaceRule[] }) {
  return (
    <Card title={title} sub={sub} flush>
      <table className="tbl">
        <thead><tr><th>Place</th><th>Value</th><th>Status</th></tr></thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.place}>
              <td className="font-semibold">{r.place === 'Federal' ? 'Federal (every state)' : r.place}</td>
              <td>{r.value ?? '—'}{r.status === 'tbd' && r.value && <span className="tiny"> · draft, not set yet</span>}</td>
              <td><RuleStatusPill status={r.status} />{r.counselItem && <span className="tiny"> {r.counselItem}</span>}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}
