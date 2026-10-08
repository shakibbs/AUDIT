'use client';

import { useState } from 'react';
import { useSend } from '@/api/queries';
import { FormError } from './FormError';

/** Asks for a password-reset email. Always answers the same way, whether or not the email has an account. */
export function ResetRequestForm({ onBack }: { onBack: () => void }) {
  const [email, setEmail] = useState('');
  const send = useSend();
  function submit(e: React.FormEvent) {
    e.preventDefault();
    send.mutate({ method: 'POST', path: '/session/reset', body: { email } });
  }
  return (
    <form className="card card-pad w-full max-w-[400px]" onSubmit={submit}>
      <h2 className="text-[21px]">Reset your password</h2>
      <p className="mb-5 mt-1.5 text-[13px] text-txt-2">We will email you a link to choose a new password.</p>
      <label className="label" htmlFor="email">Email</label>
      <input id="email" type="email" required autoComplete="username" className="field" value={email} onChange={(e) => setEmail(e.target.value)} />
      {send.isError && <FormError message={send.error.message} />}
      {send.isSuccess && <p className="mb-0 mt-3 text-[12.5px]" role="status">If that email has an account, a reset link is on its way. It works for 1 hour.</p>}
      <button type="submit" className="btn btn-primary mt-5 w-full justify-center" disabled={send.isPending}>Send reset link</button>
      <button type="button" className="mt-4 w-full border-0 bg-transparent text-center text-[12.5px] font-semibold text-brand" onClick={onBack}>Back to sign in</button>
    </form>
  );
}
