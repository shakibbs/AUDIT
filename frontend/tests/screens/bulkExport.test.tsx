import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { BulkExport, parseNumbers } from '@/screens/reports/BulkExport';
import { renderScreen } from '../utils';

describe('bulk evidence export (Module 14 step 3)', () => {
  it('offers the files and the certification pack, up to 25 numbers', async () => {
    renderScreen(<BulkExport period="Oct 2026" />);
    const user = userEvent.setup();
    await user.type(screen.getByLabelText('Phone numbers'), '+19165550142');
    expect(screen.getByRole('button', { name: 'Export 1 file' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'With certification pack' })).toBeEnabled();
    await user.clear(screen.getByLabelText('Phone numbers'));
    await user.type(screen.getByLabelText('Phone numbers'), Array.from({ length: 26 }, (_, i) => `+1916555${String(i).padStart(4, '0')}`).join(', '));
    expect(screen.getByText('Up to 25 numbers at a time.')).toBeInTheDocument();
  });
});

describe('bulk export reads numbers in any format (QA 2026-10-23)', () => {
  it('keeps numbers typed with spaces and says which lines are not numbers', () => {
    const { numbers, notNumbers } = parseNumbers('(512) 555-0701\n+1 512 555 0711\n512.555.0702; 5125550703\ncall back Tuesday\n\n');
    expect(numbers).toEqual(['(512) 555-0701', '+1 512 555 0711', '512.555.0702', '5125550703']);
    expect(notNumbers).toEqual(['call back Tuesday']);
  });
});


describe('nothing to export', () => {
  it('says none of the numbers are in CiV records instead of downloading an empty ZIP', async () => {
    const { server } = await import('../msw');
    const { http, HttpResponse } = await import('msw');
    server.use(http.post('*/api/evidence-bundle', () => new HttpResponse('zip', { status: 200, headers: { 'X-Not-Found': '2', 'content-type': 'application/zip' } })));
    renderScreen(<BulkExport period="Oct 2026" />);
    const user = userEvent.setup();
    await user.type(screen.getByLabelText('Phone numbers'), '(512) 555-0701, (512) 555-0702');
    await user.click(screen.getByRole('button', { name: 'Export 2 files' }));
    expect(await screen.findByText(/None of these 2 numbers are in CiV's records/)).toBeInTheDocument();
  });
});
