import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { Vendor } from '@/api/types';
import { VendorTable } from '@/screens/vendors/VendorTable';
import { renderScreen } from '../utils';

describe('Vendor Ledger with real scorecards (Module 12 step 5)', () => {
  it('says the high-risk signals are not measured yet', () => {
    const v: Vendor = { id: 'v-1', name: 'Vendor E', subId: '7', leads: 150, highSignals: null, score: 73.8, grade: 'C', monthOnMonth: -11.2,
      alert: true, notEnoughData: false, history: [null, 85, 73.8], termsOnFile: false, disputeCandidates: 2, rates: [], contract: null };
    renderScreen(<VendorTable vendors={[v]} />);
    expect(screen.getByText('Not measured yet')).toBeInTheDocument();
    expect(screen.getByText('sub-ID 7')).toBeInTheDocument();
    expect(screen.getByText('Alert')).toBeInTheDocument();
  });
});

describe('Vendor Ledger with no vendors (Module 12)', () => {
  it('says there are none instead of showing sample vendors', async () => {
    const { http, HttpResponse } = await import('msw');
    const { server } = await import('../msw');
    const { VendorsScreen } = await import('@/screens/vendors/VendorsScreen');
    server.use(http.get('*/api/vendors', () => HttpResponse.json({ gradeMix: 'Not measured', gradeMixNote: 'No vendor named', disputeCandidates: 0, alerts: 0, alertNote: 'No vendors yet', vendors: [] })));
    renderScreen(<VendorsScreen />);
    expect(await screen.findByText(/No vendors yet\. CiV lists the vendors/)).toBeInTheDocument();
    expect(screen.queryByText('Vendor A')).not.toBeInTheDocument();
  });
});
