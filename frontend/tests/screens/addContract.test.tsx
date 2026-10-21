import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { AddContractCard } from '@/screens/vendors/AddContractCard';
import { renderScreen } from '../utils';

describe('adding a vendor contract (Module 12)', () => {
  it('offers the vendors found and a form any Admin can use', async () => {
    renderScreen(<AddContractCard vendorNames={['SolarLeads Inc', 'Vendor E']} />);
    expect(await screen.findByLabelText('Vendor')).toBeInTheDocument();
    expect(screen.getByLabelText('Contract file')).toBeInTheDocument();
    expect(screen.getByLabelText('Days to return a bad lead')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add contract' })).toBeDisabled();
    expect(document.querySelectorAll('#ac-vendors option')).toHaveLength(2);
  });
});
