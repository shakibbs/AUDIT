import type { ReportRun } from '@/api/types';
import { Card } from '@/components/ui/Card';
import { formatDateTime } from '@/lib/format';

/** Past and queued exports. */
export function ReportHistory({ runs }: { runs: ReportRun[] }) {
  return (
    <Card title="History" sub="Every export is recorded in the access log" flush>
      <div className="overflow-x-auto">
      <table className="tbl">
        <thead><tr><th>Report</th><th>Period</th><th>Requested by</th><th>When (UTC)</th><th>Status</th></tr></thead>
        <tbody>
          {runs.map((r) => (
            <tr key={r.id}>
              <td className="font-semibold">{r.name}</td><td>{r.period}</td><td className="text-txt-2">{r.requestedBy}</td>
              <td className="mono whitespace-nowrap text-[11.5px]">{formatDateTime(r.at)}</td>
              <td>{r.status === 'ready' ? <span className="pill pill-green">Ready</span> : r.status === 'blocked' ? <span className="pill pill-amber" title="Held back by the wording check; CiV has been told">Held for review</span> : r.status === 'unavailable' ? <span className="pill pill-gray">Not available yet</span> : r.status === 'requested' ? <span className="pill pill-amber" title="CiV has been told and will contact you">Quote requested</span>
                : r.status === 'accepted' ? <span className="pill pill-blue" title="Type the numbers on the card above">Accepted: send the numbers</span>
                : r.status === 'checking' ? <span className="pill pill-blue" title="CiV checks the package before you can download it">Being checked by CiV</span>
                : r.status === 'closed' ? <span className="pill pill-gray">Closed</span> : <span className="pill pill-blue">Queued</span>}
                {r.url && <a className="ml-2 text-[12px] font-semibold" href={r.url} download>Download</a>}</td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </Card>
  );
}
