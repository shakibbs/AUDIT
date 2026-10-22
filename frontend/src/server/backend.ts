// Forwards the login endpoints to the Django backend when BACKEND_URL is set; everything else stays on the mock.
import type { NextRequest } from 'next/server';

/** First path segments Django answers today. */
// The Data health card is /data-health (Django's own /api/health is the server check, not forwarded).
// Pages already served by Django when BACKEND_URL is set; every other page still uses the sample data.
const BACKEND_PATHS = ['session', 'users', 'invites', 'rulebook', 'reg-changes', 'rule-updates', 'sources', 'data-health', 'contacts', 'evidence', 'can-call', 'optouts', 'consent', 'certificates', 'consent-pages', 'provenance', 'proof-requests', 'access-log', 'uploads', 'conduct', 'billed-numbers', 'position', 'hash-check', 'alerts', 'vendor-contracts', 'vendor-disputes', 'evidence-file', 'evidence-bundle', 'legal-holds', 'buyer-links', 'statements', 'rating-engine'];
// Answered by Django for a real insurer; a client trying the sample insurer view is refused there and gets the sample.
export const SAMPLE_WHEN_REFUSED = ['rating-engine'];
// Pages that are partly real: Django sends only the fields it really has; the rest still comes from the sample until
// its module is built (nothing on the page is lost). Only reads; changes on these pages stay with the sample.
const MERGE_PATHS = ['vault', 'settings', 'revocation', 'insureds', 'metrics', 'who-contact', 'readiness', 'leads', 'vendors', 'litigation', 'score', 'domains', 'actions', 'reports'];
// Changes on a partly real page that Django already saves (the rest stay with the sample).
const WRITE_PATHS = ['who-contact', 'actions', 'reports', 'settings', 'setup'];  // settings: alert email choices; setup: checklist ticks

export function mergesBackend(path: string[], method: string): boolean {
  return Boolean(process.env.BACKEND_URL) && method === 'GET' && MERGE_PATHS.includes(path[0]);
}

type Keyed = Record<string, unknown>;
/** Which field names a list's items: a metric code, an id, or a name. */
function keyOf(list: unknown[]): string | null {
  for (const key of ['code', 'id', 'name']) if (list.every((x) => x && typeof x === 'object' && key in (x as object))) return key;
  return null;
}

/** Real fields over sample fields. Objects are merged inside. Lists of named items (metrics by code, areas by id, checks
 * by name) are merged item by item: an item not built yet keeps its sample, a new real item is added; when no real item
 * matches a sample one (e.g. your own vendors), the real list replaces the sample. Other values are replaced. */
export function overlay(sample: unknown, real: unknown): unknown {
  if (Array.isArray(sample) && Array.isArray(real) && real.length) {
    const key = keyOf(sample) && keyOf(sample) === keyOf(real) ? keyOf(sample)! : null;
    if (key) {
      const realBy = new Map((real as Keyed[]).map((r) => [r[key], r]));
      if ((sample as Keyed[]).some((s) => realBy.has(s[key]))) {
        const merged = (sample as Keyed[]).map((s) => (realBy.has(s[key]) ? overlay(s, realBy.get(s[key])) : s));
        const seen = new Set((sample as Keyed[]).map((s) => s[key]));
        return [...merged, ...(real as Keyed[]).filter((r) => !seen.has(r[key]))];
      }
    }
  }
  if (sample && real && typeof sample === 'object' && typeof real === 'object' && !Array.isArray(sample) && !Array.isArray(real)) {
    const out: Record<string, unknown> = { ...(sample as Record<string, unknown>) };
    for (const [k, v] of Object.entries(real as Record<string, unknown>)) out[k] = k in out ? overlay(out[k], v) : v;
    return out;
  }
  return real;
}

// The view switch is a sample-data feature; it stays on the mock.
export function usesBackend(path: string[]): boolean {
  if (process.env.BACKEND_URL && WRITE_PATHS.includes(path[0])) return true;  // reads still merge (route.ts checks merges first)
  return Boolean(process.env.BACKEND_URL) && BACKEND_PATHS.includes(path[0]);
}

const PASS_HEADERS = ['cookie', 'content-type', 'x-csrftoken', 'origin', 'user-agent'];

/** Sends the request on to Django and returns its answer, cookies included. */
export async function forward(request: NextRequest, path: string[]): Promise<Response> {
  const url = `${process.env.BACKEND_URL}/api/${path.join('/')}${request.nextUrl.search}`;
  const headers = new Headers();
  for (const name of PASS_HEADERS) {
    const value = request.headers.get(name);
    if (value) headers.set(name, value);
  }
  // Bytes, not text: proof files are uploaded through here.
  const body = request.method === 'GET' ? undefined : await request.arrayBuffer();
  const reply = await fetch(url, { method: request.method, headers, body, redirect: 'manual', cache: 'no-store' });

  const out = new Headers({ 'content-type': reply.headers.get('content-type') ?? 'application/json' });
  const viewer = reply.headers.get('x-civ-viewer');
  if (viewer) out.set('x-civ-viewer', viewer);  // Module 15: a real insurer's pages carry no sample
  for (const cookie of reply.headers.getSetCookie()) out.append('set-cookie', cookie);
  // Bytes, not text: photos of consent pages pass through unchanged.
  return new Response(reply.status === 204 ? null : await reply.arrayBuffer(), { status: reply.status, headers: out });
}
