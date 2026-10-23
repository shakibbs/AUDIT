import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { Session } from '@/api/types';
import { Banners } from '@/components/shell/Banners';
import { session } from '@fixtures/data/session';
import { renderScreen } from '../utils';

describe('month banners (Module 10)', () => {
  it('says when the month shown was revised after it was locked', () => {
    const revised: Session = { ...session, periods: [{ id: '2026-10', label: 'Oct 2026', revisedOn: '2026-11-08' }, ...session.periods] };
    renderScreen(<Banners session={revised} />);
    expect(screen.getByText(/This month was revised on/)).toBeInTheDocument();
  });

  it('says nothing for a month that was never revised', () => {
    renderScreen(<Banners session={session} />);
    expect(screen.queryByText(/revised on/)).not.toBeInTheDocument();
  });
});
