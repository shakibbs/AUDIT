'use client';

import { useDrawer } from '@/state/DrawerContext';

/** Three-letter domain code that opens the domain panel. `plain` shows it as a label, for use inside another button. */
export function DomainCode({ code, plain = false }: { code: string; plain?: boolean }) {
  const { open } = useDrawer();
  if (plain) return <span className="dcode !cursor-default">{code}</span>;
  return <button type="button" className="dcode" onClick={(e) => { e.stopPropagation(); open('domain', code); }} aria-label={`Open domain ${code}`}>{code}</button>;
}
