import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { DataHealth } from '@/api/types';
import { DataHealthCard } from '@/screens/overview/DataHealthCard';
import { KeyNumbers } from '@/screens/overview/KeyNumbers';
import { renderScreen } from '../utils';

// What Django sends before anything is read and before Modules 5 and 9 exist.
const EMPTY: DataHealth = {
  accessLevel: 0, accessLabel: 'Level 0 · nothing connected yet', lastChangeAt: null,
  sources: { live: 0, stale: 0, notSupplied: 5, total: 5 }, recordsCompleteness: null, completenessFloor: 0.9, conversationReview: null,
};

describe('data health before anything is measured', () => {
  it('says "Nothing read yet" instead of a date', () => {
    render(<DataHealthCard health={EMPTY} />);
    expect(screen.getByText('Nothing read yet')).toBeInTheDocument();
    expect(screen.getByText('Level 0')).toBeInTheDocument();
  });

  it('shows "Not yet measured", never a worst-case number', () => {
    renderScreen(<KeyNumbers metrics={[]} health={EMPTY} since="Sep 2026" />);
    expect(screen.getAllByText('Not yet measured')).toHaveLength(2);
    expect(screen.queryByText('0%')).not.toBeInTheDocument();
  });
});
