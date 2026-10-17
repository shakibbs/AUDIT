import type { ConsentStatus } from '@/api/types';

const CLASS: Record<ConsentStatus, string> = { VERIFIED: 'st-v', WEAK: 'st-w', CONFLICTING: 'st-c', NO_PROOF: 'st-n', PENDING: 'st-p', NOT_CHECKED: 'st-p', NOT_NEEDED: 'st-p' };
const LABEL: Partial<Record<ConsentStatus, string>> = { NOT_CHECKED: 'Not checked yet', NOT_NEEDED: 'Not needed' };

/** Consent status as a labelled chip; the label carries the meaning, the tint only supports it. */
export function StatusChip({ status }: { status: ConsentStatus }) {
  return <span className={`st ${CLASS[status]}`}>{LABEL[status] ?? status}</span>;
}
