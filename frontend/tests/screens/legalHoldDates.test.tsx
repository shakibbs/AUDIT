import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { LegalHolds } from '@/screens/vault/LegalHolds';
import { renderScreen } from '../utils';

describe('legal hold on a date range (owner 2026-10-30)', () => {
  it('picks the dates on two calendars', async () => {
    renderScreen(<LegalHolds />);
    const user = userEvent.setup();
    await user.selectOptions(screen.getByLabelText('Hold on'), 'date range');
    expect(screen.queryByLabelText('Which one')).not.toBeInTheDocument();
    await user.type(screen.getByLabelText('Reason'), 'Smith v. Demo Solar Co');
    expect(screen.getByRole('button', { name: 'Set hold' })).toBeDisabled();
    await user.type(screen.getByLabelText('From'), '2026-09-10');
    await user.type(screen.getByLabelText('To'), '2026-09-20');
    expect(screen.getByRole('button', { name: 'Set hold' })).toBeEnabled();
  });
});
