import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { Vendor } from '@/api/types';
import { ContractForm } from '@/screens/vendors/ContractForm';
import { renderScreen } from '../utils';

const vendor: Vendor = {
  id: 'v-1', name: 'SolarLeads Inc', subId: null, leads: 120, highSignals: 0, score: null, grade: null, monthOnMonth: null, alert: false,
  notEnoughData: true, history: [], termsOnFile: true, disputeCandidates: 0, rates: [],
  contract: { id: 'vc-1', vendor: 'SolarLeads Inc', file: 'terms.pdf', endsOn: '2027-12-31', disputeDays: 30, state: 'on_file',
    uploadedBy: 'Dana Reyes', uploadedAt: '2026-10-22T10:00:00Z', url: '/api/vendor-contracts/vc-1/file' },
};

describe('vendor contracts (Module 12 step 3)', () => {
  it('shows the contract on file with its end date and dispute window', () => {
    renderScreen(<ContractForm vendor={vendor} />);
    expect(screen.getByText('On file')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'terms.pdf' })).toHaveAttribute('href', '/api/vendor-contracts/vc-1/file');
    expect(screen.getByText(/30 days to return a bad lead/)).toBeInTheDocument();
  });

  it('says when there is none', () => {
    renderScreen(<ContractForm vendor={{ ...vendor, contract: null }} />);
    expect(screen.getByText('No contract on file.')).toBeInTheDocument();
  });
});
