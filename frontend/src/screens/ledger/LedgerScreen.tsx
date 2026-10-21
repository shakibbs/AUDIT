'use client';

import { useState } from 'react';
import { useConsent, useContacts } from '@/api/queries';
import { Card } from '@/components/ui/Card';
import { Loader } from '@/components/ui/Loader';
import { PageHead } from '@/components/ui/PageHead';
import { Seg } from '@/components/ui/Seg';
import { ContactTable } from './ContactTable';
import { StatusTiles } from './StatusTiles';

const FILTERS = [{ id: 'ALL', label: 'All' }, { id: 'NO_PROOF', label: 'No proof' }, { id: 'CONFLICTING', label: 'Conflicting' }, { id: 'WEAK', label: 'Weak' }, { id: 'VERIFIED', label: 'Verified' }, { id: 'PENDING', label: 'Pending' }, { id: 'NOT_CHECKED', label: 'Not checked yet' }] as const;

export function LedgerScreen() {
  const [status, setStatus] = useState<(typeof FILTERS)[number]['id']>('ALL');
  const [q, setQ] = useState('');
  const contacts = useContacts(status, q);
  const consent = useConsent();
  return (
    <>
      <PageHead eyebrow="Evidence" title="Contact Ledger" sub="Every call and text, with where the person probably is and the consent status the engine gave it. A contact seen in two tools is shown once." />
      <div className="flex flex-col gap-5">
        {consent.data && <StatusTiles consent={consent.data} onPick={(st) => setStatus(st as typeof status)} />}
        <Card title="Contacts" sub="Newest first · find a number by typing it in full or its last 4 digits" flush right={
          <div className="flex flex-wrap items-center gap-2">
            <label className="sr-only" htmlFor="ledger-q">Find a number</label>
            <input id="ledger-q" className="field !w-[190px] !py-1.5" placeholder="Find a number" value={q} onChange={(e) => setQ(e.target.value)} />
            <Seg label="Status" options={FILTERS} value={status} onChange={setStatus} />
          </div>}>
          <Loader query={contacts}>{(list) => <ContactTable contacts={list} />}</Loader>
        </Card>
      </div>
    </>
  );
}
