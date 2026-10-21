import type { ConsentPage } from '@/api/types';
import { formatCount, formatDate, formatDateTime } from '@/lib/format';

const SOURCE_PILL: Record<ConsentPage['source'], string> = { client_form: 'pill-green', vendor: 'pill-teal', uploaded_list: 'pill-amber', unknown: 'pill-gray' };
const FAIL: Record<ConsentPage['items'][number]['effect'], [string, string]> = {
  no_proof: ['❌', 'makes the call No proof'], wording: ['❌', 'makes the call Weak'], warning: ['⚠️', 'warning only'],
  info: ['ℹ️', 'information only'], ai: ['⏳', 'needs AI'],
};

function mark(item: ConsentPage['items'][number]): [string, string] {
  if (item.effect === 'ai' || item.result === 'not_measured') return ['⏳', item.effect === 'ai' ? 'needs AI, not measured yet' : 'not measured'];
  return item.result === 'pass' ? ['✅', ''] : FAIL[item.effect];
}

/** One consent form page: where it comes from, CiV's latest photos, the words asking for permission, the checklist. */
export function ConsentPageCard({ page }: { page: ConsentPage }) {
  return (
    <section className="card card-pad">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="mono text-[13px] font-semibold">{page.address}</div>
          <div className="tiny mt-1">First seen {formatDate(page.firstSeen)} · last seen {formatDate(page.lastSeen)} · {formatCount(page.leads)} certificates</div>
        </div>
        <span className={`pill ${SOURCE_PILL[page.source]}`}>{page.sourceLabel}</span>
      </div>
      <div className="tiny mt-3">
        {page.capturedAt ? `Photo taken by CiV ${formatDateTime(page.capturedAt)} UTC` : 'No photo yet: CiV takes one about once a day.'}
        {page.problem && <span className="flag ml-2">Could not capture: {page.problem}</span>}
      </div>
      {page.photos.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {page.photos.map((p) => <a key={p.viewport} className="btn btn-ghost no-underline" href={p.url} target="_blank" rel="noopener">📸 {p.label} photo</a>)}
        </div>
      )}
      {page.wording
        ? <blockquote className="m-0 mt-3 rounded-[10px] border-l-[3px] border-line bg-surface-3 px-4 py-3 text-[12.5px] leading-relaxed text-txt-2">{page.wording}</blockquote>
        : page.capturedAt && !page.problem && <p className="tiny mt-3">No words asking for permission were found on this page.</p>}
      <ul className="m-0 mt-3 grid list-none gap-1.5 p-0 sm:grid-cols-2">
        {page.items.map((item) => {
          const [sign, note] = mark(item);
          return <li key={item.code} className="text-[12.5px]">{sign} {item.label}{note && <span className="tiny"> · {note}</span>}</li>;
        })}
      </ul>
      {page.draft && <p className="tiny mb-0 mt-3">Checklist values are drafts, not yet confirmed by a lawyer.</p>}
    </section>
  );
}
