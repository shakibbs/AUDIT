'use client';

import type { Domain } from '@/api/types';
import { bandClass, gradeOf } from '@/lib/format';
import { useDrawer } from '@/state/DrawerContext';

/** One domain on the map: code, grade letter, score and full name, tinted by grade. */
export function DomainTile({ domain: d }: { domain: Domain }) {
  const { open } = useDrawer();
  const letter = d.excluded || d.score === null ? '–' : gradeOf(d.score);
  const value = d.excluded ? 'Info' : d.score === null ? 'N/M' : d.score.toFixed(1);
  return (
    <button type="button" className={`dtile !min-h-[96px] ${bandClass(d.score, d.excluded)}`} onClick={() => open('domain', d.code)}
      aria-label={`${d.name}: ${d.excluded ? 'outside the score' : d.score === null ? 'not measured' : `${d.score.toFixed(1)}, grade ${letter}`}`}>
      <span className="flex items-center justify-between">
        <span className="mono text-[11px] font-semibold">{d.code}</span>
        <span className="font-display text-[13px] font-extrabold">{letter}</span>
      </span>
      <span className="font-display text-[19px] font-extrabold leading-tight text-txt">{value}</span>
      <span className="line-clamp-2 text-[11px] leading-snug text-txt-2">{d.name}</span>
    </button>
  );
}
