import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { LeadsScreen } from '@/screens/leads/LeadsScreen';
import { renderScreen } from '../utils';

describe('Lead Provenance (Module 8)', () => {
  it('keeps the existing cards and adds where numbers came from, untraced numbers and uploads', async () => {
    renderScreen(<LeadsScreen />);
    expect(await screen.findByText('Leads inspected')).toBeInTheDocument();
    expect(screen.getByText('Leads by signal level')).toBeInTheDocument();
    expect(screen.getByText('Most frequent signals')).toBeInTheDocument();
    expect(screen.getByText('Most often missing')).toBeInTheDocument();
    expect(await screen.findByText('Where your called numbers came from')).toBeInTheDocument();
    expect(screen.getByText(/Lead platform feed and Vendor invoice: not connected yet/)).toBeInTheDocument();
    expect(screen.getByText(/SolarLeads Inc · CRM lead source/)).toBeInTheDocument();
    expect(screen.getByText('(850) •••-0009')).toBeInTheDocument();
    expect(screen.getByText('salesforce leads:00Q9')).toBeInTheDocument();
    expect(screen.getByText(/1 opt-out mark\(s\) cleared by this upload/)).toBeInTheDocument();
    expect(screen.getByText('24% of 50')).toBeInTheDocument();
  });

  it('lets an Admin answer a proof request with "We have none"', async () => {
    const user = userEvent.setup();
    renderScreen(<LeadsScreen />);
    const row = (await screen.findByText('(916) •••-0001')).closest('tr')!;
    expect(within(row).getByText(/Due/)).toBeInTheDocument();
    await user.click(within(row).getByRole('button', { name: 'We have none' }));
    expect(await within(row).findByText('You have none')).toBeInTheDocument();
  });

  it('shows attached proof waiting for CiV and checked proof', async () => {
    renderScreen(<LeadsScreen />);
    expect(await screen.findByText('Proof attached · CiV checking')).toBeInTheDocument();
    expect(screen.getByText('Checked: valid')).toBeInTheDocument();
  });
});
