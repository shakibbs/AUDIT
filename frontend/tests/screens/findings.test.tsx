import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { Action } from '@/api/types';
import { ActionList } from '@/screens/actions/ActionList';
import { renderScreen } from '../utils';

const finding: Action = {
  id: 'f-1', rank: 1, severity: 'High', title: 'Contacts after an opt-out', why: 'CiV found 14 contacts (9 numbers) in September 2026.',
  domain: 'REV', owner: 'you', impact: '14 contacts', fixStep: '', assignee: null, due: null, overdue: false, status: 'open', dispute: null,
  metric: 'M10', examples: [{ label: '(480) •••-0923', ref: 'p-abc' }], since: '2026-09-03', reopened: true, resolvedOn: null,
};

describe('findings in the Action Queue (Module 11)', () => {
  it('shows the finding in plain words with its count and a "found again" mark', () => {
    renderScreen(<ActionList actions={[finding]} />);
    expect(screen.getByText('Contacts after an opt-out')).toBeInTheDocument();
    expect(screen.getByText('14 contacts')).toBeInTheDocument();
    expect(screen.getByText('Found again')).toBeInTheDocument();
  });
});
