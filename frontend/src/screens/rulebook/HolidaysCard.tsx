import type { RulebookCalendar } from '@/api/types';
import { Card } from '@/components/ui/Card';
import { formatDate } from '@/lib/format';
import { RuleStatusPill } from './RuleStatusPill';

const WEEKDAY = (iso: string) => new Date(`${iso}T12:00:00Z`).toLocaleDateString('en-US', { weekday: 'short', timeZone: 'UTC' });

/** Days that never count as business days, with the year picker. */
export function HolidaysCard({ calendar: c, year, onYear }: { calendar: RulebookCalendar; year: number; onYear: (y: number) => void }) {
  return (
    <Card title="Business-day calendar" sub={c.businessDays.shown}
      right={<div className="flex items-center gap-2"><RuleStatusPill status={c.businessDays.status} />
        <select className="field !w-auto !py-1.5" aria-label="Year" value={year} onChange={(e) => onYear(Number(e.target.value))}>
          {[year - 4, year - 3, year - 2, year - 1, year, year + 1].map((y) => <option key={y} value={y}>{y}</option>)}
        </select></div>} flush>
      {c.nextHoliday && <p className="m-0 px-[22px] pb-3 text-[13px]">Next holiday: <b>{c.nextHoliday.name}</b>, {WEEKDAY(c.nextHoliday.date)} {formatDate(c.nextHoliday.date)}</p>}
      <table className="tbl">
        <thead><tr><th>Not a business day</th><th>Holiday</th></tr></thead>
        <tbody>
          {c.holidays.map((h) => (
            <tr key={h.date}>
              <td className="mono">{WEEKDAY(h.date)} {formatDate(h.date)}</td>
              <td>{h.name}{h.actual !== h.date && <span className="tiny"> · falls on {WEEKDAY(h.actual)} {formatDate(h.actual)}, so the {h.actual > h.date ? 'Friday before' : 'Monday after'} is skipped</span>}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}
