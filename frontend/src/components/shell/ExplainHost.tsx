'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { explanationFor } from '@/lib/explain';

// What can be explained, closest first: a marked spot (data-explain), a grade letter, a column heading, a label inside
// a card, then the card or tile itself.
const TARGETS = '[data-explain], .grade-badge, th, .kv dt, .card .kpi-tag:not(.kpi .kpi-tag):not(button.card .kpi-tag), .card';
const WAIT_MS = 500;

/** The first words of an element (its title), skipping the "i" of an older info icon. */
function firstText(el: Element): string {
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    const text = node.textContent?.trim();
    if (text && !node.parentElement?.closest('button[aria-label^="Explanation"]')) return text;
  }
  return '';
}

function titleOf(el: Element): { title: string; label: Element } | null {
  const key = el.getAttribute('data-explain');
  if (key) return { title: key, label: el.querySelector('[data-explain-title]') ?? el };
  if (el.classList.contains('grade-badge')) return { title: 'Grade letter', label: el };
  if (!el.classList.contains('card')) return { title: firstText(el), label: el };
  const label = el.querySelector('.card-h h3, h3, .kpi-tag');
  return label ? { title: firstText(label), label } : null;
}

/** A big card (one with a heading) is explained only from its title words, not from everything inside it, such as the six
 * factor boxes (owner, 2026-11-16); a small tile is explained from anywhere on it. */
function onItsTitle(card: Element, label: Element, start: Element | null): boolean {
  if (!card.classList.contains('card') || label.tagName !== 'H3') return true;
  return Boolean(start && label.contains(start));
}

/** The explanation for what is under the pointer, and the element to underline and place the box by. */
function find(start: Element | null, pathname: string): { text: string; label: Element; box: Element } | null {
  for (let el = start?.closest(TARGETS); el; el = el.parentElement?.closest(TARGETS) ?? null) {
    const found = titleOf(el);
    if (found && !onItsTitle(el, found.label, start)) continue;
    const text = found && explanationFor(pathname, found.title);
    if (found && text) return { text, label: found.label, box: el };
  }
  return null;
}

/** Hover to explain (owner, 2026-11-13): rest the mouse on a card, tile, label or column heading for half a second and
 * a short explanation appears; on a phone, tap its title. Titles that have one get a faint dotted underline. */
export function ExplainHost() {
  const pathname = usePathname() ?? '/';
  const [shown, setShown] = useState<{ text: string; top: number; left: number; above: boolean } | null>(null);
  const timer = useRef<number | undefined>(undefined);
  const current = useRef<Element | null>(null);

  // Mark every title that has an explanation (and keep marking as the page fills in).
  useEffect(() => {
    const mark = () => document.querySelectorAll(TARGETS).forEach((el) => {
      const found = titleOf(el);
      if (found && explanationFor(pathname, found.title) && !found.label.classList.contains('grade-badge')) found.label.classList.add('has-explain');
    });
    mark();
    const watch = new MutationObserver(mark);
    watch.observe(document.body, { childList: true, subtree: true });
    return () => watch.disconnect();
  }, [pathname]);

  useEffect(() => {
    // Under a small tile (so its number stays readable), or under the title of a big card or a column heading.
    const place = (hit: { text: string; label: Element; box: Element }) => {
      const whole = hit.box.getBoundingClientRect();
      const r = hit.box.tagName !== 'TH' && whole.height < 220 ? whole : hit.label.getBoundingClientRect();
      const width = Math.min(300, window.innerWidth - 32);
      const left = Math.min(Math.max(16, r.left), window.innerWidth - width - 16);
      const above = r.bottom + 160 > window.innerHeight && r.top > 180;
      setShown({ text: hit.text, top: above ? r.top - 8 : r.bottom + 8, left, above });
    };
    const over = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return;
      const hit = find(e.target as Element, pathname);
      if (hit?.box === current.current) return;
      window.clearTimeout(timer.current);
      current.current = hit?.box ?? null;
      setShown(null);
      if (hit) timer.current = window.setTimeout(() => place(hit), WAIT_MS);
    };
    // Phone: a tap on a marked title opens or closes its explanation; any other tap closes it.
    const tap = (e: PointerEvent) => {
      if (e.pointerType !== 'touch') return;
      const label = (e.target as Element).closest('.has-explain, .grade-badge');
      const hit = label && find(label, pathname);
      if (hit && hit.label === label && current.current !== hit.box) {
        current.current = hit.box;
        place(hit);
      } else {
        current.current = null;
        setShown(null);
      }
    };
    const away = () => { window.clearTimeout(timer.current); current.current = null; setShown(null); };
    const key = (e: KeyboardEvent) => { if (e.key === 'Escape') away(); };
    document.addEventListener('pointerover', over);
    document.addEventListener('pointerdown', tap);
    document.addEventListener('scroll', away, true);
    document.addEventListener('keydown', key);
    return () => {
      document.removeEventListener('pointerover', over);
      document.removeEventListener('pointerdown', tap);
      document.removeEventListener('scroll', away, true);
      document.removeEventListener('keydown', key);
      window.clearTimeout(timer.current);
    };
  }, [pathname]);

  if (!shown) return null;
  return (
    <div role="tooltip" className="explain-box" style={{ top: shown.top, left: shown.left, transform: shown.above ? 'translateY(-100%)' : undefined }}>
      {shown.text}
    </div>
  );
}
