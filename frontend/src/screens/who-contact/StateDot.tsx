import type { WhoState } from '@/api/types';
import { STATE_META } from '@/lib/whoContact';

/** Small coloured dot for a check's state; the label is read by screen readers. */
export function StateDot({ state }: { state: WhoState }) {
  return <span role="img" aria-label={STATE_META[state].label} className="inline-block h-2 w-2 flex-none rounded-full" style={{ background: STATE_META[state].color }} />;
}
