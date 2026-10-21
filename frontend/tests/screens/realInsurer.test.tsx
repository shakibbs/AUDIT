import { screen } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import type { Insured } from '@/api/types';
import { mockApi } from '@/mock/api';
import { AttestationScreen } from '@/screens/insurer/AttestationScreen';
import { ExportScreen } from '@/screens/insurer/ExportScreen';
import { ExposureScreen } from '@/screens/insurer/ExposureScreen';
import { IntegrityScreen } from '@/screens/insurer/IntegrityScreen';
import { PortfolioScreen } from '@/screens/insurer/PortfolioScreen';
import { server } from '../msw';
import { renderScreen } from '../utils';

// What Django sends a real insurer for a company with no records yet (Demo Solar Co, 2026-10-22): nothing is filled in.
const REAL: Insured = {
  id: 'c-1', name: 'Demo Solar Co', industry: 'Solar', contactsPerMonth: null, selfReported: false, asOf: '2026-10-21', sheetHash: '7722cb368e86',
  monitoring: 'Live', signedBy: null, consentProof: null, marketingShare: null, prerecordedShare: null, smsShare: null, purchasedShare: null,
  vendors: null, vendorTermsShare: null, optOutMedianHours: null, optOutFailShare: null, contactsAfterOptOut: null, reAdded: null,
  internalListContacts: null, rndExposure: null, reassignedCheckRate: null, litigatorContacts: null, manualImportShare: null, evidenceFoundShare: null,
  praStates: null, priorStated: null, priorDocket: null, openMatters: null, coverage: null, completeness: null, unknownCallerIds: null,
  basisMix: [], conflicts: [], statements: [], reconciliation: [],
  controls: { policy: null, trainingCurrency: null, optOutTests90d: null, fingerprinted: 0 },
  exposure: { inside: { factors: [null, 100, 0, 0, null, 100], venue: 1, targeting: 1, volume: 0.9, source: 'Measured from records · Oct 2026 · partial · draft bands' }, outside: null, why: { venue: '', targeting: '', volume: '' } },
};

const SCREENS: [string, React.ReactElement][] = [
  ['Portfolio', <PortfolioScreen key="p" />], ['Exposure', <ExposureScreen key="e" />], ['Integrity', <IntegrityScreen key="i" />],
  ['Attestation', <AttestationScreen key="a" />], ['Export', <ExportScreen key="x" />],
];

describe('a real insurer with a company that has no records yet', () => {
  it.each(SCREENS)('%s shows the real company and "Not measured", never a sample', async (_, ui) => {
    mockApi({ method: 'POST', path: '/session/view-as', body: { view: 'underwriter' } });
    server.use(http.get('*/api/insureds', () => HttpResponse.json([REAL])), http.get('*/api/insureds/:id', () => HttpResponse.json(REAL)));
    const { container } = renderScreen(ui);
    expect((await screen.findAllByText(/Demo Solar Co|Not measured|Six factors|What the score rests on/)).length).toBeGreaterThan(0);
    expect(container.textContent).not.toMatch(/Meridian|Ridgeline|Northstar|Coastal Lending|SunPath/);
    expect(container.textContent).not.toMatch(/NaN|undefined/);
  });
});
