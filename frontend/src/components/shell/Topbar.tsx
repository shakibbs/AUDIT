'use client';

import { INTERNAL_ROLES, type Session } from '@/api/types';
import { Icon } from '@/components/ui/Icon';
import { Freshness } from './Freshness';
import { PeriodSelect } from './PeriodSelect';
import { RunSelect } from './RunSelect';
import { SearchBox } from './SearchBox';
import { ThemeToggle } from './ThemeToggle';
import { UserMenu } from './UserMenu';
import { ViewAsSwitch } from './ViewAsSwitch';

/** Sticky bar above every page: search, freshness, period, theme and account. */
export function Topbar({ session, onMenu }: { session: Session; onMenu: () => void }) {
  // The client's freshness and month picker mean nothing across an insurer's book.
  const underwriter = session.role === 'underwriter';
  return (
    <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-line bg-bg/90 px-5 py-3 backdrop-blur lg:px-8">
      <button type="button" className="icon-btn lg:hidden" onClick={onMenu} aria-label="Open menu"><Icon name="menu" /></button>
      <SearchBox placeholder={underwriter ? 'Search insureds and pages…' : undefined} />
      <div className="ml-auto flex items-center gap-2.5">
        {session.sampleData && <ViewAsSwitch session={session} />}
        {session.sampleData && <span className="samplechip hidden md:inline-block">Sample data</span>}
        {underwriter
          ? <span className="hidden whitespace-nowrap text-[12px] text-txt-2 xl:inline">Attestations refresh monthly · 5 insureds</span>
          : <Freshness updatedAt={session.updatedAt} />}
        {INTERNAL_ROLES.includes(session.role) && <RunSelect runs={session.runs} />}
        {!underwriter && <PeriodSelect periods={session.periods} />}
        <ThemeToggle />
        <UserMenu session={session} />
      </div>
    </header>
  );
}
