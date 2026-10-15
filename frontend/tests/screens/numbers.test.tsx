import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import type { CallingWindow } from '@/api/types';
import { StatusChip } from '@/components/ui/StatusChip';
import { CallingWindowCard } from '@/screens/evidence/CallingWindowCard';
import { OwnersCard } from '@/screens/evidence/OwnersCard';
import { CanCallBox } from '@/screens/rulebook/CanCallBox';
import { renderScreen } from '../utils';

const WINDOW: CallingWindow = {
  verdict: 'ok', hours: '8am – 9pm', status: 'tbd', draft: true, place: 'Federal', holidays: 'State holiday restrictions: not set yet (counsel item A8)',
  zones: [{ zone: 'America/Los_Angeles', localTime: 'Wed 5:30 PM', allowed: true }], note: 'Draft hours: not confirmed by a lawyer yet.',
};

describe('number page and "Can I call now?"', () => {
  it('shows "Not checked yet", never a worst-case status', () => {
    render(<StatusChip status="NOT_CHECKED" />);
    expect(screen.getByText('Not checked yet')).toBeInTheDocument();
  });

  it('shows the calling window in the person\'s own time', () => {
    render(<CallingWindowCard window={WINDOW} where="CA · Los Angeles" confidence="medium" />);
    expect(screen.getByText('OK to call now')).toBeInTheDocument();
    expect(screen.getByText('8am – 9pm')).toBeInTheDocument();
    expect(screen.getByText(/Wed 5:30 PM/)).toBeInTheDocument();
    expect(screen.getByText(/not confirmed by a lawyer/)).toBeInTheDocument();
  });

  it('lists the owners of the number', () => {
    render(<OwnersCard epochs={[{ number: 1, from: null, to: '2026-08-01T00:00:00Z', reason: 'First time CiV saw the number' },
      { number: 2, from: '2026-08-01T00:00:00Z', to: null, reason: 'The number moved to another customer record in the CRM' }]} />);
    expect(screen.getByText('Owner 2')).toBeInTheDocument();
    expect(screen.getByText(/moved to another customer record/)).toBeInTheDocument();
  });

  it('answers "Can I call now?" with the stricter time zone', async () => {
    const user = userEvent.setup();
    renderScreen(<CanCallBox />);
    await user.type(screen.getByLabelText('Phone number'), '(850) 555-0102');
    await user.click(screen.getByRole('button', { name: 'Check' }));
    expect(await screen.findByText('Not safe now')).toBeInTheDocument();
    expect(screen.getByText(/stricter one decides/)).toBeInTheDocument();
    expect(within(screen.getByText(/New York/).parentElement!).getByText(/outside/)).toBeInTheDocument();
  });
});
