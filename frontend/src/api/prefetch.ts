// Starts a page's data while the mouse rests on its menu link, so it is often in by the click (owner, 2026-11-07).
// Each entry matches the page's own requests (the same addresses and month); a miss only costs one early request.
import type { QueryClient } from '@tanstack/react-query';
import { apiGet } from './client';

type Ask = [string, Record<string, string | undefined>];
const PAGES: Record<string, (period?: string, month?: string) => Ask[]> = {
  '/': (p, m) => [['/score', { period: p }], ['/metrics', { period: p }], ['/actions', { period: p }], ['/alerts', { period: m }], ['/consent', { period: p }], ['/data-health', {}]],
  '/scorecard': (p) => [['/domains', { period: p }], ['/score', { period: p }], ['/metrics', { period: p }]],
  '/actions': (p) => [['/actions', { period: p }], ['/score', { period: p }]],
  '/alerts': (_p, m) => [['/alerts', { period: m }]],
  '/ledger': (_p, m) => [['/contacts', { status: 'ALL', q: '', period: m }], ['/consent', { period: m }]],
  '/consent': (p) => [['/consent', { period: p }], ['/certificates', { period: p }]],
  '/revocation': (_p, m) => [['/revocation', { period: m }], ['/optouts', { period: m }]],
  '/who-contact': (_p, m) => [['/who-contact', { period: m }]],
  '/vault': (_p, m) => [['/vault', { period: m }], ['/legal-holds', {}]],
  '/conduct': (p, m) => [['/conduct', { period: m }], ['/metrics', { period: p }]],
  '/leads': (_p, m) => [['/leads', { period: m }], ['/provenance', { period: m }], ['/proof-requests', { period: m }]],
  '/vendors': (_p, m) => [['/vendors', { period: m }]],
  '/sources': (_p, m) => [['/sources', { period: m }], ['/uploads', { period: m }]],
  '/reports': () => [['/reports', {}]],
  '/rulebook': (_p, m) => [['/rulebook', { period: m }]],
  '/regulatory': (_p, m) => [['/reg-changes', { period: m }]],
  '/settings': () => [['/settings', {}]],
  '/users': () => [['/users', {}]],
  '/setup': () => [['/readiness', {}]],
};

export function prefetchPage(client: QueryClient, href: string, period?: string, month?: string): void {
  for (const [path, query] of PAGES[href]?.(period, month) ?? []) {
    void client.prefetchQuery({ queryKey: [path, query], queryFn: () => apiGet(path, query) });
  }
}
