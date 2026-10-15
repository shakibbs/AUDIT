'use client';

import { useMemo, useState } from 'react';
import type { Rulebook, RuleStatus } from '@/api/types';
import { StackedBar } from '@/components/charts/StackedBar';
import { Card } from '@/components/ui/Card';
import { Kpi } from '@/components/ui/Kpi';
import { Seg } from '@/components/ui/Seg';
import { RuleStatusPill } from './RuleStatusPill';
import { ImpactTable } from './ImpactTable';

const FILTERS = [{ id: 'all', label: 'All' }, { id: 'set', label: 'Set' }, { id: 'proposed', label: 'Proposed' }, { id: 'tbd', label: 'TBD' }] as const;

/** Every rule in force today: counts, then the list with a search box and a status filter. */
export function SettingsTab({ rulebook: r }: { rulebook: Rulebook }) {
  const [status, setStatus] = useState<'all' | RuleStatus>('all');
  const [q, setQ] = useState('');
  const rows = useMemo(() => r.settings.filter((s) => (status === 'all' || s.status === status)
    && (!q || `${s.key} ${s.meaning ?? ''} ${s.value} ${s.place ?? ''}`.toLowerCase().includes(q.toLowerCase()))), [r.settings, status, q]);
  return (
    <div className="flex flex-col gap-5">
      <div className="grid gap-4 sm:grid-cols-3">
        <Kpi tag="Set" value={String(r.set)} foot="Decided" />
        <Kpi tag="Proposed" value={String(r.proposed)} foot="Runs; results marked provisional" />
        <Kpi tag="TBD" value={String(r.tbd)} foot="Not set yet; dependent checks do not run" />
      </div>
      <Card title={r.version} sub={`${r.set + r.proposed + r.tbd} rules by status`}>
        <StackedBar height={18} label="Rules by status" segments={[
          { label: 'Set', value: r.set, color: 'var(--series-1)' }, { label: 'Proposed', value: r.proposed, color: 'var(--series-2)' }, { label: 'TBD', value: r.tbd, color: 'var(--series-muted)' },
        ]} />
      </Card>
      <Card title="Settings in force" sub={`${rows.length} of ${r.settings.length} rules · federal values, with state rows where a state differs`} flush
        right={<div className="flex flex-wrap items-center gap-2">
          <input className="field !w-56 !py-1.5" type="search" placeholder="Search rules…" aria-label="Search rules" value={q} onChange={(e) => setQ(e.target.value)} />
          <Seg label="Status" options={FILTERS} value={status} onChange={setStatus} />
        </div>}>
        <div className="overflow-x-auto">
          <table className="tbl">
            <thead><tr><th>Rule</th><th>Place</th><th>Value in force</th><th>Owner</th><th>Status</th></tr></thead>
            <tbody>
              {rows.map((s) => (
                <tr key={`${s.key}-${s.place ?? 'Federal'}-${s.since ?? ''}`}>
                  <td><div className="mono text-[12px] font-semibold">{s.key}</div>{s.meaning && <div className="tiny max-w-md">{s.meaning}</div>}</td>
                  <td className="text-txt-2">{s.place ?? 'Federal'}</td>
                  <td>{s.value}</td>
                  <td className="text-txt-2">{s.owner}{s.counselItem && <span className="tiny"> · {s.counselItem}</span>}</td>
                  <td><RuleStatusPill status={s.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      {r.impact.length > 0 && <ImpactTable impact={r.impact} />}
    </div>
  );
}
