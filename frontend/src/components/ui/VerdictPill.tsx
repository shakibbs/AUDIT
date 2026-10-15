import type { CallingWindow } from '@/api/types';

const PILL: Record<CallingWindow['verdict'], [string, string]> = {
  ok: ['pill-green', 'OK to call now'], not_safe: ['pill-red', 'Not safe now'], unknown: ['pill-gray', 'Cannot tell'],
};

/** The answer to "may this person be called right now?". */
export function VerdictPill({ verdict }: { verdict: CallingWindow['verdict'] }) {
  return <span className={`pill ${PILL[verdict][0]}`}>{PILL[verdict][1]}</span>;
}
