import { screen } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { PortalShell } from '@/components/shell/PortalShell';
import { session } from '@fixtures/data/session';
import { server } from '../msw';
import { renderScreen } from '../utils';

// Owner 2026-11-16: a client using View as → Underwriter is told it is still in the client portal; only a real insurer sees "Insurer portal".
const as = (orgKind: 'client' | 'insurer') => server.use(http.get('*/api/session', () => HttpResponse.json({ ...session, view: 'underwriter', orgKind, clientName: 'Demo Solar Co' })));

describe('sidebar label in the underwriter view', () => {
  it('says "Underwriter view · Client portal" when a client previews', async () => {
    as('client');
    renderScreen(<PortalShell><p>page</p></PortalShell>);
    expect(await screen.findByText('Underwriter view · Client portal')).toBeInTheDocument();
    expect(screen.getByText('Demo Solar Co · underwriter view')).toBeInTheDocument();
    expect(screen.queryByText('Insurer portal')).not.toBeInTheDocument();
  });

  it('says "Insurer portal" for a real insurer', async () => {
    as('insurer');
    renderScreen(<PortalShell><p>page</p></PortalShell>);
    expect(await screen.findByText('Insurer portal')).toBeInTheDocument();
    expect(screen.queryByText('Underwriter view · Client portal')).not.toBeInTheDocument();
  });
});
