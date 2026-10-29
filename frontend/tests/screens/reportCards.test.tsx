import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { BulkExport } from '@/screens/reports/BulkExport';
import { ReportCard } from '@/screens/reports/ReportCard';
import { ReportHistory } from '@/screens/reports/ReportHistory';
import { renderScreen } from '../utils';

const litigation = { id: 'litigation', name: 'Litigation evidence package', description: 'Court-ready export.', format: 'Add-on', addOn: true };
const evidence = { id: 'evidence', name: 'Evidence file export', description: 'Per phone number.', format: 'PDF + JSON', addOn: false };

describe('report cards that are not made from a card (owner 2026-10-30)', () => {
  it('Generate on the evidence file takes you to the bulk export box', async () => {
    renderScreen(<><ReportCard report={evidence} period="Oct 2026" /><BulkExport period="Oct 2026" /></>);
    await userEvent.setup().click(screen.getByRole('button', { name: 'Generate' }));
    expect(screen.getByLabelText('Phone numbers')).toHaveFocus();
    expect(screen.getByText('Paste the numbers in the bulk evidence export below, then press Export files.')).toBeInTheDocument();
  });

  it('Request a quote tells CiV and says so on the card', async () => {
    renderScreen(<ReportCard report={litigation} period="Sep 2026" />);
    await userEvent.setup().click(screen.getByRole('button', { name: 'Request a quote' }));
    expect(await screen.findByText('Requested on 30 Sep 2026. CiV will contact you.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Requested' })).toBeDisabled();
  });

  it('an open request is still shown after the page is opened again', () => {
    renderScreen(<ReportCard report={{ ...litigation, requestedAt: '2026-10-30T19:03:00Z' }} period="Oct 2026" />);
    expect(screen.getByRole('button', { name: 'Requested' })).toBeDisabled();
    expect(screen.getByText('Requested on 30 Oct 2026. CiV will contact you.')).toBeInTheDocument();
  });

  it('the history says the quote was requested', () => {
    renderScreen(<ReportHistory runs={[{ id: 'quote-1', name: litigation.name, period: 'Oct 2026', requestedBy: 'Demo Admin', at: '2026-10-30T19:03:00Z', status: 'requested' }]} />);
    expect(screen.getByText('Quote requested')).toBeInTheDocument();
  });

  it('after CiV accepts, the card asks for the numbers', () => {
    renderScreen(<ReportCard report={{ ...litigation, quote: { step: 'accepted', at: '2026-10-30T19:03:00Z' } }} period="Oct 2026" />);
    expect(screen.getByRole('button', { name: 'Accepted' })).toBeDisabled();
    expect(screen.getByText('CiV accepted your request. Type the phone numbers below.')).toBeInTheDocument();
  });

  it('while CiV checks the package, and once it is released', () => {
    renderScreen(<ReportCard report={{ ...litigation, quote: { step: 'checking', at: '2026-10-30T19:03:00Z', madeAt: '2026-10-31T10:00:00Z', found: 2, missing: 1 } }} period="Oct 2026" />);
    expect(screen.getByText(/Package made on 31 Oct 2026 \(2 found, 1 not found\)/)).toBeInTheDocument();
    renderScreen(<ReportCard report={{ ...litigation, released: { at: '2026-11-01T09:00:00Z', url: '/api/reports/quote-1/file' } }} period="Oct 2026" />);
    expect(screen.getByRole('link', { name: 'Download' })).toHaveAttribute('href', '/api/reports/quote-1/file');
    expect(screen.getByRole('button', { name: 'Request a quote' })).toBeEnabled();
  });
});
