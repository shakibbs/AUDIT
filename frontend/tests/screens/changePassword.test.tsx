import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { AccountScreen } from '@/screens/account/AccountScreen';
import { SignInForm } from '@/screens/signin/SignInForm';
import { renderScreen } from '../utils';

describe('my account and change password (2026-10-22)', () => {
  it('changes the password with the current one, and checks the two new ones match', async () => {
    const user = userEvent.setup();
    renderScreen(<AccountScreen />);
    await user.type(screen.getByLabelText('Current password'), 'old-password-123');
    await user.type(screen.getByLabelText('New password'), 'Brand-new-password-42');
    await user.type(screen.getByLabelText('New password again'), 'Brand-new-password-4');
    expect(screen.getByText('The two new passwords are not the same.')).toBeInTheDocument();
    await user.type(screen.getByLabelText('New password again'), '2');
    await user.click(screen.getByRole('button', { name: 'Change password' }));
    expect(await screen.findByText('Your password is changed.')).toBeInTheDocument();
  });

  it('has no "Forgot your password?" on the sign-in form', () => {
    renderScreen(<SignInForm />);
    expect(screen.queryByText(/Forgot your password/)).not.toBeInTheDocument();
  });
});

describe('Settings and Users & Access are Admin only (2026-10-23)', () => {
  it('shows a Member a short note instead of the page', async () => {
    const { mockApi } = await import('@fixtures/api');
    const { AdminOnly } = await import('@/components/ui/AdminOnly');
    mockApi({ method: 'POST', path: '/session/view-as', body: { role: 'member' } });
    renderScreen(<AdminOnly><p>secret settings</p></AdminOnly>);
    expect(await screen.findByText('Only an Admin can open this page')).toBeInTheDocument();
    expect(screen.queryByText('secret settings')).not.toBeInTheDocument();
  });
});
