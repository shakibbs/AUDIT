'use client';

import { useState } from 'react';
import { useSend } from '@/api/queries';
import { Card } from '@/components/ui/Card';

const BLANK = { current: '', password: '', again: '' };

/** Current password, then the new one twice. Other devices are signed out; this one stays in. */
export function ChangePasswordForm() {
  const [form, setForm] = useState(BLANK);
  const [done, setDone] = useState(false);
  const send = useSend();
  // Typing again clears the last answer, so an old error never stays under a new one (QA 2026-10-23).
  const set = (k: keyof typeof BLANK) => (e: React.ChangeEvent<HTMLInputElement>) => { setDone(false); send.reset(); setForm({ ...form, [k]: e.target.value }); };
  const mismatch = form.again.length > 0 && form.again !== form.password;
  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (mismatch) return;
    send.mutate({ method: 'POST', path: '/session/password', body: { current: form.current, password: form.password } },
      { onSuccess: () => { setForm(BLANK); setDone(true); } });
  }
  return (
    <Card title="Change password">
      <form className="flex flex-col gap-1" onSubmit={submit}>
        <label className="label" htmlFor="pw-current">Current password</label>
        <input id="pw-current" type="password" required autoComplete="current-password" className="field" value={form.current} onChange={set('current')} />
        <label className="label mt-3" htmlFor="pw-new">New password</label>
        <input id="pw-new" type="password" required minLength={12} autoComplete="new-password" className="field" value={form.password} onChange={set('password')} />
        <label className="label mt-3" htmlFor="pw-again">New password again</label>
        <input id="pw-again" type="password" required autoComplete="new-password" className="field" value={form.again} onChange={set('again')} />
        <p className="tiny mb-0 mt-2">At least 12 characters. Avoid common words and your name. Your other devices will be signed out.</p>
        {mismatch && <p className="tiny m-0 mt-1 text-bad">The two new passwords are not the same.</p>}
        {send.isError && !mismatch && <p className="tiny m-0 mt-1 text-bad">{send.error.message}</p>}
        {done && <p className="tiny m-0 mt-1" role="status">Your password is changed.</p>}
        <button type="submit" className="btn btn-primary btn-sm mt-3 self-start" disabled={send.isPending || mismatch}>Change password</button>
      </form>
    </Card>
  );
}
