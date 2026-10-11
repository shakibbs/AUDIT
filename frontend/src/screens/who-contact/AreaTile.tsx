'use client';

import type { WhoArea } from '@/api/types';
import { areaState, STATE_META } from '@/lib/whoContact';
import { useDrawer } from '@/state/DrawerContext';
import { StateDot } from './StateDot';

/** One area (DNC, internal list, reassigned, litigation): coloured by its worst check, showing that check. */
export function AreaTile({ area }: { area: WhoArea }) {
  const { open } = useDrawer();
  const state = areaState(area);
  const top = area.checks.find((c) => c.state === state) ?? area.checks[0];
  return (
    <button type="button" className="card kpi text-left" style={{ borderTop: `3px solid ${STATE_META[state].color}` }} onClick={() => open('who-area', area.id)}>
      <span className="kpi-tag flex items-center justify-between gap-2">{area.title}<StateDot state={state} /></span>
      <span className="kpi-val" style={{ color: STATE_META[state].color }}>{top.result}</span>
      <span className="kpi-foot">{top.name}</span>
    </button>
  );
}
