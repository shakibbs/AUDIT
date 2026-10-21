import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { StatementForm } from '@/screens/insurer/StatementForm';
import { renderScreen } from '../utils';

describe('insured statements (Module 15 step 2)', () => {
  it('shows signed statements and the form to add one', async () => {
    renderScreen(<StatementForm rows={[{ id: 's1', topic: 'other', text: 'We train every agent.', signedBy: 'Dana Ruiz', signedOn: '2026-10-20', note: 'Info only: CiV cannot check this', conflict: null }]} />);
    expect(screen.getByText(/We train every agent/)).toBeInTheDocument();
    expect(screen.getByText(/Info only: CiV cannot check this/)).toBeInTheDocument();
    expect(await screen.findByLabelText('Add a statement')).toBeInTheDocument();
  });
});

describe('underwriting export in plain words (Module 15)', () => {
  it('shows the payload as labeled lines, not JSON', async () => {
    const { ExportScreen } = await import('@/screens/insurer/ExportScreen');
    renderScreen(<ExportScreen />);
    expect(await screen.findByText('Marketing contacts per month')).toBeInTheDocument();
    expect(screen.queryByText(/"schema"/)).not.toBeInTheDocument();
  });
});
