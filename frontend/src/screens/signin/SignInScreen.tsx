'use client';

import { useState } from 'react';
import { useSession } from '@/api/queries';
import { AcceptInviteForm } from './AcceptInviteForm';
import type { Mode } from './mode';
import { NewPasswordForm } from './NewPasswordForm';
import { SignInBrand } from './SignInBrand';
import { SignInForm } from './SignInForm';

/** Sign in, choose a new password (from a link CiV staff sent), or accept an invite. */
export function SignInScreen({ initial = { kind: 'sign-in' } }: { initial?: Mode }) {
  const [mode, setMode] = useState<Mode>(initial);
  useSession();  // asking who is signed in also gives the browser its CSRF cookie, which every form below needs
  const toSignIn = () => {
    window.history.replaceState(null, '', '/sign-in');
    setMode({ kind: 'sign-in' });
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <SignInBrand />
      <div className="flex items-center justify-center p-6">
        {mode.kind === 'sign-in' && <SignInForm />}
        {mode.kind === 'new-password' && <NewPasswordForm link={mode.link} onDone={toSignIn} />}
        {mode.kind === 'invite' && <AcceptInviteForm token={mode.token} />}
      </div>
    </div>
  );
}
