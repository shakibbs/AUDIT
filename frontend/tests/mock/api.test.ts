import { describe, expect, it } from 'vitest';
import type { Action, Domain, Metric, Rulebook, ScoreSummary, SearchHit, Session } from '@/api/types';
import { assertNoBannedWordsDeep } from '@/lib/wording';
import { mockApi } from '@/mock/api';

const get = <T,>(path: string, query: Record<string, string> = {}) => mockApi({ method: 'GET', path, query }).body as T;

const READS = ['/session', '/score', '/domains', '/actions', '/alerts', '/contacts', '/consent', '/consent-pages', '/revocation', '/vault', '/position', '/legal-holds',
  '/evidence/%2B14805550923', '/metrics', '/conduct', '/leads', '/vendors', '/sources', '/uploads', '/reports', '/rulebook', '/reg-changes', '/readiness', '/settings', '/users', '/access-log', '/health'];

describe('mock API', () => {
  it.each(READS)('GET %s answers and uses no banned wording', (path) => {
    const result = mockApi({ method: 'GET', path });
    expect(result.status).toBe(200);
    assertNoBannedWordsDeep(result.body, path);
  });

  it('holds 25 domains and 33 metrics', () => {
    expect(get<Domain[]>('/domains')).toHaveLength(25);
    expect(get<Metric[]>('/metrics')).toHaveLength(33);
  });

  it('averages only measured, non-excluded domains into the score', () => {
    const scored = get<Domain[]>('/domains').filter((d) => d.score !== null && !d.excluded);
    const mean = scored.reduce((sum, d) => sum + (d.score ?? 0), 0) / scored.length;
    const score = get<ScoreSummary>('/score');
    expect(score.score).toBeCloseTo(mean, 5);
    expect(score.domainsMeasured).toBe(scored.length);
  });

  it('returns an earlier month when a period is given', () => {
    const june = get<ScoreSummary>('/score', { period: '2026-06' });
    expect(june.score).toBe(68.4);
    expect(june.history).toHaveLength(1);
  });

  it('never shows internal runs or rulebook impact in the portal, even to a client Admin', () => {
    for (const role of ['admin', 'member']) {
      mockApi({ method: 'POST', path: '/session/view-as', body: { role } });
      expect(get<Session>('/session').runs).toHaveLength(1);
      expect(get<Rulebook>('/rulebook').impact).toHaveLength(0);
    }
  });

  it('lets only an Admin change people, and keeps one Admin', () => {
    mockApi({ method: 'POST', path: '/session/view-as', body: { role: 'member' } });
    expect(mockApi({ method: 'POST', path: '/users', body: { email: 'x@y.example' } }).status).toBe(403);
    mockApi({ method: 'POST', path: '/session/view-as', body: { role: 'admin' } });
    expect(mockApi({ method: 'DELETE', path: '/users/u-1' }).status).toBe(400);
    expect(mockApi({ method: 'PATCH', path: '/users/u-3', body: { isCounsel: true } }).status).toBe(200);
  });

  it('refuses data after sign-out and restores it after sign-in', () => {
    mockApi({ method: 'POST', path: '/session/sign-out' });
    expect(mockApi({ method: 'GET', path: '/score' }).status).toBe(401);
    expect(mockApi({ method: 'POST', path: '/session/sign-in', body: { email: 'a@b.example', password: 'x' } }).status).toBe(200);
    expect(mockApi({ method: 'GET', path: '/score' }).status).toBe(200);
  });

  it('updates an action and recomputes overdue', () => {
    const before = get<Action[]>('/actions').find((a) => a.id === 'a-3');
    expect(before?.overdue).toBe(false);
    mockApi({ method: 'PATCH', path: '/actions/a-3', body: { due: '2026-09-01', assignee: 'Priya Nair' } });
    const after = get<Action[]>('/actions').find((a) => a.id === 'a-3');
    expect(after).toMatchObject({ overdue: true, assignee: 'Priya Nair' });
  });

  it('finds domains, metrics, numbers, vendors and pages', () => {
    const kinds = (q: string) => get<SearchHit[]>('/search', { q }).map((h) => h.kind);
    expect(kinds('REV')).toContain('domain');
    expect(kinds('M08')).toContain('metric');
    expect(kinds('480555')).toContain('number');
    expect(kinds('Vendor E')).toContain('vendor');
    expect(kinds('rulebook')).toContain('page');
  });

  it('matches a known fingerprint and rejects an unknown one', () => {
    expect(get<{ found: boolean }>('/hash-check', { hash: `4f9c${'0'.repeat(56)}a71e` }).found).toBe(true);
    expect(get<{ found: boolean }>('/hash-check', { hash: 'abc' }).found).toBe(false);
  });

  it('refuses client records to an underwriter and the insurer book to a client', () => {
    expect(mockApi({ method: 'GET', path: '/insureds' }).status).toBe(403);
    expect(mockApi({ method: 'GET', path: '/insureds/sunpath' }).status).toBe(200);
    expect(mockApi({ method: 'GET', path: '/insureds/meridian' }).status).toBe(403);
    expect(mockApi({ method: 'GET', path: '/litigation' }).status).toBe(403);
    mockApi({ method: 'POST', path: '/session/view-as', body: { view: 'underwriter' } });
    for (const path of ['/contacts', '/actions', '/alerts', '/evidence/%2B14805550923', '/sources', '/users', '/access-log']) {
      expect(mockApi({ method: 'GET', path }).status).toBe(403);
    }
    expect(mockApi({ method: 'PATCH', path: '/actions/a-1', body: { status: 'resolved' } }).status).toBe(403);
    expect(mockApi({ method: 'GET', path: '/insureds' }).status).toBe(200);
    expect(mockApi({ method: 'GET', path: '/insureds/meridian' }).status).toBe(200);
    assertNoBannedWordsDeep(mockApi({ method: 'GET', path: '/insureds' }).body, '/insureds');
    assertNoBannedWordsDeep(mockApi({ method: 'GET', path: '/litigation' }).body, '/litigation');
    expect(get<Session>('/session')).toMatchObject({ name: 'J. Merchant', orgKind: 'insurer' });
    expect(get<SearchHit[]>('/search', { q: 'meridian' }).map((h) => h.kind)).toEqual(['insured']);
  });
});
