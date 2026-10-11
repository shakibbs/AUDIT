'use client';

import type { WhoArea } from '@/api/types';
import { Card } from '@/components/ui/Card';
import { STATE_META, STATE_ORDER } from '@/lib/whoContact';
import { useDrawer } from '@/state/DrawerContext';
import { SourceChip } from './SourceChip';
import { StateDot } from './StateDot';

/** Every check from every area, grouped Failing → Passing. A row opens its area. */
export function ChecksList({ areas }: { areas: WhoArea[] }) {
  const { open } = useDrawer();
  const all = areas.flatMap((a) => a.checks.map((c) => ({ ...c, areaId: a.id })));
  return (
    <Card title="Checks" flush>
      <table className="tbl">
        <tbody>
          {STATE_ORDER.map((state) => {
            const rows = all.filter((c) => c.state === state);
            if (rows.length === 0) return null;
            return [
              <tr key={state}><td colSpan={4} className="!pb-1 !pt-4 text-[12px] font-semibold" style={{ color: STATE_META[state].color }}>{STATE_META[state].label} · {rows.length}</td></tr>,
              ...rows.map((c) => (
                <tr key={`${c.areaId}-${c.name}`} className="clickrow" onClick={() => open('who-area', c.areaId)}>
                  <td className="w-4"><StateDot state={c.state} /></td>
                  <td>{c.name}{c.isNew && <span className="ml-1 text-[12px] font-semibold" style={{ color: 'var(--bad-ink)' }}>· new</span>}</td>
                  <td className="mono font-semibold">{c.result}</td>
                  <td className="text-right"><SourceChip source={c.source} /></td>
                </tr>
              )),
            ];
          })}
        </tbody>
      </table>
    </Card>
  );
}
