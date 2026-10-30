'use client';

import type { Session } from '@/api/types';
import { Icon } from '@/components/ui/Icon';
import { Freshness } from './Freshness';
import { InsuredCount } from './InsuredCount';
import { PeriodSelect } from './PeriodSelect';
import { SearchBox } from './SearchBox';
import { UserMenu } from './UserMenu';

/** Sticky bar above every page: search, freshness, period and the account menu. */
export function Topbar({ session, onMenu }: { session: Session; onMenu: () => void }) {
  // The client's freshness means nothing across an insurer's book.
  const underwriter = session.view === 'underwriter';
  return (
    <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-line bg-bg/90 px-5 py-3 backdrop-blur lg:px-8">
      <button type="button" className="icon-btn lg:hidden" onClick={onMenu} aria-label="Open menu"><Icon name="menu" /></button>
      <SearchBox placeholder={underwriter ? 'Search insureds and pages…' : undefined} />
      <div className="ml-auto flex items-center gap-3">
        {/* The data on screen: how fresh it is, and which month. */}
        <div className="flex items-center gap-2.5">
          {underwriter
            ? <InsuredCount />
            : <Freshness updatedAt={session.updatedAt} />}
          {/* An insurer has its own month list (owner, 2026-10-30): months from when each company started sharing. */}
          {(!underwriter || session.periods.length > 0) && <PeriodSelect periods={session.periods} />}
        </div>
        {/* You: account menu, which also holds the view switch and dark mode. */}
        <UserMenu session={session} />
      </div>
    </header>
  );
}
