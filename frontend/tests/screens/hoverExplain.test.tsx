import { act, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ExplainHost } from '@/components/shell/ExplainHost';
import { Kpi } from '@/components/ui/Kpi';
import { explanationFor } from '@/lib/explain';

vi.mock('next/navigation', () => ({ usePathname: () => '/vault' }));

function pointer(type: string, target: Element, pointerType = 'mouse') {
  const event = new Event(type, { bubbles: true });
  Object.defineProperty(event, 'pointerType', { value: pointerType });
  target.dispatchEvent(event);
}

afterEach(() => vi.useRealTimers());

describe('hover to explain (owner 2026-11-13)', () => {
  it('finds the words for a title on its page, a shared title on every page, and titles that change with the data', () => {
    expect(explanationFor('/vault', 'Records held')).toMatch(/fingerprint/);
    expect(explanationFor('/scorecard', 'Audit Score')).toMatch(/A 90–100/);
    expect(explanationFor('/leads', 'Untraced in October 2026 · 2')).toMatch(/no source/);
    expect(explanationFor('/vault', 'Something unknown')).toBeUndefined();
  });

  it('underlines a title with an explanation and shows it after the mouse rests half a second', () => {
    vi.useFakeTimers();
    render(<main><Kpi tag="Records held" value="1,204" /><ExplainHost /></main>);
    const tag = screen.getByText('Records held');
    expect(tag).toHaveClass('has-explain');
    pointer('pointerover', tag);
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();  // not at once: passing over shows nothing
    act(() => { vi.advanceTimersByTime(600); });
    expect(screen.getByRole('tooltip')).toHaveTextContent(/read from your tools/);
    act(() => { document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' })); });
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('opens with a tap on the title on a phone', () => {
    render(<main><Kpi tag="Records held" value="1,204" /><ExplainHost /></main>);
    act(() => { pointer('pointerdown', screen.getByText('Records held'), 'touch'); });
    expect(screen.getByRole('tooltip')).toBeInTheDocument();
    act(() => { pointer('pointerdown', document.body, 'touch'); });
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });
});

describe('big cards are explained only from their title (owner 2026-11-16)', () => {
  it('shows the card explanation on its heading, not from the boxes inside it', async () => {
    vi.useFakeTimers();
    const { Card } = await import('@/components/ui/Card');
    render(<main><Card title="Legal holds" sub="Records under a hold"><p>Inside the card</p></Card><ExplainHost /></main>);
    pointer('pointerover', screen.getByText('Inside the card'));
    act(() => { vi.advanceTimersByTime(600); });
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    pointer('pointerover', screen.getByText('Legal holds'));
    act(() => { vi.advanceTimersByTime(600); });
    expect(screen.getByRole('tooltip')).toHaveTextContent(/Stop files being deleted/);
  });
});

describe('each of the six factors explains itself (owner 2026-11-16)', () => {
  it('a factor box shows what its factor means, its measurements and its law', async () => {
    vi.useFakeTimers();
    const { FactorTile } = await import('@/screens/scorecard/FactorTile');
    render(<main><FactorTile code="F3" name="Revocation and opt-out" law="47 C.F.R. §64.1200(a)(10)" value={12} grade="A" weight={0.17} metrics={['M08', 'M10']} known={new Set(['M08'])} /><ExplainHost /></main>);
    expect(screen.getByText('Revocation and opt-out')).toHaveClass('has-explain');
    pointer('pointerover', screen.getByText('weight 17%'));  // anywhere on the box
    act(() => { vi.advanceTimersByTime(600); });
    expect(screen.getByRole('tooltip')).toHaveTextContent(/says stop[^]*M10[^]*Law: 47 C\.F\.R\. §64\.1200\(a\)\(10\)/);
  });

  it('the same words on the Overview and Exposure tables, where the name starts with its code', () => {
    expect(explanationFor('/', 'F1 Consent defensibility')).toMatch(/agreed to it/);
    expect(explanationFor('/exposure', 'F6 Call integrity')).toMatch(/caller IDs/);
  });
});
