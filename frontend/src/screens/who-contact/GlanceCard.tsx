import Link from 'next/link';
import type { CheckColumn, GlanceTone, WhoGlance } from '@/api/types';
import { Card } from '@/components/ui/Card';
import { CountButton } from './CountButton';

const INK: Record<GlanceTone, string> = { ok: 'var(--ok)', warn: 'var(--warn)', bad: 'var(--bad)', gray: 'var(--txt-3)' };

/** "Each list at a glance" (owner 2026-11-16): one answer per list for the month, worked out by the backend. */
export function GlanceCard({ glance, readOnly, onOpen }: { glance: WhoGlance; readOnly: boolean; onOpen?: (column: CheckColumn, label: string) => void }) {
  return (
    <Card title="Each list at a glance" sub={`${glance.contacts.toLocaleString('en-US')} contacts ${glance.words}`}>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {glance.lists.map((g) => (
          <div key={g.col} data-explain={g.list} className="flex flex-col items-start gap-1.5 rounded-xl border border-line p-4" style={{ borderTop: `3px solid ${INK[g.tone]}` }}>
            <div className="tiny font-bold uppercase tracking-[0.12em]" data-explain-title>{g.list}</div>
            <div className="font-display text-[16px] font-bold" style={{ color: INK[g.tone] }}>{g.verdict}</div>
            <p className="text-[12.5px] text-txt-2">{g.text}</p>
            {g.count && <CountButton n={g.count.n} label={g.count.label} onOpen={onOpen && (() => onOpen(g.col, g.count!.label))} />}
            {g.upload && !readOnly && <Link href="/sources" className="btn btn-ghost btn-sm">{g.upload.label} →</Link>}
          </div>
        ))}
      </div>
    </Card>
  );
}
