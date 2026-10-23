'use client';

import Link from 'next/link';
import { useDisputes } from '@/api/queries';
import type { Vendor } from '@/api/types';
import { formatDate } from '@/lib/format';

/** A vendor's dispute candidates: leads with a consent problem still inside the contract's dispute window. */
export function DisputeList({ vendor }: { vendor: Vendor }) {
  const disputes = useDisputes(vendor.name, vendor.contract !== undefined).data;  // only vendors with a contract have a dispute list
  if (!disputes) return null;
  const csv = `/api/vendor-disputes?vendor=${encodeURIComponent(vendor.name)}&csv=1`;
  return (
    <div>
      <div className="kpi-tag mb-2">Dispute candidates</div>
      {disputes.windowDays === 0 ? (
        <p className="tiny m-0">No dispute window: {disputes.basis === 'contract' ? 'the contract allows none' : 'no contract on file'}.</p>
      ) : disputes.rows.length === 0 ? (
        <p className="tiny m-0">None inside the {disputes.windowDays}-day window.</p>
      ) : (
        <>
          <p className="m-0 text-[13px]">{disputes.rows.length} lead{disputes.rows.length === 1 ? '' : 's'} · ${Number(disputes.total).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            {disputes.noPrice > 0 && <span className="tiny"> · {disputes.noPrice} with no price, left out</span>}
            <a className="ml-2 text-[12.5px] font-semibold" href={csv} download>Download CSV</a></p>
          <ul className="m-0 mt-2 list-none space-y-1 p-0 text-[12.5px]">
            {disputes.rows.slice(0, 20).map((r) => (
              <li key={r.lead}><Link className="mono" href={`/numbers/${encodeURIComponent(r.ref)}`}>{r.number}</Link> · {formatDate(r.date)} · {r.result}{r.price ? ` · $${r.price}` : ' · no price'}</li>
            ))}
          </ul>
        </>
      )}
      <p className="tiny mb-0 mt-1.5">Leads with a consent problem inside the window your contract gives. CiV never contacts vendors.</p>
    </div>
  );
}
