'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useSend } from '@/api/queries';
import type { Session } from '@/api/types';
import { Icon } from '@/components/ui/Icon';
import { ROLE_LABEL } from '@/screens/users/roles';
import { ACCOUNT_LINKS, ADMIN_ONLY_PATHS } from './nav';
import { ThemeToggle } from './ThemeToggle';
import { ViewAsSwitch } from './ViewAsSwitch';

/** Account menu: who is signed in, the account pages, role, view switch (sample data), dark mode and sign-out. */
export function UserMenu({ session }: { session: Session }) {
  const [open, setOpen] = useState(false);
  const send = useSend();
  const underwriter = session.view === 'underwriter';

  return (
    <div className="relative">
      <button type="button" onClick={() => setOpen((v) => !v)} aria-haspopup="menu" aria-expanded={open} aria-label="Account menu"
        className="flex items-center gap-2.5 rounded-[10px] border border-line bg-surface py-1 pl-1 pr-2.5 text-left hover:border-brand">
        <span className="grid h-[30px] w-[30px] place-items-center rounded-lg bg-brand-soft font-display text-[11.5px] font-bold text-brand-ink">{session.initials}</span>
        <span className="hidden sm:block">
          <span className="block text-[12.5px] font-semibold leading-tight text-txt">{session.name}</span>
          <span className="block text-[10.5px] leading-tight text-txt-3">{underwriter ? `${session.orgKind === 'client' ? 'Insurer view' : 'Underwriter'} · ${session.sampleData ? 'Falcon Risk' : session.clientName}` : `${ROLE_LABEL[session.role]}${session.isCounsel ? ' · lawyer' : ''}`}</span>
        </span>
        <Icon name="chevron-down" size={14} className="text-txt-3" />
      </button>
      {open && (
        <div role="menu" className="absolute right-0 top-full z-40 mt-2 w-[270px] rounded-xl border border-line bg-surface p-2 shadow-lg">
          <div className="px-3 py-2">
            <div className="text-[13px] font-semibold">{session.name}</div>
            <div className="tiny">{session.email}</div>
          </div>
          <Link role="menuitem" href="/account" onClick={() => setOpen(false)} className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] text-txt no-underline hover:bg-surface-3 hover:no-underline"><Icon name="users" /> My account</Link>
          {!underwriter && ACCOUNT_LINKS.filter((item) => session.role === 'admin' || !ADMIN_ONLY_PATHS.includes(item.href)).map((item) => (
            <Link key={item.href} role="menuitem" href={item.href} onClick={() => setOpen(false)} className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] text-txt no-underline hover:bg-surface-3 hover:no-underline"><Icon name={item.icon} /> {item.label}</Link>
          ))}
          <div className="mt-1 border-t border-line pt-1">
            {!underwriter && (
              <div className="flex items-center justify-between px-3 py-2 text-[13px]">
                <span className="kpi-tag">Role</span><span className="font-semibold">{ROLE_LABEL[session.role]}</span>
              </div>
            )}
            {(session.canSwitchView ?? session.orgKind === 'client') && <ViewAsSwitch session={session} onChosen={() => setOpen(false)} />}
            <ThemeToggle />
          </div>
          <button type="button" role="menuitem" onClick={() => send.mutate({ method: 'POST', path: '/session/sign-out' })}
            className="mt-1 flex w-full items-center gap-2.5 rounded-lg border-0 border-t border-line bg-transparent px-3 py-2 text-left text-[13px] text-txt hover:bg-surface-3"><Icon name="logout" /> Sign out</button>
        </div>
      )}
    </div>
  );
}
