import type { Insured } from '@/api/types';

/** Loss model v0 parameters. A hypothesis until the litigation study and claims data calibrate them. */
export interface ModelParams {
  base: [number, number][];         // [contacts per month below, annual chance of a suit]
  classShare: number; individualCost: number; classDefense: number;
  classSettlement: [number, number][]; loading: number;
}

export const MODEL_V0: ModelParams = {
  base: [[10000, 0.04], [50000, 0.09], [250000, 0.18], [Infinity, 0.35]],
  classShare: 0.6, individualCost: 45000, classDefense: 400000,
  classSettlement: [[10000, 350000], [50000, 900000], [250000, 2200000], [Infinity, 6600000]],
  loading: 1.6,
};

// Values used when a field is not verified (worst case, v3 §5b).
const WORST: { field: keyof Insured; value: number; label: string }[] = [
  { field: 'consentProof', value: 0.6, label: 'consent proof 60%' },
  { field: 'purchasedShare', value: 0.6, label: 'purchased-lead share 60%' },
  { field: 'prerecordedShare', value: 0.2, label: 'prerecorded or AI voice share 20%' },
  { field: 'optOutFailShare', value: 0.1, label: 'opt-outs not honored 10%' },
  { field: 'internalListContacts', value: 1, label: 'internal-list contacts present' },
  { field: 'litigatorContacts', value: 1, label: 'litigator contacts present' },
];

const band = (v: number, table: [number, number][]) => (table.find(([max]) => v < max) ?? table[table.length - 1])[1];

export interface LossResult { chance: number; costIfSued: number; expectedLoss: number; premium: [number, number]; steps: string[]; worstCaseFields: number }

/** Expected annual loss = chance of a suit in 12 months × expected cost if sued. Factors multiply the odds, so the chance stays under 100%. */
export function lossModel(insured: Insured, m: ModelParams = MODEL_V0): LossResult {
  const steps: string[] = [];
  const v = { ...insured } as Insured & Record<string, number | null>;
  let worstCaseFields = 0;
  for (const w of WORST) {
    if (v[w.field] == null) { (v as Record<string, unknown>)[w.field] = w.value; worstCaseFields += 1; steps.push(`Not verified, worst case used: ${w.label}`); }
  }
  const p0 = band(v.contactsPerMonth, m.base);
  let odds = p0 / (1 - p0);
  steps.push(`Base chance for ${v.contactsPerMonth.toLocaleString('en-US')} marketing contacts a month: ${(p0 * 100).toFixed(0)}%`);
  const apply = (when: boolean, x: number, why: string) => { if (when) { odds *= x; steps.push(`odds × ${x}: ${why}`); } };
  const consent = v.consentProof as number;
  apply(consent < 0.7, 1.8, 'consent proof under 70%');
  apply(consent >= 0.7 && consent < 0.9, 1.2, 'consent proof 70–90%');
  apply(consent >= 0.9, 0.8, 'consent proof 90% or better');
  const purchased = v.purchasedShare as number;
  apply(purchased > 0.5, 1.5, 'over half of contacts from purchased leads');
  apply(purchased > 0.2 && purchased <= 0.5, 1.25, '20–50% purchased leads');
  apply((v.prerecordedShare as number) > 0.1, 1.3, 'prerecorded or AI voice over 10%');
  apply((v.optOutFailShare as number) > 0, 1.5, 'opt-outs not honored by the deadline');
  apply((v.internalListContacts as number) > 0, 1.3, 'contacts after an internal-list entry');
  apply((v.litigatorContacts as number) > 0, 1.3, 'contacts to known litigator numbers');
  const prior = Math.max(v.priorStated, v.priorDocket);
  apply(prior > 0, Math.min(2, 1 + 0.25 * prior), `${prior} prior matter(s) in 3 years${v.priorDocket > v.priorStated ? ' (dockets, higher than stated)' : ''}`);
  apply(v.praStates >= 2, 1.2, 'two or more states that allow private suits');
  apply(v.monitoring === 'Live', 0.75, 'independent monitoring in place');
  apply(v.coverage < 0.6, 1.4, 'evidence coverage under 60%');
  apply(v.completeness != null && v.completeness < 0.9, 1.3, 'records incomplete against invoices');
  const chance = odds / (1 + odds);
  steps.push(`Chance of a suit = odds ÷ (1 + odds) = ${(chance * 100).toFixed(1)}%`);
  const costIfSued = (1 - m.classShare) * m.individualCost + m.classShare * (m.classDefense + band(v.contactsPerMonth, m.classSettlement));
  const expectedLoss = chance * costIfSued;
  return { chance, costIfSued, expectedLoss, premium: [expectedLoss * m.loading * 0.8, expectedLoss * m.loading * 1.2], steps, worstCaseFields };
}

export const money = (v: number) => `$${Math.round(v).toLocaleString('en-US')}`;
