'use client';

import { useInsureds, useSession } from '@/api/queries';
import { usePortal } from '@/state/PortalContext';

const OWN_COMPANY = 'sunpath';

/** Who is looking and which insured they look at. A client always sees its own company. */
export function useViewer() {
  const session = useSession().data;
  const { insuredId } = usePortal();
  const underwriter = session?.view === 'underwriter';
  const list = useInsureds(underwriter).data;
  // A real insurer's companies have their own ids: open the first one until another is picked.
  const chosen = list && list.length && !list.some((i) => i.id === insuredId) ? list[0].id : insuredId;
  const org = session?.sampleData === false ? session.clientName : 'Falcon Risk';
  return { underwriter, insuredId: underwriter ? chosen : OWN_COMPANY, eyebrow: underwriter ? `${org} · underwriting` : 'Shared with your insurer' };
}
