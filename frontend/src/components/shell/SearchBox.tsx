'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useSearch } from '@/api/queries';
import type { SearchHit } from '@/api/types';
import { Icon } from '@/components/ui/Icon';
import { useDrawer } from '@/state/DrawerContext';
import { usePortal } from '@/state/PortalContext';

const KIND_LABEL: Record<SearchHit['kind'], string> = { domain: 'Domain', metric: 'Metric', number: 'Number', vendor: 'Vendor', page: 'Page', insured: 'Insured' };

/** Finds a domain, metric, phone number, vendor or page from anywhere in the portal. */
export function SearchBox({ placeholder = 'Search domains, metrics, numbers, vendors…' }: { placeholder?: string }) {
  const [q, setQ] = useState('');
  const [focused, setFocused] = useState(false);
  const [active, setActive] = useState(-1);  // the result picked with the arrow keys (QA 2026-10-23)
  const [narrow, setNarrow] = useState(false);  // a phone: "Search…" fits, the long hint was cut to "Sear"
  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return;  // very old browsers and the test browser
    const media = window.matchMedia('(max-width: 640px)');
    const update = () => setNarrow(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);
  const hits = useSearch(q);
  const router = useRouter();
  const { open } = useDrawer();
  const { setInsuredId } = usePortal();

  function go(hit: SearchHit) {
    setQ('');
    setActive(-1);
    if (hit.kind === 'number') router.push(`/numbers/${encodeURIComponent(hit.id)}`);
    else if (hit.kind === 'page') router.push(hit.id);
    else if (hit.kind === 'insured') { setInsuredId(hit.id); router.push('/attestation'); }
    else open(hit.kind, hit.id);
  }

  const show = focused && q.trim().length >= 2;
  const list = hits.data ?? [];
  function onKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!show || !list.length) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive((i) => (i + 1) % list.length); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((i) => (i <= 0 ? list.length - 1 : i - 1)); }
    else if (e.key === 'Enter' && active >= 0) { e.preventDefault(); go(list[active]); }
    else if (e.key === 'Escape') { setQ(''); setActive(-1); }
  }
  return (
    <div className="relative min-w-0 max-w-[420px] flex-1">
      <Icon name="search" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-txt-3" />
      <input type="search" role="combobox" aria-expanded={show} aria-controls="search-results" aria-label="Search" placeholder={narrow ? 'Search…' : placeholder}
        className="field !pl-9" value={q} onChange={(e) => { setQ(e.target.value); setActive(-1); }} onKeyDown={onKey}
        aria-activedescendant={active >= 0 ? `search-hit-${active}` : undefined} onFocus={() => setFocused(true)} onBlur={() => setTimeout(() => setFocused(false), 150)} />
      {show && (
        <ul id="search-results" role="listbox" className="absolute inset-x-0 top-full z-40 m-0 mt-2 max-h-[360px] list-none overflow-y-auto rounded-xl border border-line bg-surface p-1.5 shadow-lg">
          {hits.data?.length === 0 && <li className="px-3 py-3 text-[12.5px] text-txt-2">Nothing matches “{q}”.</li>}
          {q.trim().length < 2 ? null : list.map((hit, i) => (
            <li key={`${hit.kind}-${hit.id}`} id={`search-hit-${i}`} role="option" aria-selected={i === active}>
              <button type="button" tabIndex={-1} onMouseDown={(e) => e.preventDefault()} onClick={() => go(hit)} className={`flex w-full items-center gap-3 rounded-lg border-0 px-3 py-2 text-left text-[13px] text-txt hover:bg-surface-3 ${i === active ? 'bg-surface-3' : 'bg-transparent'}`}>
                <span className="pill pill-gray w-[62px] justify-center">{KIND_LABEL[hit.kind]}</span>
                <span className="flex-1 truncate font-medium">{hit.label}</span>
                <span className="tiny">{hit.hint}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
