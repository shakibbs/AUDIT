import type { ExposureReading, Grade } from '@/api/types';

/** Exposure Indicator v2.2: six factor weights (sum 1). */
export const FACTOR_WEIGHTS = [0.28, 0.2, 0.17, 0.16, 0.11, 0.08];
export const FACTOR_NAMES = ['F1 Consent defensibility', 'F2 Suppression integrity', 'F3 Revocation and opt-out', 'F4 Calling conduct', 'F5 Vendor and lead provenance', 'F6 Call integrity'];
export const FACTOR_LAW = ['47 U.S.C. §227(b); 47 C.F.R. §64.1200(f)(9)', '47 C.F.R. §64.1200(c)(2), (d)(3)', '47 C.F.R. §64.1200(a)(10)', '47 C.F.R. §64.1200(c)(1); state hours and caps', 'FCC 13-54 (DISH Network)', '47 C.F.R. §64.6301; §64.1601(e)'];

/** Higher = more exposed. A under 25 · B 25–39 · C 40–48 · D 49–66 · F 67+. */
export const exposureGrade = (x: number): Grade => (x < 25 ? 'A' : x < 40 ? 'B' : x < 49 ? 'C' : x < 67 ? 'D' : 'F');

export interface ExposureResult { defect: number; multiplier: number; raw: number; exposure: number; grade: Grade; capped: boolean }

/** Exposure = min(100, D × venue × targeting × volume), where D is the weighted sum of the six factors. */
export function exposureOf(r: ExposureReading): ExposureResult {
  const defect = r.factors.reduce((sum, f, k) => sum + f * FACTOR_WEIGHTS[k], 0);
  const multiplier = r.venue * r.targeting * r.volume;
  const raw = defect * multiplier;
  const exposure = Math.min(100, raw);
  return { defect: Math.round(defect), multiplier, raw: Math.round(raw), exposure: Math.round(exposure), grade: exposureGrade(exposure), capped: raw > 100 };
}
