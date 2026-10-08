'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useViewMode } from '@/state/ViewModeContext';
import { SIMPLE_PATHS } from './nav';

/** In Simple view, a page that belongs to Full view says so and offers both ways out. */
export function FullOnlyNotice() {
  const { mode, setMode } = useViewMode();
  const pathname = usePathname();
  if (mode !== 'simple' || SIMPLE_PATHS.includes(pathname)) return null;
  return (
    <div className="note-box mb-4 flex flex-wrap items-center justify-between gap-3" role="note">
      <span>This page is part of <strong>Full view</strong>.</span>
      <span className="flex gap-2">
        <Link href="/" className="btn btn-ghost btn-sm no-underline hover:no-underline">Back to Simple home</Link>
        <button type="button" className="btn btn-primary btn-sm" onClick={() => setMode('full')}>Switch to Full view</button>
      </span>
    </div>
  );
}
