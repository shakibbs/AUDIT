'use client';

import { useConsentPages } from '@/api/queries';
import { Empty } from '@/components/ui/Empty';
import { Loader } from '@/components/ui/Loader';
import { ConsentPageCard } from './ConsentPageCard';

/** Every consent form page your certificates came from, with CiV's own photos and the checklist read from them. */
export function WordingTab() {
  const pages = useConsentPages();
  return (
    <Loader query={pages}>
      {(list) => list.length === 0 ? <Empty>No consent pages yet: they appear once CiV claims a certificate that names its page.</Empty> : (
        <div className="flex flex-col gap-4">
          {list.map((p) => <ConsentPageCard key={p.id} page={p} />)}
          <p className="tiny m-0">CiV visits each page as a normal visitor, about once a day, at phone and computer size. It never fills in a form.</p>
        </div>
      )}
    </Loader>
  );
}
