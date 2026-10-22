// Joins Django's answer (who is signed in) with the mock's sample-only fields (months, runs, view switch).
import type { Session } from '@/api/types';

export function mergeSession(backend: Partial<Session>, mock: Session): Partial<Session> {
  if (!backend.signedIn) return { signedIn: false };
  // Django decides the view per person (owner decision 2026-10-22): an insurer is always Underwriter; a client user
  // picks their own. In the Underwriter view everything is real (no sample identity, no sample companies).
  if (backend.view === 'underwriter') return { ...mock, ...backend, sampleData: false };
  return { ...mock, ...backend, view: 'owner', sampleData: true };
}
