import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SharingTab } from '@/screens/settings/SharingTab';
import { renderScreen } from '../utils';

describe('insurer sharing (Module 15 step 1)', () => {
  it('lets an Admin share by the underwriter\'s email', async () => {
    renderScreen(<SharingTab />);
    expect(await screen.findByLabelText("Underwriter's email")).toBeInTheDocument();
    expect(screen.getByLabelText('They are')).toBeInTheDocument();
    expect(await screen.findByText("You don't share with anyone.")).toBeInTheDocument();
  });
});
