import type { ProvenancePage } from '@/api/types';
import { Card } from '@/components/ui/Card';
import { Empty } from '@/components/ui/Empty';
import { formatCount } from '@/lib/format';

/** Lists uploaded into your CRM (new or updated records) or straight into a dialer: evidence found, STOP numbers
 * brought back, and the proof rate from proof requests. */
export function UploadsCard({ page }: { page: ProvenancePage }) {
  return (
    <Card title="Uploaded lists" sub="Lists put into your CRM or dialer in one go. Numbers from them need their own evidence." flush>
      {page.uploads.length === 0 ? <Empty>No uploaded lists found.</Empty> : (
        <div className="overflow-x-auto">
          <table className="tbl">
            <thead><tr><th>List</th><th>Numbers</th><th>With evidence</th><th>STOP numbers brought back</th><th>Proof rate</th></tr></thead>
            <tbody>
              {page.uploads.map((u) => (
                <tr key={u.id}>
                  <td>{u.label}{u.optOutsCleared > 0 && <div className="tiny" style={{ color: 'var(--bad-ink)' }}>⚠️ {formatCount(u.optOutsCleared)} opt-out mark(s) cleared by this upload</div>}</td>
                  <td className="mono">{formatCount(u.numbers)}</td>
                  <td className="mono">{formatCount(u.withEvidence)}</td>
                  <td>{u.stopBroughtBack ? <span className="pill pill-red">{formatCount(u.stopBroughtBack)}</span> : <span className="text-txt-3">0</span>}</td>
                  <td>{u.proofRate === null ? <span className="text-txt-3">{u.asked ? 'Waiting for answers' : 'Not asked yet'}</span> : `${(u.proofRate * 100).toFixed(0)}% of ${u.asked}`}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
