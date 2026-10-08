import type { SourceGrade } from '@/api/types';

export const GRADE_INFO: Record<SourceGrade, { label: string; weight: number; cls: string }> = {
  A: { label: 'Captured by CiV', weight: 1, cls: 'pill-teal' },
  B: { label: 'Independent third party', weight: 1, cls: 'pill-teal' },
  C: { label: 'Company systems by API', weight: 1, cls: 'pill-blue' },
  D: { label: 'Exported by the company', weight: 0.7, cls: 'pill-gray' },
  S: { label: 'Insured states', weight: 0, cls: 'pill-amber' },
  N: { label: 'Not supplied', weight: 0, cls: 'pill-red' },
};

/** Where a value came from (source grade, decision D30). S and N count for nothing toward evidence coverage. */
export function SourceGradeChip({ grade }: { grade: SourceGrade }) {
  const g = GRADE_INFO[grade];
  return <span className={`pill ${g.cls}`} title={`Weight ${g.weight}${g.weight === 0 ? ' · can lower a score, never raise it' : ''}`}>Source grade {grade} · {g.label}</span>;
}
