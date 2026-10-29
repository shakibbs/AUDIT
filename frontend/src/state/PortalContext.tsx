'use client';

import { useSession } from '@/api/queries';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

interface PortalState {
  period: string | undefined; setPeriod: (id: string | undefined) => void;
  /** The insured company an underwriter is looking at. */
  insuredId: string; setInsuredId: (id: string) => void;
}

const PortalContext = createContext<PortalState>({ period: undefined, setPeriod: () => {}, insuredId: 'own', setInsuredId: () => {} });

const KEY = 'civ-period';

/** Holds the month chosen in the top bar (undefined means the latest) and the insured an underwriter selected. The
 * month is one choice for every page, kept in this browser so a reload does not jump back to the latest (2026-10-30). */
export function PortalProvider({ children }: { children: React.ReactNode }) {
  const [period, setChosen] = useState<string>();
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- the saved month is only known in the browser
    try { setChosen(localStorage.getItem(KEY) ?? undefined); } catch { /* storage unavailable */ }
  }, []);
  const setPeriod = useCallback((id: string | undefined) => {
    setChosen(id);
    try { if (id) localStorage.setItem(KEY, id); else localStorage.removeItem(KEY); } catch { /* storage unavailable */ }
  }, []);
  const [insuredId, setInsuredId] = useState('own');
  const value = useMemo(() => ({ period, setPeriod, insuredId, setInsuredId }), [period, setPeriod, insuredId]);
  return <PortalContext.Provider value={value}>{children}</PortalContext.Provider>;
}

export const usePortal = () => useContext(PortalContext);

/** The month every page shows: the one chosen in the picker, or the newest one it lists (so a page never shows "the
 * last 90 days" while the picker says "Oct 2026", 2026-10-30). */
export function useMonth(): string | undefined {
  const { period } = usePortal();
  const latest = useSession().data?.periods?.[0]?.id;
  return period ?? latest;
}
