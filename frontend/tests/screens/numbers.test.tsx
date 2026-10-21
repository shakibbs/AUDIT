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

describe('opt-outs card with real data', () => {
  it('says "Not checked yet" for the dialer until AI review exists', async () => {
    const { OptOutsTable } = await import('@/screens/revocation/OptOutsTable');
    renderScreen(<OptOutsTable optOuts={[{ id: 'oo-1', phoneDisplay: '(916) •••-0001', phoneE164: null, how: 'Text · keyword', words: 'STOP',
      at: '2026-10-01T16:00:00Z', deadline: '2026-10-16', businessDaysLeft: 8, deadlineProvisional: true, dialerMarked: null,
      contactsAfter: { count: 1, channel: 'Call', lastAt: '2026-10-03T15:00:00Z', afterDeadline: false } }]} />);
    expect(screen.getByText('Not checked yet')).toBeInTheDocument();
    expect(screen.getByText('8 business days left')).toBeInTheDocument();
    expect(screen.getByText(/1 call · before the deadline/)).toBeInTheDocument();
  });

  it('shows each tool, the urgent flag and an AI result not counted yet', async () => {
    const { OptOutsTable } = await import('@/screens/revocation/OptOutsTable');
    renderScreen(<OptOutsTable optOuts={[{ id: 'oo-2', phoneDisplay: '(916) •••-0002', phoneE164: null, how: 'Text · AI review', words: null,
      at: '2026-10-01T16:00:00Z', deadline: '2026-10-16', businessDaysLeft: 8, deadlineProvisional: true, dialerMarked: true, contactsAfter: null,
      tools: [{ name: 'Vicidial', marked: true, note: null }, { name: 'HubSpot', marked: false, note: null }], urgent: true, counted: false }]} />);
    expect(screen.getByText('Urgent: a tool has not marked it')).toBeInTheDocument();
    expect(screen.getByText('Vicidial: marked · HubSpot: not marked')).toBeInTheDocument();
    expect(screen.getByText('AI result · not counted in your score yet')).toBeInTheDocument();
  });

  it('filters: All, Open, Late and Contacted after STOP', async () => {
    const { OptOutsTable } = await import('@/screens/revocation/OptOutsTable');
    const base = { phoneE164: null, how: 'Text · keyword', words: 'STOP', at: '2026-10-01T16:00:00Z', deadline: '2026-10-16', deadlineProvisional: false };
    const contacted = (afterDeadline: boolean) => ({ count: 1, channel: 'Call', lastAt: '2026-10-20T15:00:00Z', afterDeadline });
    renderScreen(<OptOutsTable optOuts={[
      { ...base, id: 'open', phoneDisplay: '(916) •••-0001', businessDaysLeft: 4, dialerMarked: null, contactsAfter: null },
      { ...base, id: 'open-called', phoneDisplay: '(916) •••-0002', businessDaysLeft: 2, dialerMarked: true, contactsAfter: contacted(false) },
      { ...base, id: 'late-unmarked', phoneDisplay: '(916) •••-0003', businessDaysLeft: 0, dialerMarked: false, contactsAfter: null },
      { ...base, id: 'late-called', phoneDisplay: '(916) •••-0004', businessDaysLeft: 0, dialerMarked: true, contactsAfter: contacted(true) },
      { ...base, id: 'done', phoneDisplay: '(916) •••-0005', businessDaysLeft: 0, dialerMarked: true, contactsAfter: null },
    ]} />);
    const shown = () => screen.getAllByText(/\(916\) •••-000\d/).map((e) => e.textContent!.slice(-1)).join('');
    const user = userEvent.setup();
    expect(shown()).toBe('12345');
    await user.click(screen.getByRole('button', { name: 'Open' }));
    expect(shown()).toBe('12');
    await user.click(screen.getByRole('button', { name: 'Late' }));
    expect(shown()).toBe('34');
    await user.click(screen.getByRole('button', { name: 'Contacted after STOP' }));
    expect(shown()).toBe('24');
    await user.click(screen.getByRole('button', { name: 'All' }));
    expect(shown()).toBe('12345');
    expect(screen.getByRole('button', { name: 'All' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('says "Nothing here." when a filter has no rows', async () => {
    const { OptOutsTable } = await import('@/screens/revocation/OptOutsTable');
    renderScreen(<OptOutsTable optOuts={[{ id: 'o', phoneDisplay: '(916) •••-0009', phoneE164: null, how: 'Text · keyword', words: 'STOP',
      at: '2026-10-01T16:00:00Z', deadline: '2026-10-16', businessDaysLeft: 5, deadlineProvisional: false, dialerMarked: null, contactsAfter: null }]} />);
    await userEvent.setup().click(screen.getByRole('button', { name: 'Late' }));
    expect(screen.getByText('Nothing here.')).toBeInTheDocument();
  });

  it('says so when there are no opt-outs yet', async () => {
    const { OptOutsTable } = await import('@/screens/revocation/OptOutsTable');
    renderScreen(<OptOutsTable optOuts={[]} />);
    expect(screen.getByText('No opt-outs yet.')).toBeInTheDocument();
  });
});
