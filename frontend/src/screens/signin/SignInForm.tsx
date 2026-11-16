'use client';

import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { prefetchPage } from '@/api/prefetch';
import { useSend } from '@/api/queries';
import type { Session } from '@/api/types';
import { FormError } from './FormError';
import { PasswordInput } from '@/components/ui/PasswordInput';

/** Email and password. No "Forgot your password?" (owner, 2026-10-22): a new password comes from a link CiV sends. */
export function SignInForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const send = useSend<Session>();
  const router = useRouter();
  const client = useQueryClient();
  function submit(e: React.FormEvent) {
    e.preventDefault();
    send.mutate({ method: 'POST', path: '/session/sign-in', body: { email, password } }, {
      // An insurer, or a client user in the Underwriter view, opens on the Portfolio (client pages are blocked for them).
      // The sign-in answer is the session: kept, so the first page does not ask for it again (owner, 2026-11-07).
      onSuccess: (session) => {
        if (session) client.setQueryData(['/session'], session);
        const home = session?.view === 'underwriter' ? '/portfolio' : '/';
        // The first page's data starts now, alongside the page itself: one trip to the server instead of two in a row
        // (owner, 2026-11-16).
        let remembered: string | undefined;
        try { remembered = localStorage.getItem('civ-period') ?? undefined; } catch { /* storage unavailable */ }
        const months = session?.periods?.map((p) => p.id) ?? [];
        const period = remembered && months.includes(remembered) ? remembered : undefined;  // as the Overview will ask
        prefetchPage(client, home, period, period ?? months[0]);
        router.push(home);
      },
    });
  }
  return (
    <form className="card card-pad w-full max-w-[400px]" onSubmit={submit}>
      <h2 className="text-[21px]">Sign in</h2>
      <p className="mb-5 mt-1.5 text-[13px] text-txt-2">Use the email your invitation was sent to.</p>
      <label className="label" htmlFor="email">Email</label>
      <input id="email" type="email" required autoComplete="username" className="field" value={email} onChange={(e) => setEmail(e.target.value.toLowerCase())} />
      <label className="label mt-4" htmlFor="password">Password</label>
      <PasswordInput id="password" required autoComplete="current-password" className="field" value={password} onChange={(e) => setPassword(e.target.value)} />
      {send.isError && <FormError message={send.error.message} />}
      <button type="submit" className="btn btn-primary mt-5 w-full justify-center" disabled={send.isPending}>Sign in</button>
    </form>
  );
}
