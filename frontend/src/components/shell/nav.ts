import type { IconName } from '@/components/ui/Icon';

export interface NavItem { href: string; label: string; icon: IconName; badge?: 'actions' | 'alerts' }
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

/** Client view: the insurer-facing pages about the client's own company. */
export const SHARED_WITH_INSURER: NavGroup = { title: 'Shared with your insurer', items: [
  { href: '/integrity', label: 'Data Integrity', icon: 'shield' },
  { href: '/attestation', label: 'Risk Attestation', icon: 'clipboard' },
  { href: '/uw-export', label: 'Underwriting Export', icon: 'download' },
] };

/** Underwriter view: the insurer's own pages, plus the read-only Engagement pages. */
export const UNDERWRITER_NAV: NavGroup[] = [
  { title: 'Falcon Risk · underwriting', items: [
    { href: '/portfolio', label: 'Portfolio', icon: 'grid' },
    { href: '/exposure', label: 'Exposure Indicator', icon: 'target' },
    { href: '/integrity', label: 'Data Integrity', icon: 'shield' },
    { href: '/attestation', label: 'Risk Attestation', icon: 'clipboard' },
    { href: '/litigation', label: 'Litigation Intelligence', icon: 'landmark' },
    { href: '/uw-export', label: 'Underwriting Export', icon: 'download' },
  ] },
  { title: 'Engagement', items: [
    { href: '/rulebook', label: 'Rulebook', icon: 'sliders' },
    { href: '/regulatory', label: 'Regulatory Changes', icon: 'landmark' },
  ] },
];
