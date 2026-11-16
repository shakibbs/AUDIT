import { screen, within } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { whoContact } from '@fixtures/data/whoContact';
import { WhoContactScreen } from '@/screens/who-contact/WhoContactScreen';
import { server } from '../msw';
import { renderScreen } from '../utils';

// Owner 2026-11-16: every vendor and list shows what CiV found for each check, above the client's own switch.
describe('what CiV found per vendor and list', () => {
  it('shows the sample client: can not tell without files, internal list counted, switches kept', async () => {
    renderScreen(<WhoContactScreen />);
    const row = (await screen.findByText('Vendor A')).closest('tr')!;
    expect(within(row).getAllByText("Can't tell · no DNC check file")).toHaveLength(2);
    expect(within(row).getByText('3 on your list still called')).toBeInTheDocument();
    expect(within(row).getAllByRole('switch')).toHaveLength(4);
  });

  it('shows checked of total, and how many were not checked', async () => {
    const counted = { ...whoContact, leadSources: whoContact.leadSources.map((l) => l.id !== 'ls-a' ? l : { ...l, found: { ...l.found!, national: { tone: 'warn' as const, text: 'of 1,380 numbers called were checked', checked: 1210, total: 1380, count: { n: 170, label: 'not checked' } } } }) };
    server.use(http.get('*/api/who-contact', () => HttpResponse.json(counted)));
    renderScreen(<WhoContactScreen />);
    const row = (await screen.findByText('Vendor A')).closest('tr')!;
    expect(within(row).getByText('Marked checked · CiV disagrees')).toBeInTheDocument();  // its national switch is on
    expect(within(row).getByText('1,210')).toBeInTheDocument();
    expect(within(row).getByText('170 not checked')).toBeInTheDocument();
  });
});

describe('switches say who and when', () => {
  it('shows who switched a list on, and labels it against what CiV found', async () => {
    renderScreen(<WhoContactScreen />);
    const row = (await screen.findByText('Vendor A')).closest('tr')!;
    expect(within(row).getAllByText('by Dana Reyes (Admin) · 2 Oct 2026')).toHaveLength(2);  // national and state are on
    expect(within(row).getAllByText('Checked · marked by you')).toHaveLength(2);  // CiV cannot tell without a DNC file
    expect(within(row).getAllByText('List as checked')).toHaveLength(2);
  });

  it('says CiV disagrees when the records do not match', async () => {
    const user = (await import('@testing-library/user-event')).default.setup();
    renderScreen(<WhoContactScreen />);
    const row = (await screen.findByText('Vendor A')).closest('tr')!;
    await user.click(within(row).getByRole('switch', { name: 'Vendor A: Internal DNC' }));
    expect(await within(row).findByText('Marked checked · CiV disagrees')).toBeInTheDocument();  // 3 on the list were still called
    expect(within(row).getByText('Listed as checked · records don’t match')).toBeInTheDocument();
  });
});
