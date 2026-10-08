'use client';

import Link from 'next/link';
import type { DataHealth } from '@/api/types';
import { StackedBar } from '@/components/charts/StackedBar';
import { formatDateTime } from '@/lib/format';

/** Whether the data behind the dashboard is connected, fresh and complete. */
export function DataHealthCard({ health }: { health: DataHealth }) {
  const s = health.sources;
  return (
    <section className="card card-pad grid gap-5 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,1fr)]">
      <div>
        <div className="kpi-tag mb-2">Connected sources</div>
        <StackedBar height={12} label="Sources by status" segments={[
          { label: 'Live', value: s.live, color: 'var(--ok)' },
          { label: 'Stale', value: s.stale, color: 'var(--warn)' },
          { label: 'Not supplied', value: s.notSupplied, color: 'var(--series-muted)' },
        ]} />
      </div>
      <div>
        <div className="kpi-tag mb-1">Data access level</div>
        <div className="font-display text-[22px] font-extrabold leading-tight">Level {health.accessLevel} <span className="text-[13px] font-semibold text-txt-2">of 4</span></div>
        <div className="tiny mt-1">{health.accessLabel.replace(/^Level \d · /, '')}</div>
      </div>
      <div>
        <div className="kpi-tag mb-1">Last change received</div>
        <div className="font-display text-[22px] font-extrabold leading-tight">{formatDateTime(health.lastChangeAt)}</div>
        <div className="tiny mt-1">UTC · live sync, hourly catch-up · <Link href="/sources">Source Registry</Link></div>
      </div>
    </section>
  );
}
