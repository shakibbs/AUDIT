import { screen } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { evidenceFiles } from '@fixtures/data/evidence';
import { EvidenceFileScreen } from '@/screens/evidence/EvidenceFileScreen';
import { server } from '../msw';
import { renderScreen } from '../utils';

describe('evidence file export (Module 14 step 1)', () => {
  it('offers the PDF and the JSON of a real number to an Admin', async () => {
    server.use(http.get('*/api/evidence/p-abababababababababababab', () => HttpResponse.json(Object.values(evidenceFiles)[0])));
    renderScreen(<EvidenceFileScreen phone="p-abababababababababababab" />);
    expect(await screen.findByRole('button', { name: /Export this file/ })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'JSON' })).toHaveAttribute('href', '/api/evidence-file/p-abababababababababababab?format=json');
  });
});
