import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ReportHistory } from '@/screens/reports/ReportHistory';
import { renderScreen } from '../utils';

describe('report history (Module 11 step 5)', () => {
  it('offers the download of a ready report and says when one is held back or not available yet', () => {
    renderScreen(<ReportHistory runs={[
      { id: 'rep-3', name: 'Period audit report', period: 'Sep 2026', requestedBy: 'CiV (automatic)', at: '2026-10-06T06:00:00Z', status: 'ready', url: '/api/reports/rep-3/file' },
      { id: 'rep-2', name: 'Period audit report', period: 'Aug 2026', requestedBy: 'Dana Reyes', at: '2026-09-06T06:00:00Z', status: 'blocked' },
      { id: 'rep-1', name: 'Metric export', period: 'Aug 2026', requestedBy: 'Dana Reyes', at: '2026-09-01T06:00:00Z', status: 'unavailable' },
    ]} />);
    expect(screen.getByRole('link', { name: 'Download' })).toHaveAttribute('href', '/api/reports/rep-3/file');
    expect(screen.getByText('Held for review')).toBeInTheDocument();
    expect(screen.getByText('Not available yet')).toBeInTheDocument();
  });
});
