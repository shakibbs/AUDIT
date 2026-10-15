import type { RuleStatus } from '@/api/types';

const STATUS: Record<RuleStatus, [string, string, string]> = {
  set: ['pill-green', 'Set', 'Decided'],
  proposed: ['pill-amber', 'Proposed', 'Runs; results are marked provisional until a lawyer confirms it'],
  tbd: ['pill-gray', 'TBD', 'Not set yet: checks that need it do not run'],
};

/** Set / Proposed / TBD, with what it means on hover. */
export function RuleStatusPill({ status }: { status: RuleStatus }) {
  const [pill, label, title] = STATUS[status];
  return <span className={`pill ${pill}`} title={title}>{label}</span>;
}
