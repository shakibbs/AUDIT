import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { PortalShell } from '@/components/shell/PortalShell';
import { findBannedWords } from '@/lib/wording';
import { SimpleAlertsScreen } from '@/screens/simple/SimpleAlertsScreen';
import { SimpleFixScreen } from '@/screens/simple/SimpleFixScreen';
import { SimpleHomeScreen } from '@/screens/simple/SimpleHomeScreen';
import { SimpleReportsScreen } from '@/screens/simple/SimpleReportsScreen';
import { navState } from '../nav';
import { renderScreen } from '../utils';

const SIMPLE: [string, React.ReactElement, string | RegExp][] = [
  ['Home', <SimpleHomeScreen key="h" />, 'How much of this score is backed by proof'],
  ['Urgent alerts', <SimpleAlertsScreen key="a" />, '3 new contacts after opt-out'],
  ['Things to fix', <SimpleFixScreen key="f" />, 'Top 5'],
  ['Reports', <SimpleReportsScreen key="r" />, 'Recent reports'],
];

describe('simple view screens', () => {
  it.each(SIMPLE)('%s loads and uses no banned wording', async (title, ui, proof) => {
    const { container } = renderScreen(ui);
    expect(screen.getByRole('heading', { level: 1, name: title })).toBeInTheDocument();
    expect((await screen.findAllByText(proof)).length).toBeGreaterThan(0);
    expect(findBannedWords(container.textContent ?? '')).toEqual([]);
  });

  it('lists at most five things to fix, with plain severity words', async () => {
    renderScreen(<SimpleFixScreen />);
    const card = (await screen.findByText('Top 5')).closest('section') as HTMLElement;
    await waitFor(() => expect(within(card).getAllByRole('button')).toHaveLength(5));
    expect(within(card).getAllByText('Urgent').length).toBeGreaterThan(0);
    expect(within(card).queryByText('High')).not.toBeInTheDocument();
  });

  it('shows only urgent alerts', async () => {
    renderScreen(<SimpleAlertsScreen />);
    expect(await screen.findByText('3 new contacts after opt-out')).toBeInTheDocument();
    expect(screen.queryByText('Convoso dialer has not synced for 52 hours')).not.toBeInTheDocument();
  });
});

describe('view switch', () => {
  it('starts in Full view, switches to Simple with a four-page menu, and remembers the choice', async () => {
    const user = userEvent.setup();
    localStorage.removeItem('civ-view');
    renderScreen(<PortalShell><p>page body</p></PortalShell>);
    const nav = await screen.findByRole('navigation', { name: 'Main' });
    expect(within(nav).getAllByRole('link')).toHaveLength(20);
    await user.click(screen.getByRole('button', { name: 'Simple' }));
    expect(within(nav).getAllByRole('link').map((l) => l.textContent?.replace(/\d+ open$|\d+$/, '').trim())).toEqual(['Home', 'Urgent alerts', 'Things to fix', 'Reports']);
    expect(localStorage.getItem('civ-view')).toBe('simple');
    await user.click(screen.getByRole('button', { name: 'Full' }));
    expect(within(nav).getAllByRole('link')).toHaveLength(20);
  });

  it('marks a Full-view page when the portal is in Simple view', async () => {
    const user = userEvent.setup();
    localStorage.setItem('civ-view', 'simple');
    navState.pathname = '/metrics';
    renderScreen(<PortalShell><p>page body</p></PortalShell>);
    expect(await screen.findByText(/This page is part of/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Switch to Full view' }));
    expect(screen.queryByText(/This page is part of/)).not.toBeInTheDocument();
    localStorage.removeItem('civ-view');
  });
});
