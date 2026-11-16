import { screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { WhoContactScreen } from '@/screens/who-contact/WhoContactScreen';
import { renderScreen } from '../utils';

// Owner 2026-11-16: "Each list at a glance" shows the backend's answer for each list, above "Who checked what".
describe('each list at a glance', () => {
  it('shows one answer per list with counts and upload links', async () => {
    renderScreen(<WhoContactScreen />);
    const card = (await screen.findByText('Each list at a glance')).closest('section')!;
    expect(within(card).getByText('7,120 contacts in Sep 2026')).toBeInTheDocument();
    expect(within(card).getByText('Checked, 4 called anyway')).toBeInTheDocument();
    expect(within(card).getByText('4 called anyway')).toBeInTheDocument();
    expect(within(card).getAllByText("Can't tell")).toHaveLength(3);
    expect(within(card).getByRole('link', { name: 'Upload query logs →' })).toHaveAttribute('href', '/sources');
    expect(screen.getByText('Who checked what')).toBeInTheDocument();  // the existing card stays
  });
});
