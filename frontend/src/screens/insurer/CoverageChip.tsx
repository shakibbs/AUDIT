/** Evidence coverage, coloured against the 60% floor. */
export function CoverageChip({ value }: { value: number | null }) {
  if (value === null) return <span className="pill pill-gray">—</span>;
  const cls = value >= 0.75 ? 'pill-green' : value >= 0.6 ? 'pill-amber' : 'pill-red';
  return <span className={`pill ${cls}`}>{Math.round(value * 100)}%</span>;
}
