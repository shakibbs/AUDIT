import type { Insured } from '@/api/types';
import { Card } from '@/components/ui/Card';

/** Records CiV was given, checked against totals the company does not control. */
export function ReconciliationCard({ insured }: { insured: Insured }) {
  return (
    <Card title="Reconciliation against independent totals" sub="CiV cannot check every record, but it can check that it was given all of them" flush>
      {insured.reconciliation.length === 0 ? <p className="m-0 px-[22px] pb-5 text-[13px] text-txt-2">No contact logs connected, so nothing to reconcile. Outside-in score only.</p> : (
        <div className="overflow-x-auto">
          <table className="tbl">
            <thead><tr><th>What CiV was given</th><th>Checked against</th><th>Records</th><th>Independent total</th><th>Ratio</th><th>Result</th><th>Source of total</th></tr></thead>
            <tbody>
              {insured.reconciliation.map((r) => (
                <tr key={r.label}>
                  <td className="font-semibold">{r.label}</td><td className="tiny">{r.against}</td><td className="mono">{r.records}</td><td className="mono">{r.total}</td>
                  <td className="mono font-semibold">{r.ratio === null ? '—' : r.ratio.toFixed(2)}</td>
                  <td>{r.result === 'consistent' ? <span className="pill pill-green">Consistent</span> : <span className="pill pill-red">Flag</span>}</td>
                  <td className="tiny">{r.source}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
