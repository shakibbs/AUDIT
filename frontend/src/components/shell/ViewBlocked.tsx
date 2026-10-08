import Link from 'next/link';
import type { ViewBlock } from '@/lib/views';

/** Shown instead of a page this view may not open. The server refuses the data as well. */
export function ViewBlocked({ block }: { block: Exclude<ViewBlock, 'none'> }) {
  const client = block === 'client-page';
  return (
    <div className="card card-pad mx-auto mt-10 max-w-xl text-center">
      <div className="ph-eyebrow">{client ? 'Underwriter view' : 'Insurer only'}</div>
      <h1 className="text-[20px]">{client ? 'This page holds the client’s own records' : 'Only your insurer sees this page'}</h1>
      <p className="mb-0 mt-3 text-[13px] text-txt-2">
        {client
          ? 'An underwriter sees scores and the attestation sheet, never contact-level records, findings or alerts.'
          : 'It covers the insurer’s whole book of companies. You see your own attestation, data integrity and export.'}
      </p>
      <div className="mt-5 flex justify-center gap-2">
        {client
          ? <Link href="/portfolio" className="btn btn-primary no-underline hover:no-underline">Portfolio</Link>
          : <><Link href="/attestation" className="btn btn-primary no-underline hover:no-underline">Your attestation</Link><Link href="/integrity" className="btn btn-ghost no-underline hover:no-underline">Data Integrity</Link></>}
      </div>
    </div>
  );
}
