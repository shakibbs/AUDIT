import { cookies, headers } from 'next/headers';
import type { Session } from '@/api/types';
import { PortalShell } from '@/components/shell/PortalShell';

/** Who is signed in, asked by the portal server next to Django (milliseconds) instead of by the browser after the page
 * arrives (a full trip to the server and back): the page asks for its own data at once (owner, 2026-11-07). Left out
 * when it cannot be asked here; the browser then asks as before. */
async function firstSession(): Promise<Session | undefined> {
  if (!process.env.BACKEND_URL) return undefined;
  const jar = await cookies();
  if (!jar.get('csrftoken') || !jar.get('sessionid')) return undefined;  // signed out, or no form cookie yet: the browser asks
  const asked = await headers();
  try {
    const reply = await fetch(`${process.env.BACKEND_URL}/api/session`, {
      headers: { cookie: jar.toString(), 'user-agent': asked.get('user-agent') ?? '', 'x-forwarded-for': asked.get('x-forwarded-for') ?? '' },
      cache: 'no-store',
    });
    return reply.ok ? ((await reply.json()) as Session) : undefined;
  } catch {
    return undefined;
  }
}

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  return <PortalShell initialSession={await firstSession()}>{children}</PortalShell>;
}
