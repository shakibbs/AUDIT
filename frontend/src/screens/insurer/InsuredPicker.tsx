'use client';

import { useInsureds } from '@/api/queries';
import { usePortal } from '@/state/PortalContext';
import { useViewer } from './useViewer';

/** Underwriter only: choose which insured company the page shows. */
export function InsuredPicker() {
  const { underwriter } = useViewer();
  const list = useInsureds(underwriter).data ?? [];
  const { insuredId, setInsuredId } = usePortal();
  if (!underwriter) return null;
  return (
    <label className="flex items-center gap-2 text-[12px] text-txt-2">
      <span className="sr-only">Insured</span>
      <select className="field !w-auto !py-2 font-semibold" value={insuredId} onChange={(e) => setInsuredId(e.target.value)}>
        {list.map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}
      </select>
    </label>
  );
}
