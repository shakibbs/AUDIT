import { describe, expect, it } from 'vitest';
import { overlay } from '@/server/backend';

describe('partly real pages', () => {
  it('real fields replace sample ones, everything else stays', () => {
    const sample = { company: { name: 'Sample Co', forum: '9th Circuit', states: ['TX'] }, notifications: [{ kind: 'a' }], usage: { plan: 'growth' } };
    const real = { company: { name: 'SunPath', states: ['CA'] } };
    expect(overlay(sample, real)).toEqual({ company: { name: 'SunPath', forum: '9th Circuit', states: ['CA'] }, notifications: [{ kind: 'a' }], usage: { plan: 'growth' } });
  });
});

describe('metric lists', () => {
  it('real metrics replace their sample by code; the rest keep the sample', () => {
    const sample = [{ code: 'M01', name: 'Consent Coverage', value: 88 }, { code: 'M16', name: 'Out-of-Hours Contacts', value: 490, unit: '' }];
    const real = [{ code: 'M16', value: 12, display: '2 · 10' }];
    expect(overlay(sample, real)).toEqual([{ code: 'M01', name: 'Consent Coverage', value: 88 }, { code: 'M16', name: 'Out-of-Hours Contacts', value: 12, unit: '', display: '2 · 10' }]);
  });
});

describe('named lists', () => {
  it('merges areas by id and checks by name, keeps checks not built yet, replaces lists with nothing in common', () => {
    const sample = { areas: [{ id: 'dnc', checks: [{ name: 'A', result: 'sample' }, { name: 'B', result: 'sample' }] }, { id: 'lit', checks: [{ name: 'L', result: 'sample' }] }],
      leadSources: [{ id: 'ls-a', name: 'Vendor A' }] };
    const real = { areas: [{ id: 'dnc', checks: [{ name: 'A', result: 'real' }] }], leadSources: [{ id: 'ls-9f', name: 'SolarLeads Inc' }] };
    expect(overlay(sample, real)).toEqual({ areas: [{ id: 'dnc', checks: [{ name: 'A', result: 'real' }, { name: 'B', result: 'sample' }] }, { id: 'lit', checks: [{ name: 'L', result: 'sample' }] }],
      leadSources: [{ id: 'ls-9f', name: 'SolarLeads Inc' }] });
  });
});
