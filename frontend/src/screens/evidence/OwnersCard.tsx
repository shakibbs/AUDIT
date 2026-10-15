import type { EvidenceFile } from '@/api/types';
import { Card } from '@/components/ui/Card';
import { formatDate } from '@/lib/format';

/** Who had this number when (phone epochs): consent from one owner never covers the next. */
export function OwnersCard({ epochs }: { epochs: NonNullable<EvidenceFile['epochs']> }) {
  return (
    <Card title="Owners of this number" sub="Consent from one owner never covers the next" flush>
      <table className="tbl">
        <thead><tr><th>Owner</th><th>From</th><th>To</th><th>Why CiV knows</th></tr></thead>
        <tbody>
          {epochs.map((e) => (
            <tr key={e.number}>
              <td className="font-semibold">Owner {e.number}</td>
              <td className="mono">{e.from ? formatDate(e.from) : 'Start'}</td>
              <td className="mono">{e.to ? formatDate(e.to) : 'Now'}</td>
              <td className="text-txt-2">{e.reason}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}
