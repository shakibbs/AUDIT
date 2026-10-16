'use client';

import { useOptOuts } from '@/api/queries';
import { Loader } from '@/components/ui/Loader';
import { OptOutsTable } from './OptOutsTable';

/** Every opt-out, newest first, from the moment it happens: its deadline, whether the dialer marked it, and any contact after. */
export function OptOutsCard() {
  const optOuts = useOptOuts();
  return <Loader query={optOuts}>{(list) => <OptOutsTable optOuts={list} />}</Loader>;
}

