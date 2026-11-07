import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ContactTable } from '@/screens/ledger/ContactTable';
import { contacts } from '@fixtures/data/evidence';
import { renderScreen } from '../utils';

describe('clock-change note (owner 2026-11-07)', () => {
  it('shows a clock with the note next to a call in the clock-change hour, and nothing on other calls', () => {
    const note = 'Clock-change hour: could be 1 hour later';
    renderScreen(<ContactTable contacts={[{ ...contacts[0], timeNote: note }, { ...contacts[1], id: 'other', timeNote: null }]} />);
    expect(screen.getAllByLabelText(note)).toHaveLength(1);
  });
});
