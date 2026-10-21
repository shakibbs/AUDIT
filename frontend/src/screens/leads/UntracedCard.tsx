import type { ProvenancePage } from '@/api/types';
import { Card } from '@/components/ui/Card';
import { Empty } from '@/components/ui/Empty';
import { formatDateTime } from '@/lib/format';

/** This month's untraced numbers: no source CiV can name. The CRM record ID lets you find each one in your own CRM. */
export function UntracedCard({ page }: { page: ProvenancePage }) {
  return (
    <Card title={`Untraced this month · ${page.untraced.length}`} sub="Called numbers no source can be named for. Look them up in your CRM by the record ID." flush>
      {page.untraced.length === 0 ? <Empty>Every number called this month has a source.</Empty> : (
        <div className="overflow-x-auto">
          <table className="tbl">
            <thead><tr><th>Number</th><th>First call (UTC)</th><th>Tool</th><th>CRM record</th><th>Why untraced</th></tr></thead>
            <tbody>
              {page.untraced.map((u) => (
                <tr key={`${u.number}-${u.firstContactAt}`}>
                  <td className="mono whitespace-nowrap">{u.number}</td>
                  <td className="mono whitespace-nowrap text-[12px]">{formatDateTime(u.firstContactAt)}</td>
                  <td>{u.tool}</td>
                  <td className="mono text-[12px]">{u.crmRecord || '—'}</td>
                  <td className="tiny">{u.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
