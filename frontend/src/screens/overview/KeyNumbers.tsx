'use client';

import { useRouter } from 'next/navigation';
import type { DataHealth, Metric } from '@/api/types';
import { useDrawer } from '@/state/DrawerContext';
import { KeyNumberCard } from './KeyNumberCard';

/** Six numbers that matter most: permission, stopping, and how complete the record is. */
export function KeyNumbers({ metrics, health, since }: { metrics: Metric[]; health: DataHealth | undefined; since: string }) {
  const { open } = useDrawer();
  const router = useRouter();
  const m = (code: string) => metrics.find((x) => x.code === code);
  const trendOf = (x: Metric | undefined) => (x ? { values: x.history, better: x.better, unit: x.unit === '%' ? '%' : x.unit === 'h' ? ' h' : '', since } : undefined);
  const coverage = m('M01');
  const afterOptOut = m('M10');
  const stop = m('M08');
  const notMeasured = metrics.filter((x) => x.notMeasured);
  const review = health?.conversationReview ?? null;
  const completeness = health?.recordsCompleteness ?? null;
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <KeyNumberCard tag="Consent coverage" value={coverage?.display ?? '—'} trend={trendOf(coverage)}
        foot="Contacts that need proof of permission and have it" onClick={() => open('metric', 'M01')} />
      <KeyNumberCard tag="Contacts after opt-out" value={afterOptOut?.display ?? '—'} trend={trendOf(afterOptOut)}
        foot={afterOptOut?.note ?? ''} onClick={() => open('metric', 'M10')} />
      <KeyNumberCard tag="Median time to stop" value={stop?.display ?? '—'} trend={trendOf(stop)}
        foot="From an opt-out to every system stopping" onClick={() => open('metric', 'M08')} />
      <KeyNumberCard tag="Opt-outs your dialer missed" value={review ? String(review.missed) : 'Not yet measured'} unit={review ? `of ${review.optOutsFound}` : undefined}
        bar={review ? { share: review.missed / Math.max(1, review.optOutsFound), caption: `${review.notMarkedFirstCheck} were not marked at first check`, tone: 'bad' } : undefined}
        foot={review ? `Found by AI review of ${review.reviewed.toLocaleString('en-US')} calls and texts` : 'Comes with AI review of calls and texts'} onClick={() => router.push('/revocation')} />
      <KeyNumberCard tag="Records completeness" value={completeness !== null ? `${Math.round(completeness * 100)}%` : health?.completenessStatus === 'not_available' ? 'Not available' : 'Not yet measured'}
        bar={health && completeness !== null ? { share: Math.min(1, completeness), caption: `${completeness >= health.completenessFloor ? 'Complete' : 'Incomplete data'} · flagged below ${Math.round(health.completenessFloor * 100)}%`, tone: completeness >= health.completenessFloor ? 'ok' : 'bad' } : undefined}
        foot={health?.completenessNote ?? 'Your logs compared with your carrier and platform bills'} onClick={() => router.push('/sources')} />
      <KeyNumberCard tag="Not measured" value={String(notMeasured.length)} unit="metrics"
        bar={{ share: notMeasured.length / Math.max(1, metrics.length), caption: `${notMeasured.length} of ${metrics.length} metrics wait for a source`, tone: 'bad' }}
        foot={`${notMeasured.map((x) => x.code).join(', ')}: supply the missing source to measure them`} onClick={() => router.push('/sources')} />
    </div>
  );
}
