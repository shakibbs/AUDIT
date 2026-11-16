'use client';

import { useState } from 'react';
import { useSession, useWhoContact } from '@/api/queries';
import { Loader } from '@/components/ui/Loader';
import { PageHead } from '@/components/ui/PageHead';
import { AreaTile } from './AreaTile';
import { ChecksList } from './ChecksList';
import { GlanceCard } from './GlanceCard';
import { NumbersDrawer, type OpenNumbers } from './NumbersDrawer';
import { WhoCheckedWhat } from './WhoCheckedWhat';
import { useMonth } from '@/state/PortalContext';

/** DNC, internal list, reassigned numbers and litigation signals, measured after the contact from the client's own check services. */
export function WhoContactScreen() {
  const data = useWhoContact(useMonth());
  const session = useSession().data;
  const readOnly = session?.view === 'underwriter';
  // Admins and the lawyer change the switches (the server checks too); a Member sees them greyed with a note.
  const canChange = !session || session.role === 'admin' || session.isCounsel;
  // The phone numbers behind a count; not in the underwriter view (owner 2026-11-16).
  const [open, setOpen] = useState<OpenNumbers | null>(null);
  const onOpen = readOnly ? undefined : setOpen;
  return (
    <>
      <PageHead eyebrow="Evidence" title="Who You Contact" sub="Did you contact people you shouldn’t have? CiV runs no lookups of its own: it reads the results of the check services you use." />
      <Loader query={data}>
        {(d) => (
          <div className="flex flex-col gap-5">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{d.areas.map((a) => <AreaTile key={a.id} area={a} />)}</div>
            {d.glance && <GlanceCard glance={d.glance} readOnly={readOnly} onOpen={onOpen && ((column, label) => onOpen({ source: 'all', name: 'All sources', column, label }))} />}
            <WhoCheckedWhat data={d} readOnly={readOnly} canChange={canChange} onOpen={onOpen} />
            <ChecksList areas={d.areas} />
          </div>
        )}
      </Loader>
      {open && <NumbersDrawer open={open} onClose={() => setOpen(null)} />}
    </>
  );
}
