'use client';

import { useState } from 'react';
import { useSend, useSession } from '@/api/queries';
import type { Role, User } from '@/api/types';
import { Card } from '@/components/ui/Card';
import { formatDateTime } from '@/lib/format';
import { CLIENT_ROLES, ROLE_LABEL } from './roles';

/** Everyone with access, their role and lawyer mark. Only an Admin can change them. */
export function UserTable({ users }: { users: User[] }) {
  const send = useSend();
  const session = useSession().data;
  const admin = session?.role === 'admin';
  const [done, setDone] = useState('');  // "Done" after each action (QA 2026-10-23)
  const act = (args: Parameters<typeof send.mutate>[0], message: string) => { setDone(''); send.mutate(args, { onSuccess: () => setDone(message) }); };
  const change = (u: User, body: Partial<Pick<User, 'role' | 'isCounsel'>>) => act({ method: 'PATCH', path: `/users/${u.id}`, body }, `Saved for ${u.name || u.email}.`);
  // The signed-in Admin's own row: the role and "Remove access" are not offered (a company keeps its Admin).
  const me = (u: User) => u.id === `u-${session?.userId}`;
  return (
    <Card title="People with access" sub={`${users.length} people`} flush>
      <div className="overflow-x-auto">
        <table className="tbl">
          <thead><tr><th>Person</th><th>Role</th><th>Lawyer</th><th>Status</th><th>Last seen (UTC)</th><th /></tr></thead>
          <tbody>
            {users.map((u) => {
              const editable = admin && u.status === 'active';
              const own = me(u);
              return (
                <tr key={u.id}>
                  <td><span className="font-semibold">{u.name}</span><div className="tiny mono">{u.email}</div></td>
                  <td>
                    {editable && !own ? (
                      <select aria-label={`Role for ${u.name}`} className="field !w-[140px] !py-1.5" value={u.role} onChange={(e) => change(u, { role: e.target.value as Role })}>
                        {CLIENT_ROLES.map((r) => <option key={r} value={r}>{ROLE_LABEL[r]}</option>)}
                      </select>
                    ) : <span className="pill pill-gray">{ROLE_LABEL[u.role]}{own ? ' · you' : ''}</span>}
                  </td>
                  <td>
                    <input type="checkbox" aria-label={`${u.name} is the company’s lawyer`} checked={u.isCounsel} disabled={!editable} onChange={(e) => change(u, { isCounsel: e.target.checked })} />
                  </td>
                  <td>
                    {u.status === 'active' ? <span className="pill pill-green">Active</span> : u.status === 'expired' ? <span className="pill pill-amber">Invite expired</span> : <span className="pill pill-gray">Invited</span>}
                    {u.sentAt && u.status !== 'active' && <div className="tiny mt-1">sent {formatDateTime(u.sentAt)}</div>}
                  </td>
                  <td className="mono whitespace-nowrap text-[11.5px]">{formatDateTime(u.lastSeen)}</td>
                  <td className="text-right">
                    {admin && u.status !== 'active' && (
                      <button type="button" className="btn btn-ghost btn-sm" onClick={() => act({ method: 'POST', path: `/users/${u.id}/resend` }, `A new invite was sent to ${u.email}.`)} aria-label={`Resend the invite to ${u.name || u.email}`}>
                        {u.status === 'expired' ? 'Resend invite' : 'Resend'}
                      </button>
                    )}
                    {admin && !own && (
                      <button type="button" className="btn btn-ghost btn-sm" onClick={() => act({ method: 'DELETE', path: `/users/${u.id}` }, u.status === 'active' ? `${u.name || u.email} can no longer sign in.` : `The invite to ${u.email} was cancelled.`)} aria-label={`Remove access for ${u.name}`}>
                        {u.status === 'active' ? 'Remove access' : 'Cancel invite'}
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {send.isError && <p className="m-0 px-[22px] py-3 text-[12.5px]" role="alert">{send.error.message}</p>}
      {done && !send.isError && <p className="m-0 px-[22px] py-3 text-[12.5px]" role="status">{done}</p>}
    </Card>
  );
}
