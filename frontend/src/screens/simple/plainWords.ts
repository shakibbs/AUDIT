import type { Severity } from '@/api/types';

/** Severity in everyday words for Simple view. */
export const SEVERITY_WORD: Record<Severity, { label: string; pill: string }> = {
  High: { label: 'Urgent', pill: 'pill-red' },
  Medium: { label: 'Important', pill: 'pill-amber' },
  Low: { label: 'Minor', pill: 'pill-gray' },
};
