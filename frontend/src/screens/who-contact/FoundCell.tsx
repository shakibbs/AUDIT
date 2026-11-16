import type { WhoFound } from '@/api/types';
import { CountButton } from './CountButton';

const PILL = { ok: 'pill-green', warn: 'pill-amber', bad: 'pill-red', gray: 'pill-gray' } as const;
const WORD = { ok: 'Checked', warn: 'Partly', bad: 'Not checked', gray: "Can't tell" } as const;
const INK = { ok: 'var(--ok)', warn: 'var(--warn)', bad: 'var(--bad)', gray: 'var(--txt-3)' } as const;
const fmt = (n: number) => n.toLocaleString('en-US');

/** What CiV found in the records for one vendor or list and one check (owner 2026-11-16). */
// Switched on by the client: the label says whether CiV's records agree (owner 2026-11-16).
function listedPill(tone: WhoFound['tone']) {
  if (tone === 'ok') return <span className="pill pill-green" data-explain="Checked · confirmed">Checked · confirmed</span>;
  if (tone === 'gray') return <span className="pill pill-teal" data-explain="Checked · marked by you">Checked · marked by you</span>;
  return <span className="pill pill-amber" data-explain="Marked checked · CiV disagrees">Marked checked · CiV disagrees</span>;
}

export function FoundCell({ found, listed = false, onOpen }: { found: WhoFound; listed?: boolean; onOpen?: (label: string) => void }) {
  const open = found.count && onOpen ? () => onOpen(found.count!.label) : undefined;
  const counted = found.total !== undefined && found.checked !== undefined;
  const pct = counted && found.total ? Math.round((100 * found.checked!) / found.total) : 0;
  return (
    <div className="flex flex-col items-start gap-1">
      {listed ? listedPill(found.tone) : <span className={`pill ${PILL[found.tone]}`} data-explain={WORD[found.tone]}>{WORD[found.tone]}</span>}
      <span className="tiny" data-explain="CiV found">CiV found:</span>
      {counted ? (
        <>
          <span className="text-[12.5px]"><b>{fmt(found.checked!)}</b> {found.text}</span>
          <span className="block h-[5px] w-full max-w-[140px] overflow-hidden rounded bg-[var(--surface-3)]" aria-hidden="true"><span className="block h-full" style={{ width: `${pct}%`, background: INK[found.tone] }} /></span>
          {found.count && <CountButton n={found.count.n} label={found.count.label} onOpen={open} />}
        </>
      ) : found.count ? <CountButton n={found.count.n} label={found.count.label} onOpen={open} />
        : <span className="text-[12.5px]">{found.text}</span>}
    </div>
  );
}
