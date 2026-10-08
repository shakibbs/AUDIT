'use client';

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
  const change = (u: User, body: Partial<Pick<User, 'role' | 'isCounsel'>>) => send.mutate({ method: 'PATCH', path: `/users/${u.id}`, body });
  return (
    <Card title="People with access" sub={`${users.length} people`} flush>
      <div className="overflow-x-auto">
        <table className="tbl">
          <thead><tr><th>Person</th><th>Role</th><th>Lawyer</th><th>Status</th><th>Last seen (UTC)</th><th /></tr></thead>
          <tbody>
            {users.map((u) => {
              const editable = admin && u.status === 'active';
              return (
                <tr key={u.id}>
                  <td><span className="font-semibold">{u.name}</span><div className="tiny mono">{u.email}</div></td>
                  <td>
                    {editable ? (
                      <select aria-label={`Role for ${u.name}`} className="field !w-[140px] !py-1.5" value={u.role} onChange={(e) => change(u, { role: e.target.value as Role })}>
                        {CLIENT_ROLES.map((r) => <option key={r} value={r}>{ROLE_LABEL[r]}</option>)}
                      </select>
                    ) : <span className="pill pill-gray">{ROLE_LABEL[u.role]}</span>}
                  </td>
                  <td>
                    <input type="checkbox" aria-label={`${u.name} is the company’s lawyer`} checked={u.isCounsel} disabled={!editable} onChange={(e) => change(u, { isCounsel: e.target.checked })} />
                  </td>
                  <td>{u.status === 'active' ? <span className="pill pill-green">Active</span> : <span className="pill pill-gray">Invited</span>}</td>
                  <td className="mono whitespace-nowrap text-[11.5px]">{formatDateTime(u.lastSeen)}</td>
                  <td className="text-right">
                    {admin && u.id !== session?.userId && (
                      <button type="button" className="btn btn-ghost btn-sm" onClick={() => send.mutate({ method: 'DELETE', path: `/users/${u.id}` })} aria-label={`Remove access for ${u.name}`}>
                        {u.status === 'invited' ? 'Cancel invite' : 'Remove access'}
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
    </Card>
  );
}
