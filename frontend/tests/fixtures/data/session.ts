import type { Session } from '@/api/types';

/** Months shown in history charts; the engagement began in June 2026. */
export const MONTHS = ['Jun', 'Jul', 'Aug', 'Sep'];

export const session: Session = {
  signedIn: true,
  userId: 'u-1', name: 'Dana Reyes', initials: 'DR', email: 'dana.reyes@sunpath.example',
  clientId: 'sunpath', clientName: 'SunPath Residential Solar', vertical: 'Solar',
  role: 'admin', isCounsel: false, view: 'owner', plan: 'Growth', orgKind: 'client',
  updatedAt: '2026-09-30T04:10:00Z',
  periods: [
    { id: '2026-09', label: 'Sep 2026' }, { id: '2026-08', label: 'Aug 2026' },
    { id: '2026-07', label: 'Jul 2026' }, { id: '2026-06', label: 'Jun 2026' },
  ],
};
