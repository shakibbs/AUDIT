import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { prefetchPage } from '@/api/prefetch';
import { PortalShell } from '@/components/shell/PortalShell';
import { session } from '@fixtures/data/session';

vi.mock('next/navigation', () => ({ usePathname: () => '/vault', useRouter: () => ({ push: vi.fn() }) }));

describe('faster loading (owner 2026-11-07)', () => {
  it('uses the session the portal server sent: no "who is signed in?" request from the browser', async () => {
    const fetching = vi.spyOn(globalThis, 'fetch');
    const client = new QueryClient({ defaultOptions: { queries: { retry: false, staleTime: 30_000 } } });
    render(<QueryClientProvider client={client}><PortalShell initialSession={{ ...session, signedIn: true }}><p>page</p></PortalShell></QueryClientProvider>);
    expect(await screen.findByText('page')).toBeInTheDocument();
    expect(fetching.mock.calls.some(([url]) => String(url).endsWith('/api/session'))).toBe(false);
    fetching.mockRestore();
  });

  it('starts a page\'s data when its menu link is pointed at', async () => {
    const fetching = vi.spyOn(globalThis, 'fetch');
    prefetchPage(new QueryClient(), '/vault', undefined, '2026-10');
    await waitFor(() => expect(fetching.mock.calls.some(([url]) => String(url).includes('/api/vault?period=2026-10'))).toBe(true));
    fetching.mockRestore();
  });
});
