'use client';

import { useCertificates } from '@/api/queries';
import type { Certificate } from '@/api/types';
import { Card } from '@/components/ui/Card';
import { Empty } from '@/components/ui/Empty';
import { Loader } from '@/components/ui/Loader';
import { formatDate } from '@/lib/format';

const PILL: Record<Certificate['state'], string> = { claimed: 'pill-green', waiting: 'pill-gray', no_key: 'pill-amber', lost: 'pill-red' };

/** Every consent certificate CiV found in your records: whether it was claimed in time, its dates, and how many
 * contacts' results used it. Only the start of each certificate ID is shown. */
export function CertificatesCard() {
  const certificates = useCertificates();
  return (
    <Card title="Your certificates" sub="TrustedForm and Jornaya certificates found in your records, newest first" flush>
      <Loader query={certificates}>
        {(list) => list.length === 0 ? <Empty>No certificates found in your records yet.</Empty> : (
          <div className="overflow-x-auto">
            <table className="tbl">
              <thead><tr><th>Certificate</th><th>State</th><th>Found</th><th>Made</th><th>Expires</th><th>Page</th><th>Used by</th></tr></thead>
              <tbody>
                {list.map((c) => (
                  <tr key={c.id}>
                    <td><span className="font-semibold">{c.provider}</span> <span className="mono text-[11.5px] text-txt-2">{c.ref}</span></td>
                    <td><span className={`pill ${PILL[c.state]}`}>{c.stateLabel}</span>{c.problem && <div className="tiny">{c.problem === 'NotFound' ? 'The provider does not have it' : c.problem}</div>}</td>
                    <td className="whitespace-nowrap">{formatDate(c.seenAt)}{c.state === 'waiting' && <div className="tiny">claim by {formatDate(c.deadlineAt)}</div>}</td>
                    <td className="whitespace-nowrap">{c.createdAt ? formatDate(c.createdAt) : '—'}</td>
                    <td className="whitespace-nowrap">{c.expiresAt ? formatDate(c.expiresAt) : '—'}</td>
                    <td className="mono text-[11.5px] text-txt-2">{c.page || '—'}</td>
                    <td className="mono">{c.usedBy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Loader>
    </Card>
  );
}
