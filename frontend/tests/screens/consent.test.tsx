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
