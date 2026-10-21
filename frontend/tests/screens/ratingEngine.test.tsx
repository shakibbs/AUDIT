import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { mockApi } from '@/mock/api';
import { ExportScreen } from '@/screens/insurer/ExportScreen';
import { renderScreen } from '../utils';

describe('rating engine (Module 15)', () => {
  it('the insurer saves its address and key, then sends the sheet', async () => {
    mockApi({ method: 'POST', path: '/session/view-as', body: { view: 'underwriter' } });
    const user = userEvent.setup();
    renderScreen(<ExportScreen />);
    await user.click(await screen.findByRole('button', { name: 'Send to rating engine' }));
    expect(await screen.findByText('Add your rating engine address and key first.')).toBeInTheDocument();
    await user.type(screen.getByLabelText('Address (https)'), 'https://rating.falconrisk.example/civ');
    await user.type(screen.getByLabelText('Key'), 'secret-7781');
    await user.click(screen.getByRole('button', { name: 'Save' }));
    expect(await screen.findByPlaceholderText(/ends in 7781/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Send to rating engine' }));
    expect(await screen.findByText(/Accepted by the rating engine \(sample\) · logged/)).toBeInTheDocument();
  });
});
