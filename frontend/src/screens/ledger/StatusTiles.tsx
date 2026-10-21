import type { ConsentStatus, ConsentSummary } from '@/api/types';
import { formatCount } from '@/lib/format';

const NAME: Partial<Record<ConsentStatus, string>> = { VERIFIED: 'Verified', WEAK: 'Weak', CONFLICTING: 'Conflicting', NO_PROOF: 'No proof' };
const INK: Partial<Record<ConsentStatus, string>> = { VERIFIED: 'var(--ok-ink)', WEAK: 'var(--warn-ink)', CONFLICTING: 'var(--serious-ink)', NO_PROOF: 'var(--bad-ink)' };

/** This month's contacts by consent status, one card each. Clicking a card shows those contacts in the table below. */
export function StatusTiles({ consent, onPick }: { consent: ConsentSummary; onPick: (status: ConsentStatus) => void }) {
  const apart = [consent.pending ? `${formatCount(consent.pending)} pending` : '', consent.frozen ? `${formatCount(consent.frozen)} frozen` : ''].filter(Boolean).join(' · ');
  return (
    <div className="flex flex-col gap-2">
      <div className="tiny">{consent.period ? `This month · ${consent.period}` : 'This period'} · {formatCount(consent.contacts)} contacts evaluated{apart && ` · ${apart} (not counted)`}</div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {consent.mix.map((m) => (
          <button key={m.status} type="button" className="card kpi text-left" onClick={() => onPick(m.status)} aria-label={`Show ${NAME[m.status]} contacts`}>
            <span className="kpi-tag">{NAME[m.status] ?? m.status}</span>
            <span className="kpi-val" style={{ color: INK[m.status] }}>{formatCount(m.count)}<small> {m.share.toFixed(0)}%</small></span>
            <span className="kpi-foot">
              {m.status === 'NO_PROOF' && consent.noProofLegal !== undefined ? `${formatCount(consent.noProofLegal)} where a legal basis requires proof` : m.note}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
