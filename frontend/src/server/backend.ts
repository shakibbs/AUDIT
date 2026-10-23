// Forwards every /api request to the Django backend (BACKEND_URL) and passes its answer back unchanged.
import type { NextRequest } from 'next/server';

// x-forwarded-for: the visitor's own address for the access log (Django trusts it only from the portal).
const PASS_HEADERS = ['cookie', 'content-type', 'x-csrftoken', 'origin', 'user-agent', 'x-forwarded-for'];

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
  // Downloads keep their file name and privacy headers (2026-10-23: they were saved as e.g. "period.pdf").
  for (const name of ['x-civ-viewer', 'content-disposition', 'cache-control', 'x-content-type-options', 'x-not-found']) {
    const value = reply.headers.get(name);
    if (value) out.set(name, value);
  }
  for (const cookie of reply.headers.getSetCookie()) out.append('set-cookie', cookie);
  // Bytes, not text: photos of consent pages pass through unchanged.
  return new Response(reply.status === 204 ? null : await reply.arrayBuffer(), { status: reply.status, headers: out });
}
