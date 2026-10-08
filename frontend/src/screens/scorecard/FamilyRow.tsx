import type { Domain, Family } from '@/api/types';
import { GradeBadge } from '@/components/ui/GradeBadge';
import { DomainTile } from './DomainTile';

/** One family of domains: its summary on the left, its domains in aligned columns on the right. */
export function FamilyRow({ family, domains }: { family: Family; domains: Domain[] }) {
  const scored = domains.filter((d) => d.score !== null && !d.excluded);
  const avg = scored.length ? scored.reduce((sum, d) => sum + (d.score ?? 0), 0) / scored.length : null;
  return (
    <div className="grid gap-4 border-t border-line-2 py-4 first:border-t-0 first:pt-1 lg:grid-cols-[190px_minmax(0,1fr)]">
      <div className="flex items-center gap-3 lg:flex-col lg:items-start lg:justify-center lg:gap-1.5">
        <div className="text-[14px] font-semibold text-txt">{family}</div>
        <div className="flex items-center gap-2">
          <GradeBadge score={avg} />
          <span className="font-display text-[18px] font-extrabold">{avg === null ? '—' : avg.toFixed(1)}</span>
        </div>
        <div className="tiny">{domains.length} {domains.length === 1 ? 'domain' : 'domains'} · {scored.length} scored</div>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 xl:grid-cols-7">
        {domains.map((d) => <DomainTile key={d.code} domain={d} />)}
      </div>
    </div>
  );
}
