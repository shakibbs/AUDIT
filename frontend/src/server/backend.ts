// Forwards the login endpoints to the Django backend when BACKEND_URL is set; everything else stays on the mock.
import type { NextRequest } from 'next/server';

/** First path segments Django answers today. */
// Not 'health': the portal's /health is the Data health card, still sample data. Django's own check is on port 8000.
const BACKEND_PATHS = ['session', 'users', 'invites'];

// The view switch is a sample-data feature; it stays on the mock.
export function usesBackend(path: string[]): boolean {
  return Boolean(process.env.BACKEND_URL) && BACKEND_PATHS.includes(path[0]) && path[1] !== 'view-as';
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
  const body = request.method === 'GET' ? undefined : await request.text();
  const reply = await fetch(url, { method: request.method, headers, body, redirect: 'manual', cache: 'no-store' });

  const out = new Headers({ 'content-type': reply.headers.get('content-type') ?? 'application/json' });
  for (const cookie of reply.headers.getSetCookie()) out.append('set-cookie', cookie);
  return new Response(reply.status === 204 ? null : await reply.text(), { status: reply.status, headers: out });
}
