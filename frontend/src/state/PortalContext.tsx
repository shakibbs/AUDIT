'use client';

import { createContext, useContext, useMemo, useState } from 'react';

interface PortalState {
  period: string | undefined; setPeriod: (id: string) => void; runId: string | undefined; setRunId: (id: string) => void;
  /** The insured company an underwriter is looking at. */
  insuredId: string; setInsuredId: (id: string) => void;
}

const PortalContext = createContext<PortalState>({ period: undefined, setPeriod: () => {}, runId: undefined, setRunId: () => {}, insuredId: 'sunpath', setInsuredId: () => {} });

/** Holds the month and run chosen in the top bar (undefined means the latest) and the insured an underwriter selected. */
export function PortalProvider({ children }: { children: React.ReactNode }) {
  const [period, setPeriod] = useState<string>();
  const [runId, setRunId] = useState<string>();
  const [insuredId, setInsuredId] = useState('sunpath');
  const value = useMemo(() => ({ period, setPeriod, runId, setRunId, insuredId, setInsuredId }), [period, runId, insuredId]);
  return <PortalContext.Provider value={value}>{children}</PortalContext.Provider>;
}

export const usePortal = () => useContext(PortalContext);
