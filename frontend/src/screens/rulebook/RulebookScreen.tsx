'use client';

import { useState } from 'react';
import { useRulebook } from '@/api/queries';
import { Loader } from '@/components/ui/Loader';
import { PageHead } from '@/components/ui/PageHead';
import { Seg } from '@/components/ui/Seg';
import { CalendarTab } from './CalendarTab';
import { SettingsTab } from './SettingsTab';
import { useMonth } from '@/state/PortalContext';
import { formatDate } from '@/lib/format';

const TABS = [{ id: 'settings', label: 'Settings' }, { id: 'calendar', label: 'Calendar & hours' }] as const;

export function RulebookScreen() {
  const rulebook = useRulebook(useMonth());
  const [tab, setTab] = useState<(typeof TABS)[number]['id']>('settings');
  return (
    <>
      <PageHead eyebrow="Engagement" title="Rulebook" sub="The rules every call and text is checked against, who owns each, and whether it is decided. CiV changes them; your lawyer can review drafts on Regulatory Changes.">
        <Seg label="View" options={TABS} value={tab} onChange={setTab} />
      </PageHead>
      <Loader query={rulebook}>
        {(r) => (
          <div className="flex flex-col gap-5">
            {r.note && <p className="note-box m-0">{r.note}</p>}
            {r.asOf && tab === 'settings' && <p className="tiny m-0">Rules in force on {formatDate(r.asOf)}.</p>}
            {tab === 'settings' ? <SettingsTab rulebook={r} /> : <CalendarTab thisYear={new Date().getFullYear()} />}
          </div>
        )}
      </Loader>
    </>
  );
}
