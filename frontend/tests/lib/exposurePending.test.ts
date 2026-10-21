import { describe, expect, it } from 'vitest';
import { exposureOf } from '@/lib/exposure';

describe('Exposure with pending factors (Module 10)', () => {
  it('leaves pending factors out and spreads their weight over the measured ones', () => {
    // F1 = 20 (weight 0.28) and F4 = 0 (0.16) measured: D = (20 × 0.28) / 0.44 = 12.7
    const e = exposureOf({ factors: [20, null, null, 0, null, null], venue: 1, targeting: 1, volume: 1, source: '' });
    expect(e.defect).toBe(13);
    expect(e.grade).toBe('A');
  });

  it('gives the same answer as before when every factor is measured', () => {
    const e = exposureOf({ factors: [50, 50, 25, 50, 50, 25], venue: 1.2, targeting: 1.1, volume: 1, source: '' });
    expect(e.defect).toBe(44);
    expect(e.exposure).toBe(58);
  });
});
