'use client';

import Link from 'next/link';
import { useEvidenceFile, useSend } from '@/api/queries';
import { StackedBar } from '@/components/charts/StackedBar';
import { Card } from '@/components/ui/Card';
import { Icon } from '@/components/ui/Icon';
import { PageHead } from '@/components/ui/PageHead';
import { StatusChip } from '@/components/ui/StatusChip';
import { formatDate, truncateHash } from '@/lib/format';
import { STATUS_COLOR } from '@/lib/status';
import { ContactTimeline } from './ContactTimeline';
import { CallingWindowCard } from './CallingWindowCard';
import { ConsentCard } from './ConsentCard';
import { OwnersCard } from './OwnersCard';
import { ProofElements } from './ProofElements';

const ORDER = ['VERIFIED', 'WEAK', 'CONFLICTING', 'NO_PROOF', 'PENDING', 'NOT_NEEDED', 'NOT_CHECKED'] as const;

/** The full file for one phone number. */
export function EvidenceFileScreen({ phone }: { phone: string }) {
  const file = useEvidenceFile(phone);
  const send = useSend();
  const exportFile = () => send.mutate({ method: 'POST', path: '/reports', body: { name: `Evidence file export · ${phone}`, period: 'Sep 2026' } });

  if (file.isPending) return <div className="card card-pad tiny" role="status">Loading…</div>;
  if (file.isError) {
    return (
      <>
        <PageHead eyebrow="Evidence" title={phone} sub="Evidence file" />
        <div className="card card-pad text-[13px]" role="alert">{file.error.message} <Link href="/ledger">Back to the Contact Ledger</Link></div>
      </>
    );
  }
  const f = file.data;
  return (
    <>
      <PageHead eyebrow="Evidence · evidence file" title={f.phone} sub={`${f.epoch} · subscriber period ${f.epochCertainty}`}>
        {f.onHold && <span className="pill pill-teal">Under legal hold</span>}
        <button type="button" className="btn btn-primary" onClick={exportFile} disabled={send.isPending}><Icon name="download" /> {send.isSuccess ? 'Export requested' : 'Export this file'}</button>
      </PageHead>
      {f.cameFrom && <p className="tiny -mt-2 mb-4">Came from: {f.cameFrom}</p>}
      <div className="flex flex-col gap-5">
        <div className="grid gap-5 lg:grid-cols-3">
          <Card title="Standing" sub="The weakest status across all contacts (pending and frozen left out)">
            <StatusChip status={f.worstStatus} />
            <div className="mt-4"><StackedBar label="Contacts by status" segments={ORDER.map((s) => ({ label: s, value: f.counts[s] ?? 0, color: STATUS_COLOR[s] }))} /></div>
          </Card>
          <Card title="List checks" sub="Do-not-contact lists consulted">
            {f.listChecks.length === 0 && <p className="tiny m-0">Not checked yet.</p>}
            {f.listChecks.map((l) => (
              <div key={l.list} className="chk"><span>{l.list}<span className="tiny block">{l.label}</span></span>
                {l.onList === null ? <span className="pill pill-gray">Not measured</span> : l.onList ? <span className="pill pill-red">Listed</span> : <span className="pill pill-green">Not listed</span>}</div>
            ))}
          </Card>
          <Card title="Anchor" sub="Seal over this file's records">
            <dl className="m-0">
              <div className="kv"><dt>Status</dt><dd>{f.anchor.anchored ? <span className="pill pill-green">Sealed</span> : <span className="pill pill-gray">Waiting for tonight’s seal</span>}</dd></div>
              {f.anchor.recordCount !== undefined && <div className="kv"><dt>Records sealed</dt><dd>{f.anchor.sealedCount} of {f.anchor.recordCount}{f.anchor.stamped ? ' · time-stamped' : ''}</dd></div>}
              <div className="kv"><dt>Sealed on</dt><dd>{f.anchor.date ? formatDate(f.anchor.date) : '—'}</dd></div>
              <div className="kv"><dt>Root fingerprint</dt><dd className="mono">{f.anchor.root ? truncateHash(f.anchor.root) : '—'}</dd></div>
            </dl>
          </Card>
        </div>
        {(f.callingWindow || f.epochs) && (
          <div className="grid gap-5 lg:grid-cols-2">
            {f.callingWindow && <CallingWindowCard window={f.callingWindow} where={f.where} confidence={f.locationConfidence} />}
            {f.epochs && <OwnersCard epochs={f.epochs} />}
          </div>
        )}
        {f.consent && <ConsentCard consent={f.consent} />}
        <ContactTimeline file={f} />
        <ProofElements file={f} />
      </div>
    </>
  );
}
