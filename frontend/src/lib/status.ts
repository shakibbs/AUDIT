import type { ConsentStatus } from '@/api/types';

/** Reserved status colours; always shown with the status name beside them. */
export const STATUS_COLOR: Record<ConsentStatus, string> = {
  VERIFIED: 'var(--ok)', WEAK: 'var(--warn)', CONFLICTING: 'var(--serious)', NO_PROOF: 'var(--bad)', PENDING: 'var(--series-muted)', NOT_CHECKED: 'var(--series-muted)',
  NOT_NEEDED: 'var(--series-muted)',
};

export const STATUS_MEANING: Record<ConsentStatus, string> = {
  VERIFIED: 'All five checks pass.',
  WEAK: 'Proof exists but has a fixable gap.',
  CONFLICTING: 'Two sources disagree about the proof.',
  NO_PROOF: 'No accepted proof was found for the contact.',
  PENDING: 'A certificate has not been read yet. Left out of totals until it is.',
  NOT_CHECKED: 'The consent engine has not checked it yet. This is not a worst-case result.',
  NOT_NEEDED: 'No consent needed: the person contacted the client, or it is one of CiV’s test numbers.',
};

export const CHECK_NAMES = ['Proof exists', 'Proof can be opened', 'Proof matches the contact', 'Sources agree', 'No gaps in the record'];
