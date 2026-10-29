import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { PeriodSelect } from '@/components/shell/PeriodSelect';
import { ActionsScreen } from '@/screens/actions/ActionsScreen';
import { ConductScreen } from '@/screens/conduct/ConductScreen';
import { renderScreen } from '../utils';

let path = '/conduct';
vi.mock('next/navigation', () => ({ usePathname: () => path }));

const periods = [{ id: '2026-10', label: 'Oct 2026' }, { id: '2026-09', label: 'Sep 2026' }];

afterEach(() => { localStorage.clear(); vi.restoreAllMocks(); });

describe('one month for every page (owner 2026-10-30)', () => {
  it('Contact Conduct asks for the charts of the chosen month', async () => {
    const fetching = vi.spyOn(globalThis, 'fetch');
    renderScreen(<><PeriodSelect periods={periods} /><ConductScreen /></>);
    await userEvent.setup().selectOptions(screen.getByRole('combobox'), '2026-09');
    await waitFor(() => expect(fetching.mock.calls.some(([url]) => String(url).includes('/api/conduct?period=2026-09'))).toBe(true));
    expect(localStorage.getItem('civ-period')).toBe('2026-09');  // remembered after a reload
  });

  it('the Action Queue asks for the findings and score of the chosen month', async () => {
    const fetching = vi.spyOn(globalThis, 'fetch');
    renderScreen(<><PeriodSelect periods={periods} /><ActionsScreen /></>);
    await userEvent.setup().selectOptions(screen.getByRole('combobox'), '2026-09');
    const asked = () => fetching.mock.calls.map(([url]) => String(url));
    await waitFor(() => expect(asked().some((u) => u.includes('/api/actions?period=2026-09'))).toBe(true));
    expect(asked().some((u) => u.includes('/api/score?period=2026-09'))).toBe(true);
  });

  it('a remembered month comes back, and a month this company does not have goes back to the latest', async () => {
    localStorage.setItem('civ-period', '2026-09');
    const first = renderScreen(<PeriodSelect periods={periods} />);
    await waitFor(() => expect(screen.getByRole('combobox')).toHaveValue('2026-09'));
    first.unmount();
    localStorage.setItem('civ-period', '2025-01');
    renderScreen(<PeriodSelect periods={periods} />);
    await waitFor(() => expect(screen.getByRole('combobox')).toHaveValue('2026-10'));
  });

  it('pages that are the same every month say so', () => {
    path = '/settings';
    renderScreen(<PeriodSelect periods={periods} />);
    expect(screen.getByText('This page is the same for every month')).toBeInTheDocument();
    path = '/conduct';
  });
});
