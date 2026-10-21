import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { BulkExport } from '@/screens/reports/BulkExport';
import { renderScreen } from '../utils';

describe('bulk evidence export (Module 14 step 3)', () => {
  it('offers the files and the certification pack, up to 25 numbers', async () => {
    renderScreen(<BulkExport period="Oct 2026" />);
    const user = userEvent.setup();
    await user.type(screen.getByLabelText('Phone numbers'), '+19165550142');
    expect(screen.getByRole('button', { name: 'Export 1 file' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'With certification pack' })).toBeEnabled();
    await user.clear(screen.getByLabelText('Phone numbers'));
    await user.type(screen.getByLabelText('Phone numbers'), Array.from({ length: 26 }, (_, i) => `+1916555${String(i).padStart(4, '0')}`).join(' '));
    expect(screen.getByText('Up to 25 numbers at a time.')).toBeInTheDocument();
  });
});
