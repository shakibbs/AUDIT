// Thin fetch wrapper. Every screen talks to the backend through these two functions.
export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

// Relative in the browser; absolute under the test runner, where there is no page origin to resolve against.
const BASE = typeof window !== 'undefined' && window.location.origin.startsWith('http') ? '' : 'http://localhost';

// DRF puts one message in "detail", or a list per form field (e.g. { password: ["Too short."] }).
function errorText(body: unknown): string {
  const b = body as Record<string, unknown>;
  if (typeof b.detail === 'string') return b.detail;
  const first = Object.values(b).find((v) => Array.isArray(v) && typeof v[0] === 'string') as string[] | undefined;
  return first?.[0] ?? 'The request could not be completed.';
}

async function parse<T>(response: Response): Promise<T> {
  const body = response.status === 204 ? {} : await response.json().catch(() => ({}));
  if (!response.ok) throw new ApiError(response.status, errorText(body));
  return body as T;
}

export function apiGet<T>(path: string, query: Record<string, string | undefined> = {}): Promise<T> {
  const params = new URLSearchParams(Object.entries(query).filter((e): e is [string, string] => Boolean(e[1])));
  const qs = params.toString();
  return fetch(`${BASE}/api${path}${qs ? `?${qs}` : ''}`).then((r) => parse<T>(r));
}

// Django refuses a change without the CSRF token it set in the csrftoken cookie.
function csrfToken(): string {
  if (typeof document === 'undefined') return '';
  return document.cookie.split('; ').find((c) => c.startsWith('csrftoken='))?.slice('csrftoken='.length) ?? '';
}

export function apiSend<T>(method: 'POST' | 'PATCH' | 'DELETE', path: string, body: unknown = {}): Promise<T> {
  const headers = { 'Content-Type': 'application/json', 'X-CSRFToken': csrfToken() };
  return fetch(`${BASE}/api${path}`, { method, headers, body: JSON.stringify(body) }).then((r) => parse<T>(r));
}
