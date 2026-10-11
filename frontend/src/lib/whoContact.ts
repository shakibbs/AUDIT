import type { CheckColumn, CheckSource, WhoState, WhoArea } from '@/api/types';

export const STATE_META: Record<WhoState, { label: string; color: string }> = {
  fail: { label: 'Failing', color: 'var(--bad)' },
  warn: { label: 'Needs attention', color: 'var(--warn)' },
  unverified: { label: 'Not verified', color: 'var(--txt-3)' },
  pass: { label: 'Passing', color: 'var(--ok)' },
};
export const STATE_ORDER: WhoState[] = ['fail', 'warn', 'unverified', 'pass'];

export const SOURCE_META: Record<CheckSource, { label: string; pill: string }> = {
  provider: { label: 'Provider', pill: 'pill-green' },
  list: { label: 'Uploaded list', pill: 'pill-teal' },
  stated: { label: 'Checked by you', pill: 'pill-amber' },
  none: { label: 'Not checked', pill: 'pill-red' },
  records: { label: 'Your records', pill: 'pill-gray' },
};

export const CHECK_COLUMNS: [CheckColumn, string][] = [['national', 'National DNC'], ['state', 'State DNC'], ['internal', 'Internal DNC'], ['reassigned', 'Reassigned']];

// For an area, an unproven check outranks a warning: it counts as not done.
const AREA_ORDER: WhoState[] = ['fail', 'unverified', 'warn', 'pass'];

/** An area takes the worst state among its checks. */
export function areaState(area: WhoArea): WhoState {
  return AREA_ORDER.find((s) => area.checks.some((c) => c.state === s)) ?? 'pass';
}
