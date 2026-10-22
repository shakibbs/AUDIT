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

describe('each client user\'s own view (2026-10-22)', () => {
  it('follows Django: a client in the Underwriter view gets real data, the Owner view keeps the sample pages', () => {
    const mock = mockApi({ method: 'GET', path: '/session' }).body as Session;
    const under = mergeSession({ signedIn: true, view: 'underwriter', orgKind: 'client', canSwitchView: true, clientName: 'QA Test Co' }, mock);
    expect([under.view, under.sampleData, under.clientName]).toEqual(['underwriter', false, 'QA Test Co']);
    const owner = mergeSession({ signedIn: true, view: 'owner', orgKind: 'client', canSwitchView: true }, { ...mock, view: 'underwriter' });
    expect(owner.view).toBe('owner');  // the shared sample switch no longer decides anyone's view
  });
});
