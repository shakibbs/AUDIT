'use client';

import { useState } from 'react';
import { useSession } from '@/api/queries';
import { AcceptInviteForm } from './AcceptInviteForm';
import type { Mode } from './mode';
import { NewPasswordForm } from './NewPasswordForm';
import { ResetRequestForm } from './ResetRequestForm';
import { SignInBrand } from './SignInBrand';
import { SignInForm } from './SignInForm';

/** Sign in, ask for a reset link, choose a new password, or accept an invite. */
export function SignInScreen({ initial = { kind: 'sign-in' } }: { initial?: Mode }) {
  const [mode, setMode] = useState<Mode>(initial);
  const sampleData = Boolean(useSession().data?.sampleData);
  const toSignIn = () => {
    window.history.replaceState(null, '', '/sign-in');
    setMode({ kind: 'sign-in' });
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <SignInBrand />
      <div className="flex items-center justify-center p-6">
        {mode.kind === 'sign-in' && <SignInForm sampleData={sampleData} onForgot={() => setMode({ kind: 'reset' })} />}
        {mode.kind === 'reset' && <ResetRequestForm onBack={toSignIn} />}
        {mode.kind === 'new-password' && <NewPasswordForm link={mode.link} onDone={toSignIn} />}
        {mode.kind === 'invite' && <AcceptInviteForm token={mode.token} />}
      </div>
    </div>
  );
}
