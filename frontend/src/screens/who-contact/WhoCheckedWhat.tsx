import type { WhoContact } from '@/api/types';
import { Card } from '@/components/ui/Card';
import { CHECK_COLUMNS } from '@/lib/whoContact';
import { LeadSourceSwitch } from './LeadSourceSwitch';
import { SourceChip } from './SourceChip';

const GROUPS = [['vendor', 'Lead vendors'], ['upload', 'Uploaded lists']] as const;

/** Rows = check services, lead vendors and uploaded lists; columns = the four lists a contact can be checked against. */
export function WhoCheckedWhat({ data, readOnly, canChange = true }: { data: WhoContact; readOnly: boolean; canChange?: boolean }) {
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
                  {CHECK_COLUMNS.map(([key, colLabel]) => <td key={key}><LeadSourceSwitch source={l} column={key} label={colLabel} readOnly={readOnly} disabled={!canChange} /></td>)}
                </tr>
              )),
            ])}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
