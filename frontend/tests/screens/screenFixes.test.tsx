import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { mockApi } from '@fixtures/api';
import { PortalShell } from '@/components/shell/PortalShell';
import { VaultScreen } from '@/screens/vault/VaultScreen';
import { WhoContactScreen } from '@/screens/who-contact/WhoContactScreen';
import { renderScreen } from '../utils';

// Super test 2026-10-23: Members see "not allowed" controls greyed with a note; the account menu closes on Escape.
describe('screen fixes', () => {
  it('shows a Member the legal hold form greyed with a note', async () => {
    mockApi({ method: 'POST', path: '/session/view-as', body: { role: 'member', isCounsel: false } });
    renderScreen(<VaultScreen />);
    expect(await screen.findByText('Only an Admin or your lawyer can place or release a hold.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Set hold' })).toBeDisabled();
  });

  it('greys the vendor check switches for a Member', async () => {
    mockApi({ method: 'POST', path: '/session/view-as', body: { role: 'member', isCounsel: false } });
    renderScreen(<WhoContactScreen />);
    expect((await screen.findAllByText(/only an Admin or your lawyer can change these/)).length).toBeGreaterThan(0);
    const switches = screen.getAllByRole('switch');
    expect(switches.length).toBeGreaterThan(0);
    expect(switches.every((s) => (s as HTMLButtonElement).disabled)).toBe(true);
  });

  it('closes the account menu with Escape', async () => {
    const user = userEvent.setup();
    renderScreen(<PortalShell><p>page</p></PortalShell>);
    await user.click(await screen.findByRole('button', { name: 'Account menu' }));
    expect(screen.getByRole('button', { name: 'Account menu' })).toHaveAttribute('aria-expanded', 'true');
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.getByRole('button', { name: 'Account menu' })).toHaveAttribute('aria-expanded', 'false'));
  });
});
