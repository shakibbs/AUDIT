import { describe, expect, it } from 'vitest';
import type { Session } from '@/api/types';
import { mockApi } from '@/mock/api';
import { mergeSession } from '@/server/mergeSession';

describe('a real insurer session (Module 15 step 3)', () => {
  it('keeps the insurer\'s own name and hides the sample view switch', () => {
    const mock = mockApi({ method: 'GET', path: '/session' }).body as Session;
    const merged = mergeSession({ signedIn: true, view: 'underwriter', clientName: 'Atlas Mutual', vertical: 'Insurer', sampleData: false }, mock);
    expect(merged.view).toBe('underwriter');
    expect(merged.clientName).toBe('Atlas Mutual');
    expect(merged.sampleData).toBe(false);
  });
});
