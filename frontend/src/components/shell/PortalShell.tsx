'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useSession } from '@/api/queries';
import type { Session } from '@/api/types';
import { viewBlock } from '@/lib/views';
import { DrawerProvider } from '@/state/DrawerContext';
import { PortalProvider } from '@/state/PortalContext';
import { Banners } from './Banners';
import { Disclaimer } from './Disclaimer';
import { DrawerHost } from './DrawerHost';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { ViewBlocked } from './ViewBlocked';

/** Frame around every signed-in page. Sends signed-out visitors to the sign-in page. */
export function PortalShell({ children, initialSession }: { children: React.ReactNode; initialSession?: Session }) {
  // The answer the portal server already had: no wait for "who is signed in?" before the page asks for its data.
  const client = useQueryClient();
  useState(() => {
    if (initialSession && !client.getQueryData(['/session'])) client.setQueryData(['/session'], initialSession);
    return null;
  });
  // Drawn in the browser only (it reads the remembered month), right after the first paint: no waiting on the network.
  const [mounted, setMounted] = useState(false);
  // eslint-disable-next-line react-hooks/set-state-in-effect -- the browser-only parts start after the first paint
  useEffect(() => setMounted(true), []);
  const session = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const signedOut = session.data ? !session.data.signedIn : false;

  useEffect(() => {
    if (signedOut) router.push('/sign-in');
  }, [signedOut, router]);

  if (!mounted || session.isPending) return <div className="p-10 tiny" role="status">Loading…</div>;
  if (session.isError) return <div className="p-10 text-[13px]" role="alert">The portal could not be loaded. {session.error.message}</div>;
  if (signedOut) return null;

  const s = session.data;
  const block = viewBlock(s.view, pathname);
  return (
    <PortalProvider>
      <DrawerProvider>
        <Sidebar session={s} open={menuOpen} onNavigate={() => setMenuOpen(false)} />
        {menuOpen && <button type="button" aria-label="Close menu" className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={() => setMenuOpen(false)} />}
        <div className="min-h-screen lg:pl-[248px]">
          <Topbar session={s} onMenu={() => setMenuOpen(true)} />
          <main className="mx-auto max-w-[1320px] px-5 pb-10 pt-7 lg:px-8">
            <Banners session={s} />
            {block !== 'none' ? <ViewBlocked block={block} /> : children}
            <Disclaimer />
          </main>
        </div>
        <DrawerHost />
      </DrawerProvider>
    </PortalProvider>
  );
}
