/** A real insurer's page shows "Not measured" where CiV has no value yet, never a sample or a zero. */
export const NOT_MEASURED = 'Not measured';
export const shareOr = (v: number | null) => (v === null ? NOT_MEASURED : `${Math.round(v * 100)}%`);
export const countOr = (v: number | null) => (v === null ? NOT_MEASURED : v.toLocaleString('en-US'));
