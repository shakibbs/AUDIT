import type { IconName } from '@/components/ui/Icon';

export interface NavItem { href: string; label: string; icon: IconName; badge?: 'actions' | 'alerts' | 'urgent' }
export interface NavGroup { title: string; items: NavItem[] }

export const NAV: NavGroup[] = [
  { title: 'Your position', items: [
    { href: '/', label: 'Overview', icon: 'grid' },
    { href: '/scorecard', label: 'Audit Scorecard', icon: 'shield' },
    { href: '/actions', label: 'Action Queue', icon: 'list', badge: 'actions' },
    { href: '/alerts', label: 'Alerts', icon: 'bell', badge: 'alerts' },
  ] },
  { title: 'Evidence', items: [
    { href: '/consent', label: 'Consent Integrity', icon: 'check-circle' },
    { href: '/ledger', label: 'Contact Ledger', icon: 'book' },
    { href: '/revocation', label: 'Revocation Integrity', icon: 'undo' },
    { href: '/vault', label: 'Evidence Vault', icon: 'lock' },
  ] },
  { title: 'Intelligence', items: [
    { href: '/conduct', label: 'Contact Conduct', icon: 'phone' },
    { href: '/leads', label: 'Lead Provenance', icon: 'funnel' },
    { href: '/vendors', label: 'Vendor Ledger', icon: 'building' },
  ] },
  { title: 'Disclosure', items: [
    { href: '/sources', label: 'Source Registry', icon: 'database' },
    { href: '/reports', label: 'Reports & Exports', icon: 'file' },
  ] },
  { title: 'Engagement', items: [
    { href: '/rulebook', label: 'Rulebook', icon: 'sliders' },
    { href: '/regulatory', label: 'Regulatory Changes', icon: 'landmark' },
  ] },
  { title: 'Account', items: [
    { href: '/setup', label: 'Setup & Readiness', icon: 'clipboard' },
    { href: '/settings', label: 'Settings', icon: 'settings' },
    { href: '/users', label: 'Users & Access', icon: 'users' },
  ] },
];

/** The short menu shown in Simple view: only the most important pages. */
export const SIMPLE_NAV: NavGroup[] = [
  { title: 'Simple view', items: [
    { href: '/', label: 'Home', icon: 'grid' },
    { href: '/alerts', label: 'Urgent alerts', icon: 'bell', badge: 'urgent' },
    { href: '/actions', label: 'Things to fix', icon: 'list', badge: 'actions' },
    { href: '/reports', label: 'Reports', icon: 'file' },
  ] },
];

export const SIMPLE_PATHS = SIMPLE_NAV[0].items.map((item) => item.href);
