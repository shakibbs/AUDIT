'use client';

import { useSession, useWhoContact } from '@/api/queries';
import { Loader } from '@/components/ui/Loader';
import { PageHead } from '@/components/ui/PageHead';
import { AreaTile } from './AreaTile';
import { ChecksList } from './ChecksList';
import { WhoCheckedWhat } from './WhoCheckedWhat';

/** DNC, internal list, reassigned numbers and litigation signals, measured after the contact from the client's own check services. */
export function WhoContactScreen() {
  const data = useWhoContact();
  const readOnly = useSession().data?.view === 'underwriter';
  return (
    <>
      <PageHead eyebrow="Evidence" title="Who You Contact" sub="Did you contact people you shouldn’t have? CiV runs no lookups of its own: it reads the results of the check services you use." />
      <Loader query={data}>
        {(d) => (
          <div className="flex flex-col gap-5">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{d.areas.map((a) => <AreaTile key={a.id} area={a} />)}</div>
            <WhoCheckedWhat data={d} readOnly={readOnly} />
            <ChecksList areas={d.areas} />
          </div>
        )}
      </Loader>
    </>
  );
}
