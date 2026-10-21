import { BASIS_LABEL, type ConsentPanel } from '@/api/types';
import { Card } from '@/components/ui/Card';
import { StatusChip } from '@/components/ui/StatusChip';
import { formatDate, formatDateTime } from '@/lib/format';

/** Consent for the current owner of the number: the proofs on file, what the latest contact needed, the history of
 * changes, and the checks CiV cannot run yet. Strict results; draft rule values are said to be draft. */
export function ConsentCard({ consent }: { consent: ConsentPanel }) {
  const apart = [consent.pending ? `${consent.pending} pending` : '', consent.frozen ? `${consent.frozen} frozen` : ''].filter(Boolean).join(' · ');
  return (
    <Card title="Consent" sub={`Owner ${consent.owner ?? 1} of this number${apart ? ` · ${apart} (left out of totals)` : ''}`}>
      <div className="grid gap-5 lg:grid-cols-2">
        <div>
          <div className="kpi-tag mb-2">Proofs on file</div>
          {consent.proofs.length === 0 && <p className="tiny m-0">No proof of permission on file for this owner.</p>}
          {consent.proofs.map((p) => (
            <div key={p.id} className="chk !items-start">
              <span>
                <span className="font-semibold">{p.provider ? `${p.provider} certificate` : p.kind}</span>
                <span className="tiny block">
                  {p.madeAt ? `made ${formatDate(p.madeAt)}${p.dateKnown ? '' : ' (date not read yet)'}` : 'date unknown'}
                  {p.expiresAt ? ` · expires ${formatDate(p.expiresAt)}` : ''} · from {p.tool} · used by {p.usedBy} {p.usedBy === 1 ? 'contact' : 'contacts'}
                  {p.source ? ` · ${p.source}` : ''}
                  {p.phoneMatch === true ? ' · phone matches the form' : p.phoneMatch === false ? ' · phone NOT the one typed in the form' : ''}
                  {p.page ? ` · page ${p.page} (see Consent Integrity → Wording)` : ''}
                </span>
              </span>
              {p.withdrawn ? <span className="pill pill-gray">Withdrawn</span> : p.state ? <span className={`pill ${p.state === 'Claimed' ? 'pill-green' : p.state.startsWith('Lost') ? 'pill-red' : 'pill-gray'}`}>{p.state}</span> : null}
            </div>
          ))}
        </div>
        <div>
          <div className="kpi-tag mb-2">What the latest contact needed{consent.needsFor ? ` · ${formatDateTime(consent.needsFor)} UTC` : ''}</div>
          {consent.needs.length === 0 && <p className="tiny m-0">Nothing checked yet.</p>}
          {consent.needs.map((n) => (
            <div key={n.basis} className="chk"><span>{BASIS_LABEL[n.basis]}{n.proof && <span className="tiny block">met by: {n.proof}</span>}</span><StatusChip status={n.status} /></div>
          ))}
          {consent.draftRules && <p className="tiny mb-0 mt-2">Rule values are drafts, not confirmed by a lawyer yet. The strict reading is shown.</p>}
        </div>
      </div>
      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <div>
          <div className="kpi-tag mb-2">History of changes</div>
          {consent.history.length === 0 && <p className="tiny m-0">No result has changed since it was first checked.</p>}
          {consent.history.map((h) => (
            <div key={`${h.at}-${h.contactAt}-${h.to}`} className="chk">
              <span className="text-[12.5px]">
                {h.frozen ? <>Frozen: {h.to}</> : <>{h.from ?? '—'} → {h.to}</>}
                <span className="tiny block">{h.reason} · {formatDate(h.at)} · contact of {formatDateTime(h.contactAt)}</span>
              </span>
              {h.frozen ? <span className="pill pill-gray">Frozen</span> : <StatusChip status={h.to} />}
            </div>
          ))}
        </div>
        <div>
          <div className="kpi-tag mb-2">Not yet measured</div>
          <ul className="tiny m-0 pl-4">{consent.notMeasured.map((m) => <li key={m}>{m}</li>)}</ul>
          <p className="tiny mb-0 mt-2">These checks never make a result worse until CiV can run them.</p>
        </div>
      </div>
    </Card>
  );
}
