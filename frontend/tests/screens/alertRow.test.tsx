import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { alerts } from '@fixtures/data/work';
import { AlertRow } from '@/screens/alerts/AlertRow';
import { renderScreen } from '../utils';

describe('alerts (Module 11 step 3)', () => {
  it('shows when an alert resolved by itself and who reviewed it', () => {
    renderScreen(<AlertRow alert={{ ...alerts[4], reviewed: true, resolved: true, reviewedBy: 'Dana Reyes' }} />);
    expect(screen.getByText('Resolved')).toBeInTheDocument();
    expect(screen.getByText('Reviewed by Dana Reyes')).toBeInTheDocument();
  });
});
