'use client';

import { useRouter } from 'next/navigation';
import { Icon } from '@/components/ui/Icon';
import { useViewMode } from '@/state/ViewModeContext';

/** Link from a Simple-view page to the same information in Full view. */
export function SeeFullDetails({ href, label = 'See full details' }: { href: string; label?: string }) {
  const { setMode } = useViewMode();
  const router = useRouter();
  return (
    <button type="button" className="inline-flex items-center gap-1 border-0 bg-transparent p-0 text-[13px] font-semibold text-brand"
      onClick={() => { setMode('full'); router.push(href); }}>
      {label} <Icon name="chevron-right" size={14} />
    </button>
  );
}
