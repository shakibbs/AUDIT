'use client';

import { useState } from 'react';
import { useRulebookCalendar } from '@/api/queries';
import { Card } from '@/components/ui/Card';
import { Loader } from '@/components/ui/Loader';
import { HolidaysCard } from './HolidaysCard';
import { PlaceRulesCard } from './PlaceRulesCard';
import { RuleStatusPill } from './RuleStatusPill';

/** Calendar & hours: the dates and times CiV counts with, so every deadline and "out of hours" result can be checked. */
export function CalendarTab({ thisYear }: { thisYear: number }) {
  const [year, setYear] = useState(thisYear);
  const calendar = useRulebookCalendar(year);
  return (
    <Loader query={calendar}>
      {(c) => (
        <div className="grid gap-5 xl:grid-cols-2">
          <HolidaysCard calendar={c} year={year} onYear={setYear} />
          <div className="flex flex-col gap-5">
            <PlaceRulesCard title="Calling hours" sub="In the time zone of the person contacted" rows={c.callingHours} />
            <PlaceRulesCard title="Contact limits" sub="Most contacts allowed in a window, by state" rows={c.frequencyLimits} />
          </div>
          <Card title="Opt-out timing">
            <dl className="m-0">
              <div className="kv"><dt>Deadline to stop everywhere</dt><dd>{c.optOut.deadlineDays.shown} business days <RuleStatusPill status={c.optOut.deadlineDays.status} /></dd></div>
              <div className="kv"><dt>One confirmation text allowed within</dt><dd>{c.optOut.confirmationMinutes.shown} minutes <RuleStatusPill status={c.optOut.confirmationMinutes.status} /></dd></div>
              <div className="kv"><dt>Words that always mean stop</dt><dd className="max-w-xs text-right">{c.optOut.keywords.shown}</dd></div>
              <div className="kv"><dt>Texts follow calling hours</dt><dd>{c.smsFollowsCallingHours.shown} <RuleStatusPill status={c.smsFollowsCallingHours.status} /></dd></div>
              <div className="kv"><dt>State holiday restrictions</dt><dd>{c.restrictedHolidays.shown} <RuleStatusPill status={c.restrictedHolidays.status} /></dd></div>
            </dl>
            <p className="tiny mb-0 mt-3">Day 1 is the first business day after the opt-out. Every contact after an opt-out is shown to you at once, with its deadline.</p>
          </Card>
          <Card title="Which time zone we use" sub="For calling hours, holidays and deadlines">
            <ol className="m-0 pl-5 text-[13px] leading-7">{c.timeZone.order.map((step) => <li key={step}>{step}</li>)}</ol>
            <p className="tiny mb-0 mt-2">Each step is used only when the one before it is unknown. <RuleStatusPill status={c.timeZone.status} /></p>
          </Card>
        </div>
      )}
    </Loader>
  );
}
