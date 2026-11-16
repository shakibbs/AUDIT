import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { WhoContactScreen } from '@/screens/who-contact/WhoContactScreen';
import { renderScreen } from '../utils';

// Owner 2026-11-16: click a count on Who You Contact to see the phone numbers behind it.
describe('the numbers behind a count', () => {
  it('opens from a vendor row', async () => {
    const user = userEvent.setup();
    renderScreen(<WhoContactScreen />);
    const row = (await screen.findByText('Vendor A')).closest('tr')!;
    await user.click(within(row).getByRole('button', { name: '3 on your list still called' }));
    const panel = await screen.findByRole('dialog');
    expect(within(panel).getByText('Vendor A · Internal DNC')).toBeInTheDocument();
    expect(await within(panel).findByText('3 numbers on your list still called')).toBeInTheDocument();
    expect(within(panel).getAllByText('On your list since 1 Aug 2026')).toHaveLength(3);
  });

  it('opens from the glance card for all sources', async () => {
    const user = userEvent.setup();
    renderScreen(<WhoContactScreen />);
    await user.click(await screen.findByRole('button', { name: '4 called anyway' }));
    const panel = await screen.findByRole('dialog');
    expect(within(panel).getByText('All sources · Internal DNC')).toBeInTheDocument();
  });
});
