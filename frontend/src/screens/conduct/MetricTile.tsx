'use client';

import type { Metric } from '@/api/types';
import { KeyNumberCard } from '@/screens/overview/KeyNumberCard';
import { useDrawer } from '@/state/DrawerContext';

/** One metric as a card: value, four-month trend, change since last month, and a one-line note. Opens the metric panel. */
export function MetricTile({ metric, since }: { metric: Metric; since: string }) {
  const { open } = useDrawer();
  const unit = metric.unit === '%' ? '%' : metric.unit === 'h' ? ' h' : '';
  const hasTrend = !metric.notMeasured && metric.value !== null && metric.history.filter((v) => v !== null).length >= 2;
  return (
    <KeyNumberCard tag={metric.name} code={metric.code} value={metric.notMeasured ? 'Not measured' : metric.display}
      trend={hasTrend ? { values: metric.history, better: metric.better, unit, since } : undefined}
      foot={metric.notMeasured ?? metric.note} onClick={() => open('metric', metric.code)} />
  );
}
