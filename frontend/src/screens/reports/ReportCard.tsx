'use client';

import { useState } from 'react';
import { useSend } from '@/api/queries';
import type { ReportRun, ReportType } from '@/api/types';
import { Icon } from '@/components/ui/Icon';
import { formatDate } from '@/lib/format';
import { PackageNumbers } from './PackageNumbers';

// Reports CiV can already make from real data: the file is downloaded straight away (the others are requested).
const READY_NOW: Record<string, (period: string) => string> = { rulebook: (period) => `/api/rulebook/snapshot?period=${monthId(period)}` };

/** "Sep 2026" → "2026-09" (the month the page is showing). */
function monthId(label: string): string {
  const d = new Date(`1 ${label} UTC`);
  return Number.isNaN(d.getTime()) ? '' : `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
}

// Made from the bulk evidence export below the cards (it needs the phone numbers): "Generate" takes the client there.
const FROM_BULK: Record<string, string> = {
  evidence: 'Paste the numbers in the bulk evidence export below, then press Export files.',
  certification: 'Paste the numbers in the bulk evidence export below, then press With certification pack.',
};

function toBulkExport() {
  const box = document.getElementById('bulk');
  box?.scrollIntoView?.({ behavior: 'smooth', block: 'center' });
  box?.focus({ preventScroll: true });
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
  const [note, setNote] = useState('');
  const quote = report.quote ?? null;
  const asked = quote?.at ?? report.requestedAt ?? (send.data as ReportRun | undefined)?.at ?? null;
  // An open request: asked, accepted (the client types the numbers) or checking (CiV checks the package).
  const requested = report.addOn && (Boolean(quote) || Boolean(report.requestedAt) || (send.isSuccess && !report.released));
  const step = quote?.step ?? 'asked';
  const label = !requested ? (report.addOn ? 'Request a quote' : send.isSuccess ? 'Requested' : 'Generate')
    : step === 'accepted' ? 'Accepted' : step === 'checking' ? 'Being checked' : 'Requested';
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
      <button type="button" className="btn btn-ghost btn-sm mt-auto self-start" disabled={send.isPending || requested || (send.isSuccess && !report.addOn)}
        onClick={() => {
          if (FROM_BULK[report.id]) {
            toBulkExport();
            setNote(FROM_BULK[report.id]);
            return;
          }
          // Reports the backend makes (period audit report, metric export) download once ready.
          send.mutate({ method: 'POST', path: '/reports', body: { name: report.name, period } }, {
            onSuccess: (made) => {
              const run = made as ReportRun | undefined;
              if (run?.url && !READY_NOW[report.id]) download(run.url, `${report.id}-${monthId(period)}.${report.format === 'CSV' ? 'csv' : 'pdf'}`);
            },
          });
          if (READY_NOW[report.id]) download(READY_NOW[report.id](period), `${report.id}-${monthId(period)}.pdf`);
        }}>
        <Icon name="download" size={14} /> {label}
      </button>
      {requested && step === 'asked' && <p className="tiny m-0" role="status">Requested on {formatDate(asked)}. CiV will contact you.</p>}
      {requested && step === 'accepted' && <><p className="tiny m-0" role="status">CiV accepted your request. Type the phone numbers below.</p><PackageNumbers /></>}
      {requested && step === 'checking' && <p className="tiny m-0" role="status">Package made on {formatDate(quote?.madeAt ?? null)} ({quote?.found ?? 0} found, {quote?.missing ?? 0} not found). CiV is checking it; you can download it here once it is released.</p>}
      {report.released && <p className="tiny m-0" role="status">Your package from {formatDate(report.released.at)} is ready. <a className="font-semibold" href={report.released.url} download>Download</a></p>}
      {note && <p className="tiny m-0" role="status">{note}</p>}
      {send.isError && <p className="tiny m-0 text-bad" role="alert">{send.error.message}</p>}
    </section>
  );
}
