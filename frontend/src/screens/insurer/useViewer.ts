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
  // A client user previewing their own company as their insurer sees it (owner decision 2026-10-22).
  const preview = underwriter && session?.orgKind === 'client' && session.sampleData === false;
  const eyebrow = preview ? 'How your insurer sees you' : underwriter ? `${org} · underwriting` : 'Shared with your insurer';
  // An insurer asks for a company only once its own list is in (no request for a sample id), and nothing when empty.
  const empty = underwriter && list !== undefined && list.length === 0;
  const ready = !underwriter || (list !== undefined && list.length > 0);
  return { underwriter, preview, empty, ready, insuredId: underwriter ? chosen : OWN_COMPANY, eyebrow };
}
