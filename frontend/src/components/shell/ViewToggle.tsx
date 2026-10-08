'use client';

import { Seg } from '@/components/ui/Seg';
import { useViewMode, type ViewMode } from '@/state/ViewModeContext';

const OPTIONS = [{ id: 'simple', label: 'Simple' }, { id: 'full', label: 'Full' }] as const;

/** Switches the whole portal between Simple view and Full view. */
export function ViewToggle() {
  const { mode, setMode } = useViewMode();
  return <Seg<ViewMode> label="View" options={OPTIONS} value={mode} onChange={setMode} />;
}
