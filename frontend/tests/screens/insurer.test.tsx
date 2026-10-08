import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { PortalShell } from '@/components/shell/PortalShell';
import { findBannedWords } from '@/lib/wording';
import { mockApi } from '@/mock/api';
import { AttestationScreen } from '@/screens/insurer/AttestationScreen';
import { ExportScreen } from '@/screens/insurer/ExportScreen';
import { ExposureScreen } from '@/screens/insurer/ExposureScreen';
import { IntegrityScreen } from '@/screens/insurer/IntegrityScreen';
import { LitigationScreen } from '@/screens/insurer/LitigationScreen';
import { PortfolioScreen } from '@/screens/insurer/PortfolioScreen';
import { navState } from '../nav';
import { renderScreen } from '../utils';

const asUnderwriter = () => mockApi({ method: 'POST', path: '/session/view-as', body: { view: 'underwriter' } });

const SCREENS: [string, React.ReactElement, string | RegExp][] = [
  ['Portfolio', <PortfolioScreen key="p" />, 'Meridian Benefits Agency'],
  ['Exposure Indicator', <ExposureScreen key="e" />, 'Six factors'],
  ['Data Integrity', <IntegrityScreen key="i" />, 'What the score rests on'],
  ['Risk Attestation', <AttestationScreen key="a" />, 'A. Frequency drivers'],
  ['Litigation Intelligence', <LitigationScreen key="t" />, 'What drives the filings'],
  ['Underwriting Export', <ExportScreen key="x" />, 'Attestation payload'],
];

describe('underwriter view', () => {
  it.each(SCREENS)('%s loads and uses no banned wording', async (title, ui, proof) => {
    asUnderwriter();
    const { container } = renderScreen(ui);
    expect(screen.getByRole('heading', { level: 1, name: title })).toBeInTheDocument();
    expect((await screen.findAllByText(proof)).length).toBeGreaterThan(0);
    expect(findBannedWords(container.textContent ?? '')).toEqual([]);
  });

  it('shows only insurer pages in the menu and blocks client pages', async () => {
    asUnderwriter();
    navState.pathname = '/actions';
    renderScreen(<PortalShell><p>client page</p></PortalShell>);
    const nav = await screen.findByRole('navigation', { name: 'Main' });
    expect(within(nav).getAllByRole('link').map((l) => l.textContent)).toEqual(['Portfolio', 'Exposure Indicator', 'Data Integrity', 'Risk Attestation', 'Litigation Intelligence', 'Underwriting Export', 'Rulebook', 'Regulatory Changes']);
    expect(screen.getByText('This page holds the client’s own records')).toBeInTheDocument();
    expect(screen.queryByText('client page')).not.toBeInTheDocument();
  });

  it('shows dollar figures to the underwriter on the attestation', async () => {
    asUnderwriter();
    renderScreen(<AttestationScreen />);
    expect(await screen.findByText('Theoretical statutory exposure, 12 months')).toBeInTheDocument();
  });
});

describe('owner view of what is shared with the insurer', () => {
  it('adds the three shared pages to the menu and blocks insurer-only pages', async () => {
    navState.pathname = '/portfolio';
    renderScreen(<PortalShell><p>insurer page</p></PortalShell>);
    const nav = await screen.findByRole('navigation', { name: 'Main' });
    expect(within(nav).getByText('Shared with your insurer')).toBeInTheDocument();
    expect(within(nav).getByRole('link', { name: 'Risk Attestation' })).toBeInTheDocument();
    expect(within(nav).queryByRole('link', { name: 'Portfolio' })).not.toBeInTheDocument();
    expect(screen.getByText('Only your insurer sees this page')).toBeInTheDocument();
  });

  it('shows the owner its own attestation without dollar figures', async () => {
    const { container } = renderScreen(<AttestationScreen />);
    expect(await screen.findByText('A. Frequency drivers')).toBeInTheDocument();
    expect(screen.queryByText('Theoretical statutory exposure, 12 months')).not.toBeInTheDocument();
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
    expect(container.textContent).not.toMatch(/\$\d/);
  });

  it('leaves the insurer’s estimates out of the owner’s export', async () => {
    renderScreen(<ExportScreen />);
    const pre = await screen.findByText(/civ\.attestation\.v1/);
    expect(pre.textContent).not.toMatch(/model_v0|exposure_indicator/);
  });
});

describe('view switch', () => {
  it('switches from owner to underwriter and goes to the portfolio', async () => {
    const user = userEvent.setup();
    renderScreen(<PortalShell><p>page body</p></PortalShell>);
    await user.click(await screen.findByRole('button', { name: 'Underwriter' }));
    await waitFor(() => expect(navState.push).toHaveBeenCalledWith('/portfolio'));
    expect(await screen.findByText('Falcon Risk · underwriting')).toBeInTheDocument();
    expect(screen.getByText('J. Merchant')).toBeInTheDocument();
  });
});
