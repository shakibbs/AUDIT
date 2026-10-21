import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { score } from '@/mock/data/domains';
import { ScoreCard } from '@/screens/overview/ScoreCard';

describe('Audit Score labels (Module 10)', () => {
  it('says when the score is partial and the bands are drafts', () => {
    render(<ScoreCard score={{ ...score, partial: { factorsMeasured: 3, factors: 6 }, draftBands: true }} />);
    expect(screen.getByText('Partial: 3 of 6 factors measured · Draft bands')).toBeInTheDocument();
  });

  it('adds nothing to the sample score', () => {
    render(<ScoreCard score={score} />);
    expect(screen.queryByText(/Draft bands/)).not.toBeInTheDocument();
  });
});
