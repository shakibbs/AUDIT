'use client';

import { useViewMode } from '@/state/ViewModeContext';

/** Renders the Simple-view or Full-view version of a page. */
export function ViewSwitch({ simple, full }: { simple: React.ReactNode; full: React.ReactNode }) {
  const { mode } = useViewMode();
  return <>{mode === 'simple' ? simple : full}</>;
}
