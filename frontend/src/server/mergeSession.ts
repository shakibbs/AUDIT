// Joins Django's answer (who is signed in) with the mock's sample-only fields (months, runs, view switch).
import type { Session } from '@/api/types';

export function mergeSession(backend: Partial<Session>, mock: Session): Partial<Session> {
  if (!backend.signedIn) return { signedIn: false };
  // A real insurer or acquirer (Module 15): its own name, and no sample view switch.
  if (backend.view === 'underwriter') return { ...mock, ...backend, sampleData: false };
  // The underwriter view shows the insurer's sample identity, not the signed-in client user.
  if (mock.view === 'underwriter') return { ...mock, signedIn: true };
  return { ...mock, ...backend, sampleData: true };
}
