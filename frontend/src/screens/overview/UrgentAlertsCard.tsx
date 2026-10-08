'use client';

import Link from 'next/link';
import type { Alert } from '@/api/types';
import { Card } from '@/components/ui/Card';
import { Empty } from '@/components/ui/Empty';
import { SeverityPill } from '@/components/ui/SeverityPill';
import { formatDateTime } from '@/lib/format';

const ORDER = { High: 0, Medium: 1, Low: 2 };

/** The newest alerts nobody has reviewed yet, most severe first. */
export function UrgentAlertsCard({ alerts }: { alerts: Alert[] }) {
  const open = alerts.filter((a) => !a.reviewed).sort((a, b) => ORDER[a.severity] - ORDER[b.severity] || b.at.localeCompare(a.at));
  return (
    <Card title="Alerts to review" sub={`${open.length} not reviewed`} flush right={<Link href="/alerts" className="text-[12.5px] font-semibold">All alerts</Link>}>
      {open.length === 0 ? <Empty>Every alert has been reviewed.</Empty> : open.slice(0, 4).map((a) => (
        <Link key={a.id} href="/alerts" className="row-item text-txt no-underline hover:bg-surface-3 hover:no-underline">
          <SeverityPill severity={a.severity} />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[13.5px] font-semibold">{a.title}</span>
            <span className="tiny">{a.kind} · {formatDateTime(a.at)} UTC</span>
          </span>
        </Link>
      ))}
    </Card>
  );
}
