'use client';

import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { apiGet } from '@/api/client';
import { useSend } from '@/api/queries';
import { FormError } from './FormError';

interface InviteInfo { email: string; name: string; clientName: string }

/** First visit from an invite email: shows who it is for, then sets a password and signs in. */
export function AcceptInviteForm({ token }: { token: string }) {
  const info = useQuery({ queryKey: ['/invites/check', token], queryFn: () => apiGet<InviteInfo>('/invites/check', { token }), retry: false });
  const [password, setPassword] = useState('');
  const send = useSend();
  const router = useRouter();
  function submit(e: React.FormEvent) {
    e.preventDefault();
    send.mutate({ method: 'POST', path: '/invites/accept', body: { token, password } }, { onSuccess: () => router.push('/') });
  }
  if (info.isError) return <div className="card card-pad w-full max-w-[400px]"><FormError message={info.error.message} /></div>;
  return (
    <form className="card card-pad w-full max-w-[400px]" onSubmit={submit}>
      <h2 className="text-[21px]">Welcome to CiV</h2>
      <p className="mb-5 mt-1.5 text-[13px] text-txt-2">
        {info.data ? <>Choose a password for <strong>{info.data.email}</strong> at {info.data.clientName}.</> : 'Checking your invite…'}
      </p>
      <label className="label" htmlFor="invite-password">Password</label>
      <input id="invite-password" type="password" required minLength={12} autoComplete="new-password" className="field" value={password} onChange={(e) => setPassword(e.target.value)} />
      <p className="tiny mb-0 mt-2">At least 12 characters. Avoid common words and your name.</p>
      {send.isError && <FormError message={send.error.message} />}
      <button type="submit" className="btn btn-primary mt-5 w-full justify-center" disabled={send.isPending || !info.data}>Set password and sign in</button>
    </form>
  );
}
