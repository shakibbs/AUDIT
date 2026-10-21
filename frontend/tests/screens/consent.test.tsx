import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { ConsentPanel } from '@/api/types';
import { StatusChip } from '@/components/ui/StatusChip';
import { CertificatesCard } from '@/screens/consent/CertificatesCard';
import { ConsentCard } from '@/screens/evidence/ConsentCard';
import { renderScreen } from '../utils';

const PANEL: ConsentPanel = {
  owner: 2, needsFor: '2026-10-06T16:00:00Z', frozen: 1, pending: 0, draftRules: true,
  proofs: [{ id: 'cp-1', kind: 'Consent certificate', provider: 'TrustedForm', madeAt: '2026-10-04T16:00:00Z', dateKnown: true,
    expiresAt: '2029-10-04T16:00:00Z', state: 'Claimed', tool: 'salesforce', withdrawn: false, usedBy: 3 }],
  needs: [{ basis: 'robocall_marketing', status: 'VERIFIED', proof: 'Consent certificate' }, { basis: 'dnc_unknown', status: 'VERIFIED', proof: 'Consent certificate' }],
  history: [{ at: '2026-10-18T09:00:00Z', contactAt: '2026-10-06T16:00:00Z', from: 'PENDING', to: 'VERIFIED', reason: 'certificate read', frozen: false }],
  notMeasured: ['Consent wording and pre-ticked boxes (Module 7)'],
};

describe('consent results on the portal', () => {
  it('names the new statuses in words', () => {
    render(<><StatusChip status="PENDING" /><StatusChip status="NOT_NEEDED" /></>);
    expect(screen.getByText('PENDING')).toBeInTheDocument();
    expect(screen.getByText('Not needed')).toBeInTheDocument();
  });

  it('shows the number page consent card: proofs, needs, history, not yet measured', () => {
    render(<ConsentCard consent={PANEL} />);
    expect(screen.getByText(/Owner 2 of this number · 1 frozen \(left out of totals\)/)).toBeInTheDocument();
    expect(screen.getByText('TrustedForm certificate')).toBeInTheDocument();
    expect(screen.getByText(/used by 3 contacts/)).toBeInTheDocument();
    expect(screen.getByText('Marketing robocall · written consent')).toBeInTheDocument();
    expect(screen.getByText('PENDING → VERIFIED')).toBeInTheDocument();
    expect(screen.getByText(/certificate read/)).toBeInTheDocument();
    expect(screen.getByText('Consent wording and pre-ticked boxes (Module 7)')).toBeInTheDocument();
    expect(screen.getByText(/not confirmed by a lawyer/)).toBeInTheDocument();
  });

  it('says so when the owner has no proof', () => {
    render(<ConsentCard consent={{ ...PANEL, proofs: [], needs: [], history: [], frozen: 0 }} />);
    expect(screen.getByText('No proof of permission on file for this owner.')).toBeInTheDocument();
    expect(screen.getByText('No result has changed since it was first checked.')).toBeInTheDocument();
  });

  it('lists the client\'s certificates with their state, never the whole ID', async () => {
    renderScreen(<CertificatesCard />);
    expect(await screen.findByText('Lost: not claimed in time')).toBeInTheDocument();
    expect(screen.getByText('Claimed')).toBeInTheDocument();
    expect(screen.getByText('7f3a91c2…')).toBeInTheDocument();
    expect(screen.getByText(/claim by/)).toBeInTheDocument();
  });
});

describe('the Wording tab (Module 7)', () => {
  it('shows each consent page with its source, vendor, mark, changed date, checklist count and missing items', async () => {
    const { WordingTab } = await import('@/screens/consent/WordingTab');
    renderScreen(<WordingTab />);
    expect(await screen.findByText('home-energy-match.example/form')).toBeInTheDocument();
    expect(screen.getByText("Client's own form")).toBeInTheDocument();
    expect(screen.getAllByText(/Consent box not ticked in advance/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/makes the call No proof/).length).toBe(1);
    expect(screen.getAllByText(/needs AI, not measured yet/).length).toBeGreaterThan(0);
    expect(screen.getByText(/Could not capture: The page answered 404/)).toBeInTheDocument();
    expect(screen.getAllByText('Approved').length).toBeGreaterThan(0);  // your mark is back
    expect(screen.getByText('Changed 12 Sep 2026')).toBeInTheDocument();
    expect(screen.getByText('Checklist 6 of 9')).toBeInTheDocument();
    expect(screen.getByText('Missing: Consent box not ticked in advance')).toBeInTheDocument();
    expect(screen.getByText(/Vendor E · sub-ID 7/)).toBeInTheDocument();
  });

  it('links to the photos of a page', async () => {
    const { ConsentPageCard } = await import('@/screens/consent/ConsentPageCard');
    renderScreen(<ConsentPageCard page={{ id: 'cpg-9', address: 'a.example/q', source: 'vendor', sourceLabel: 'From a vendor', firstSeen: '2026-10-01', lastSeen: '2026-10-20',
      leads: 3, capturedAt: '2026-10-20T09:00:00Z', problem: '', wording: 'I agree…', draft: true, items: [],
      mark: 'unmarked', vendor: 'Vendor A', changedOn: null, checklistPassed: 0, checklistTotal: 0, missing: [],
      photos: [{ viewport: '390x844', label: 'Phone', url: '/api/consent-pages/cpg-9/photo/390x844' }] }} />);
    expect(screen.getByRole('link', { name: /Phone photo/ })).toHaveAttribute('href', '/api/consent-pages/cpg-9/photo/390x844');
  });
});

describe('Contact Ledger status cards', () => {
  it('shows one card per status and filters the table when one is clicked', async () => {
    const userEvent = (await import('@testing-library/user-event')).default;
    const { LedgerScreen } = await import('@/screens/ledger/LedgerScreen');
    const user = userEvent.setup();
    renderScreen(<LedgerScreen />);
    const noProof = await screen.findByRole('button', { name: 'Show No proof contacts' });
    expect(screen.getByRole('button', { name: 'Show Verified contacts' })).toBeInTheDocument();
    expect(screen.getByText('2,860 where a legal basis requires proof')).toBeInTheDocument();
    await user.click(noProof);
    expect(screen.getByRole('button', { name: 'No proof', pressed: true })).toBeInTheDocument();
  });
});
