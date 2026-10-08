'use client';

import { useState } from 'react';
import { useSend } from '@/api/queries';
import { FormError } from './FormError';

/** Choose a new password from a reset link (link = "<uid>.<token>"). */
export function NewPasswordForm({ link, onDone }: { link: string; onDone: () => void }) {
  const [password, setPassword] = useState('');
  const [again, setAgain] = useState('');
  const send = useSend();
  const mismatch = again.length > 0 && again !== password;
  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!mismatch) send.mutate({ method: 'POST', path: '/session/reset/confirm', body: { link, password } });
  }
  if (send.isSuccess) {
    return (
      <div className="card card-pad w-full max-w-[400px]">
        <h2 className="text-[21px]">Password changed</h2>
        <p className="mt-1.5 text-[13px] text-txt-2">You can now sign in with your new password. Other devices were signed out.</p>
        <button type="button" className="btn btn-primary mt-5 w-full justify-center" onClick={onDone}>Go to sign in</button>
      </div>
    );
  }
  return (
    <form className="card card-pad w-full max-w-[400px]" onSubmit={submit}>
      <h2 className="text-[21px]">Choose a new password</h2>
      <p className="mb-5 mt-1.5 text-[13px] text-txt-2">At least 12 characters. Avoid common words and your name.</p>
      <label className="label" htmlFor="new-password">New password</label>
      <input id="new-password" type="password" required minLength={12} autoComplete="new-password" className="field" value={password} onChange={(e) => setPassword(e.target.value)} />
      <label className="label mt-4" htmlFor="new-password-again">Type it again</label>
      <input id="new-password-again" type="password" required autoComplete="new-password" className="field" value={again} onChange={(e) => setAgain(e.target.value)} />
      {mismatch && <FormError message="The two passwords do not match." />}
      {send.isError && <FormError message={send.error.message} />}
      <button type="submit" className="btn btn-primary mt-5 w-full justify-center" disabled={send.isPending || mismatch}>Save new password</button>
    </form>
  );
}
