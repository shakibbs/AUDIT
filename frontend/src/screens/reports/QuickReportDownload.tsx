'use client';

/** One click for the month's Period audit report PDF (2026-10-23): CiV makes it if needed, or sends the latest one. */
export function QuickReportDownload({ period, label }: { period: string; label: string }) {
  if (!period) return null;
  return (
    <a className="btn btn-primary btn-sm no-underline hover:no-underline" href={`/api/reports/period?period=${encodeURIComponent(period)}`} download>
      Download the {label} audit report (PDF)
    </a>
  );
}
