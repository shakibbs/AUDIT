/** Small trend chart for stat cards: a soft area under a 2px line, with a dot on the latest value. */
export function AreaSparkline({ values, width = 120, height = 40, label }: { values: (number | null)[]; width?: number; height?: number; label: string }) {
  const nums = values.flatMap((v) => (v === null ? [] : [v]));
  if (nums.length < 2) return null;
  const lo = Math.min(...nums);
  const span = Math.max(...nums) - lo || 1;
  const pad = 5;
  const pts = values.flatMap((v, i) => (v === null ? [] : [[pad + (i / (values.length - 1)) * (width - pad * 2), pad + (1 - (v - lo) / span) * (height - pad * 2)] as const]));
  const line = pts.map(([x, y], k) => `${k === 0 ? 'M' : 'L'} ${x} ${y}`).join(' ');
  const [ex, ey] = pts[pts.length - 1];
  const area = `${line} L ${ex} ${height} L ${pts[0][0]} ${height} Z`;
  return (
    <svg width={width} height={height} role="img" aria-label={`${label}: ${nums.join(', ')}`} className="flex-none overflow-visible">
      <path d={area} fill="var(--series-1)" opacity="0.12" />
      <path d={line} fill="none" stroke="var(--series-1)" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={ex} cy={ey} r="3.5" fill="var(--series-1)" stroke="var(--surface)" strokeWidth="2" />
    </svg>
  );
}
