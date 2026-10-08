import Link from 'next/link';
import type { Action, Alert, DataHealth, ScoreSummary } from '@/api/types';
import { Icon } from '@/components/ui/Icon';

interface Item { key: string; text: string; href: string }

/** Red strip at the top of the Overview listing what needs attention now. Hidden when nothing does. */
export function AttentionBanner({ score, alerts = [], actions = [], health }: {
  score: ScoreSummary; alerts?: Alert[]; actions?: Action[]; health?: DataHealth;
}) {
  const items: Item[] = [];
  const highAlerts = alerts.filter((a) => a.severity === 'High' && !a.reviewed).length;
  if (highAlerts) items.push({ key: 'alerts', text: `${highAlerts} high alert${highAlerts > 1 ? 's' : ''} not reviewed`, href: '/alerts' });
  for (const cap of score.caps.filter((c) => c.held)) items.push({ key: cap.name, text: `${cap.name} is holding your grade`, href: '/scorecard' });
  const highActions = actions.filter((a) => a.severity === 'High' && a.status !== 'resolved').length;
  if (highActions) items.push({ key: 'actions', text: `${highActions} high-priority problem${highActions > 1 ? 's' : ''} to fix`, href: '/actions' });
  if (health && health.sources.stale) items.push({ key: 'stale', text: `${health.sources.stale} source${health.sources.stale > 1 ? 's' : ''} stopped syncing`, href: '/sources' });
  if (health && health.recordsCompleteness < health.completenessFloor) items.push({ key: 'records', text: 'Records completeness below the floor', href: '/sources' });
  if (!items.length) return null;

  return (
    <div role="alert" className="flex flex-wrap items-center gap-x-4 gap-y-2.5 rounded-[12px] border px-[18px] py-3.5"
      style={{ background: 'rgba(220, 38, 38, 0.07)', borderColor: 'rgba(220, 38, 38, 0.35)', color: 'var(--bad-ink)' }}>
      <span className="flex items-center gap-2 text-[13.5px] font-bold">
        <Icon name="alert" size={18} />Needs attention · {items.length}
      </span>
      <ul className="m-0 flex flex-1 list-none flex-wrap gap-2 p-0">
        {items.map((i) => (
          <li key={i.key}>
            <Link href={i.href} className="pill pill-red inline-flex items-center gap-1 !text-[12px] font-semibold hover:underline">
              {i.text}<Icon name="chevron-right" size={12} />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
