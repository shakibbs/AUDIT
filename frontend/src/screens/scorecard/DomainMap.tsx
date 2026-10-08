'use client';

import { FAMILIES, type Domain } from '@/api/types';
import { Card } from '@/components/ui/Card';
import { FamilyRow } from './FamilyRow';

const LEGEND: [string, string][] = [['A', 'b-a'], ['B', 'b-b'], ['C', 'b-c'], ['D', 'b-d'], ['F', 'b-f'], ['Info · N/M', 'b-n']];

/** All 25 domains, one row per family, tiles aligned in columns and tinted by grade. */
export function DomainMap({ domains }: { domains: Domain[] }) {
  return (
    <Card title="Domain map" sub="One row per family. Each tile is one domain; select it for the detail"
      right={
        <div className="hidden flex-wrap items-center gap-1.5 md:flex" aria-label="Grade colours">
          {LEGEND.map(([label, cls]) => <span key={label} className={`rounded-md px-2 py-0.5 font-display text-[11px] font-bold ${cls}`}>{label}</span>)}
        </div>
      }>
      {FAMILIES.map((family) => <FamilyRow key={family} family={family} domains={domains.filter((d) => d.family === family)} />)}
      <p className="tiny mb-0 mt-3 border-t border-line-2 pt-3">N/M = not measured (a source is missing). Info = a client-list domain, shown for information and left out of the Audit Score. The grade beside each family is the average of its scored domains.</p>
    </Card>
  );
}
