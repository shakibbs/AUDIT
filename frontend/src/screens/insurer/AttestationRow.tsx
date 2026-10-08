import type { SourceGrade } from '@/api/types';
import { SourceGradeChip } from './SourceGradeChip';

/** One field of the attestation sheet: value, where it came from, and the source behind it. */
export function AttestationRow({ field, value, grade, source, note }: { field: string; value: React.ReactNode; grade: SourceGrade; source: string; note?: string }) {
  return (
    <tr>
      <td className="font-semibold">{field}</td>
      <td className="mono">{value}{note && <div className="tiny font-sans">{note}</div>}</td>
      <td><SourceGradeChip grade={grade} /></td>
      <td className="tiny">{source}</td>
    </tr>
  );
}
