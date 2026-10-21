// Serves /api/*: the login endpoints go to Django when BACKEND_URL is set; the rest come from the mock.
import { NextResponse, type NextRequest } from 'next/server';
import type { SearchHit, Session } from '@/api/types';
import { mockApi } from '@/mock/api';
import { litigation } from '@/mock/data/insurer';
import { forward, mergesBackend, overlay, SAMPLE_WHEN_REFUSED, usesBackend } from '@/server/backend';
import { mergeSession } from '@/server/mergeSession';

type Ctx = { params: Promise<{ path: string[] }> };

async function handle(request: NextRequest, { params }: Ctx): Promise<Response> {
  const { path } = await params;
  // Search: your real numbers and vendors from Django, pages, domains and metrics from the portal's own list.
  if (process.env.BACKEND_URL && path[0] === 'search' && request.method === 'GET') {
    const query = Object.fromEntries(request.nextUrl.searchParams);
    const reply = await forward(request, path);
    const sample = mockApi({ method: 'GET', path: '/search', query }).body as SearchHit[];
    const real = reply.ok ? ((await reply.json()) as SearchHit[]) : [];
    return NextResponse.json([...real, ...sample.filter((h) => h.kind !== 'number' && h.kind !== 'vendor')].slice(0, 10));
  }
  // Partly real pages first: Django's fields laid over the sample.
  if (mergesBackend(path, request.method)) {
    const query = Object.fromEntries(request.nextUrl.searchParams);
    const reply = await forward(request, path);
    // A real insurer or acquirer: its companies exactly as Django sends them; only general court figures get the sample.
    if (reply.headers.get('x-civ-viewer') === 'buyer') {
      return path[0] === 'litigation' && reply.ok ? NextResponse.json(overlay(litigation, await reply.json())) : reply;
    }
    const sample = mockApi({ method: 'GET', path: `/${path.join('/')}`, query });
    // A client trying the sample insurer view: the portfolio and the other sample companies stay sample; only its own
    // company ('sunpath' in the portal) gets its real fields.
    if (path[0] === 'insureds' && path[1] !== 'sunpath' && sample.status === 200) return NextResponse.json(sample.body);
    if (sample.status === 403) return NextResponse.json(sample.body, { status: 403 });  // a page this view may not open
    if (!reply.ok || sample.status !== 200) return reply;
    // Files (a report PDF) pass straight through; only JSON is laid over the sample.
    if (!(reply.headers.get('content-type') ?? '').includes('application/json')) return reply;
    return NextResponse.json(overlay(sample.body, await reply.json()));
  }
  if (usesBackend(path)) {
    const copy = request.clone();
    const reply = await forward(request, path);
    if (reply.status === 403 && SAMPLE_WHEN_REFUSED.includes(path[0])) {
      const body = request.method === 'GET' ? undefined : await copy.json().catch(() => ({}));
      const result = mockApi({ method: request.method, path: `/${path.join('/')}`, body });
      return NextResponse.json(result.body, { status: result.status });
    }
    if (request.method !== 'GET' || path.join('/') !== 'session' || !reply.ok) return reply;
    const merged = mergeSession(await reply.json(), mockApi({ method: 'GET', path: '/session' }).body as Session);
    const headers = new Headers();
    for (const cookie of reply.headers.getSetCookie()) headers.append('set-cookie', cookie);
    return NextResponse.json(merged, { headers });
  }
  const query = Object.fromEntries(request.nextUrl.searchParams);
  const body = request.method === 'GET' ? undefined : await request.json().catch(() => ({}));
  const result = mockApi({ method: request.method, path: `/${path.join('/')}`, query, body });
  return NextResponse.json(result.body, { status: result.status });
}

export const dynamic = 'force-dynamic';
export { handle as GET, handle as POST, handle as PATCH, handle as DELETE };
