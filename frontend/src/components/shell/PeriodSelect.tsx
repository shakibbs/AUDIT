'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import type { Period } from '@/api/types';
import { usePortal } from '@/state/PortalContext';

// Pages that are the same for every month (owner, 2026-10-30): the picker stays, with a note.
const SAME_EVERY_MONTH = ['/settings', '/users', '/account', '/setup', '/litigation'];

/** One month for every page: changing it here changes it everywhere. */
export function PeriodSelect({ periods }: { periods: Period[] }) {
  const { period, setPeriod } = usePortal();
  const path = usePathname() ?? '';
  // A remembered month this company does not have (another company, or before its start): back to the latest.
  useEffect(() => {
    if (period && periods.length && !periods.some((p) => p.id === period)) setPeriod(undefined);
  }, [period, periods, setPeriod]);
  const same = SAME_EVERY_MONTH.some((p) => path === p || path.startsWith(`${p}/`));
  return (
    <label className="flex items-center gap-2 text-[12px] text-txt-2">
      <span className="sr-only">Period</span>
      {same && <span className="tiny hidden sm:inline">This page is the same for every month</span>}
      <select className="field !w-auto !py-2 font-semibold" value={period ?? periods[0]?.id} onChange={(e) => setPeriod(e.target.value)}>
        {periods.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
      </select>
    </label>
  );
}
