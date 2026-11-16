import type { WhoContact } from '@/api/types';
import { Card } from '@/components/ui/Card';
import { CHECK_COLUMNS } from '@/lib/whoContact';
import { FoundCell } from './FoundCell';
import { LeadSourceSwitch } from './LeadSourceSwitch';
import type { OpenNumbers } from './NumbersDrawer';
import { SourceChip } from './SourceChip';

const GROUPS = [['vendor', 'Lead vendors'], ['upload', 'Uploaded lists']] as const;

/** Rows = check services, lead vendors and uploaded lists; columns = the four lists a contact can be checked against. */
export function WhoCheckedWhat({ data, readOnly, canChange = true, onOpen }: { data: WhoContact; readOnly: boolean; canChange?: boolean; onOpen?: (o: OpenNumbers) => void }) {
  const legend = (['provider', 'list', 'stated', 'none'] as const).map((s) => <SourceChip key={s} source={s} />);
  const groupRow = (label: string, hint?: string) => (
    <tr key={label}><td colSpan={5} className="tiny !pb-1 !pt-4 font-semibold">{label}{hint && <span className="font-normal"> · {hint}</span>}</td></tr>
  );
  return (
    <Card title="Who checked what" right={<div className="flex flex-wrap gap-1.5">{legend}</div>} flush>
      <div className="overflow-x-auto">
        <table className="tbl">
          <thead><tr><th>Source</th>{CHECK_COLUMNS.map(([key, label]) => <th key={key}>{label}</th>)}</tr></thead>
          <tbody>
            {groupRow('Check services')}
            {data.services.map((s) => (
              <tr key={s.name}>
                <td><div className="font-semibold">{s.name}</div><div className="tiny">{s.note}</div></td>
                {CHECK_COLUMNS.map(([key]) => <td key={key}>{s.covers[key] ? <SourceChip source={s.covers[key]} /> : <span className="tiny">—</span>}</td>)}
              </tr>
            ))}
            {GROUPS.map(([group, label]) => [
              groupRow(label, readOnly ? undefined : canChange ? 'switch on what was checked before the leads reached you' : 'only an Admin or your lawyer can change these'),
              ...data.leadSources.filter((l) => l.group === group).map((l) => (
                <tr key={l.id}>
                  <td><div className="font-semibold">{l.name}</div>{l.note && <div className="tiny">{l.note}</div>}</td>
                  {CHECK_COLUMNS.map(([key, colLabel]) => (
                    <td key={key} className={l.found ? '!align-top' : undefined}>
                      {/* What CiV found (owner 2026-11-16), then the client's own switch as before. */}
                      {l.found && <div className="mb-2"><FoundCell found={l.found[key]} listed={l.checked[key]} onOpen={onOpen && ((label) => onOpen({ source: l.id, name: l.name, column: key, label }))} /></div>}
                      <LeadSourceSwitch source={l} column={key} label={colLabel} readOnly={readOnly} disabled={!canChange} found={l.found?.[key]} />
                    </td>
                  ))}
                </tr>
              )),
            ])}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
