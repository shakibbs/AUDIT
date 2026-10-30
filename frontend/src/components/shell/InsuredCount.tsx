'use client';

import { useInsureds } from '@/api/queries';
import { usePortal } from '@/state/PortalContext';

/** The insurer's top bar: how many companies share with it right now. */
export function InsuredCount() {
  const n = useInsureds(true, usePortal().period).data?.length;
  const count = n === undefined ? '' : n === 0 ? ' · No insureds yet' : ` · ${n} ${n === 1 ? 'insured' : 'insureds'}`;
  return <span className="hidden whitespace-nowrap text-[12px] text-txt-2 xl:inline">Attestations refresh monthly{count}</span>;
}
