'use client';

import { useSession } from '@/api/queries';
import { Card } from '@/components/ui/Card';
import { PageHead } from '@/components/ui/PageHead';
import { ChangePasswordForm } from './ChangePasswordForm';

/** My account: who is signed in, and changing their own password. Open to everyone, insurers included. */
export function AccountScreen() {
  const session = useSession().data;
  return (
    <>
      <PageHead eyebrow="Account" title="My account" sub="Your sign-in details. Only you can change your password." />
      <div className="grid gap-5 lg:grid-cols-2">
        <Card title="Signed in as">
          <dl className="m-0">
            <div className="kv"><dt>Name</dt><dd>{session?.name ?? '—'}</dd></div>
            <div className="kv"><dt>Email</dt><dd>{session?.email ?? '—'}</dd></div>
            <div className="kv"><dt>Company</dt><dd>{session?.clientName ?? '—'}</dd></div>
          </dl>
        </Card>
        <ChangePasswordForm />
      </div>
    </>
  );
}
