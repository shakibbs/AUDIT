// Serves /api/*: the login endpoints go to Django when BACKEND_URL is set; the rest come from the mock.
import { NextResponse, type NextRequest } from 'next/server';
import type { Session } from '@/api/types';
import { mockApi } from '@/mock/api';
import { forward, usesBackend } from '@/server/backend';
import { mergeSession } from '@/server/mergeSession';

type Ctx = { params: Promise<{ path: string[] }> };

async function handle(request: NextRequest, { params }: Ctx): Promise<Response> {
  const { path } = await params;
  if (usesBackend(path)) {
    const reply = await forward(request, path);
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
