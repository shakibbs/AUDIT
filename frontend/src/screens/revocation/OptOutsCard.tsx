'use client';

import { useOptOuts } from '@/api/queries';
import { Loader } from '@/components/ui/Loader';
import { OptOutsTable } from './OptOutsTable';
import { useMonth } from '@/state/PortalContext';

/** Every opt-out, newest first, from the moment it happens: its deadline, whether the dialer marked it, and any contact after. */
export function OptOutsCard() {
  const optOuts = useOptOuts(useMonth());
  return <Loader query={optOuts}>{(list) => <OptOutsTable optOuts={list} />}</Loader>;
}

