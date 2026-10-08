'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useSend } from '@/api/queries';
import { FormError } from './FormError';

/** Email and password. */
export function SignInForm({ onForgot, sampleData }: { onForgot: () => void; sampleData: boolean }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const send = useSend();
  const router = useRouter();
  function submit(e: React.FormEvent) {
    e.preventDefault();
    send.mutate({ method: 'POST', path: '/session/sign-in', body: { email, password } }, { onSuccess: () => router.push('/') });
  }
  return (
    <form className="card card-pad w-full max-w-[400px]" onSubmit={submit}>
      <h2 className="text-[21px]">Sign in</h2>
      <p className="mb-5 mt-1.5 text-[13px] text-txt-2">Use the email your invitation was sent to.</p>
      <label className="label" htmlFor="email">Email</label>
      <input id="email" type="email" required autoComplete="username" className="field" value={email} onChange={(e) => setEmail(e.target.value)} />
      <label className="label mt-4" htmlFor="password">Password</label>
      <input id="password" type="password" required autoComplete="current-password" className="field" value={password} onChange={(e) => setPassword(e.target.value)} />
      {send.isError && <FormError message={send.error.message} />}
      <button type="submit" className="btn btn-primary mt-5 w-full justify-center" disabled={send.isPending}>Sign in</button>
      <button type="button" className="mt-4 w-full border-0 bg-transparent text-center text-[12.5px] font-semibold text-brand" onClick={onForgot}>Forgot your password?</button>
      {sampleData && <p className="tiny mb-0 mt-5 text-center">Sample data: any email and password will sign you in.</p>}
    </form>
  );
}
