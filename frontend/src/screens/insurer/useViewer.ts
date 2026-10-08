'use client';

import { useSession } from '@/api/queries';
import { usePortal } from '@/state/PortalContext';

const OWN_COMPANY = 'sunpath';

/** Who is looking and which insured they look at. A client always sees its own company. */
export function useViewer() {
  const session = useSession().data;
  const { insuredId } = usePortal();
  const underwriter = session?.view === 'underwriter';
  return { underwriter, insuredId: underwriter ? insuredId : OWN_COMPANY, eyebrow: underwriter ? 'Falcon Risk · underwriting' : 'Shared with your insurer' };
}
