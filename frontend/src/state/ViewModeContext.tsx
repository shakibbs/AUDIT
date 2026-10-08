'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

export type ViewMode = 'simple' | 'full';

interface ViewModeState { mode: ViewMode; setMode: (mode: ViewMode) => void }

const ViewModeContext = createContext<ViewModeState>({ mode: 'full', setMode: () => {} });
const KEY = 'civ-view';

/** Simple or Full view. The choice is remembered in this browser; new users start in Full view. */
export function ViewModeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<ViewMode>('full');

  useEffect(() => {
    // A link may choose the view (?view=simple or ?view=full); otherwise use the saved choice.
    const asked = new URLSearchParams(window.location.search).get('view');
    try {
      if (asked === 'simple' || asked === 'full') localStorage.setItem(KEY, asked);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- the saved choice is only known in the browser
      if ((asked ?? localStorage.getItem(KEY)) === 'simple') setModeState('simple');
    } catch { if (asked === 'simple') setModeState('simple'); }
  }, []);

  const setMode = useCallback((next: ViewMode) => {
    setModeState(next);
    try { localStorage.setItem(KEY, next); } catch { /* storage unavailable */ }
  }, []);

  const value = useMemo(() => ({ mode, setMode }), [mode, setMode]);
  return <ViewModeContext.Provider value={value}>{children}</ViewModeContext.Provider>;
}

export const useViewMode = () => useContext(ViewModeContext);
