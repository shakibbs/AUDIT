import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { ChangePasswordForm } from '@/screens/account/ChangePasswordForm';
import { SignInForm } from '@/screens/signin/SignInForm';
import { renderScreen } from '../utils';

// Owner 2026-11-16: an eye button beside every password box shows or hides it; it starts hidden.
describe('password eye button', () => {
  it('shows and hides the sign-in password', async () => {
    const user = userEvent.setup();
    renderScreen(<SignInForm />);
    const box = screen.getByLabelText('Password');
    await user.type(box, 'secret-words');
    expect(box).toHaveAttribute('type', 'password');
    await user.click(screen.getByRole('button', { name: 'Show password' }));
    expect(box).toHaveAttribute('type', 'text');
    expect(box).toHaveValue('secret-words');
    await user.click(screen.getByRole('button', { name: 'Hide password' }));
    expect(box).toHaveAttribute('type', 'password');
  });

  it('gives each change-password box its own eye', async () => {
    renderScreen(<ChangePasswordForm />);
    expect(await screen.findAllByRole('button', { name: 'Show password' })).toHaveLength(3);
  });
});
