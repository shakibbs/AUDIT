'use client';

import { useSend } from '@/api/queries';
import type { ReportType } from '@/api/types';
import { Icon } from '@/components/ui/Icon';

// Reports CiV can already make from real data: the file is downloaded straight away (the others are requested).
const READY_NOW: Record<string, (period: string) => string> = { rulebook: (period) => `/api/rulebook/snapshot?period=${monthId(period)}` };

/** "Sep 2026" → "2026-09" (the month the page is showing). */
function monthId(label: string): string {
  const d = new Date(`1 ${label} UTC`);
  return Number.isNaN(d.getTime()) ? '' : `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
}

function download(href: string, name: string) {
  const link = document.createElement('a');
  link.href = href;
  link.download = name;
  link.click();
}

/** One downloadable report type with a request button. */
export function ReportCard({ report, period }: { report: ReportType; period: string }) {
  const send = useSend();
  return (
    <section className="card card-pad flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <span className="grid h-10 w-10 flex-none place-items-center rounded-[10px] bg-brand-soft text-brand-ink"><Icon name="file" size={18} /></span>
        <span className={`pill ${report.addOn ? 'pill-amber' : 'pill-gray'}`}>{report.format}</span>
      </div>
      <div>
        <h3 className="text-[14.5px]">{report.name}</h3>
        <p className="mb-0 mt-1.5 text-[12.5px] text-txt-2">{report.description}</p>
      </div>
      <button type="button" className="btn btn-ghost btn-sm mt-auto self-start" disabled={send.isPending || send.isSuccess}
        onClick={() => {
          send.mutate({ method: 'POST', path: '/reports', body: { name: report.name, period } });
          if (READY_NOW[report.id]) download(READY_NOW[report.id](period), `${report.id}-${monthId(period)}.pdf`);
        }}>
        <Icon name="download" size={14} /> {send.isSuccess ? 'Requested' : report.addOn ? 'Request a quote' : 'Generate'}
      </button>
    </section>
  );
}
