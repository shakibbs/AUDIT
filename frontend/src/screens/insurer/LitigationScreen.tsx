'use client';

import { useLitigation } from '@/api/queries';
import { Columns } from '@/components/charts/Columns';
import { Card } from '@/components/ui/Card';
import { Loader } from '@/components/ui/Loader';
import { PageHead } from '@/components/ui/PageHead';

const STATUS_PILL = { Verified: 'pill-teal', Estimate: 'pill-amber', Statute: 'pill-blue' } as const;

/** What the filings say, what they cost, and what the litigation study will measure. */
export function LitigationScreen() {
  const data = useLitigation();
  return (
    <>
      <PageHead eyebrow="Falcon Risk · underwriting" title="Litigation Intelligence" sub="What the filings say, what they cost, and what is not yet known. Every figure carries its source and status." />
      <Loader query={data}>
        {(d) => (
          <div className="flex flex-col gap-5">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {d.headline.map((h) => (
                <div key={h.label} className="card kpi">
                  <span className="kpi-tag">{h.label}</span>
                  <span className="kpi-val">{h.value}</span>
                  <span className="kpi-foot">{h.note}</span>
                  <span className="flex flex-wrap items-center gap-2"><span className={`pill ${STATUS_PILL[h.status]}`}>{h.status}</span>{h.url ? <a href={h.url} target="_blank" rel="noreferrer" className="text-[12px]">{h.source}</a> : <span className="tiny">{h.source}</span>}</span>
                </div>
              ))}
            </div>
            <div className="grid gap-5 lg:grid-cols-2">
              <Card title="Class actions filed in February, by year" sub="Class filings have about quadrupled in three years">
                <Columns label="Class actions filed in February" height={170} columns={d.classByYear.map((c, k) => ({ label: c.label, value: c.count, display: `${c.count} filings`, flagged: k === d.classByYear.length - 1 }))} />
                <p className="tiny mb-0 mt-3">Source: TCPAWorld, 7 Apr 2026. The latest year is drawn in a second colour.</p>
              </Card>
              <Card title="What a suit costs">
                <dl className="m-0">
                  {d.costs.map((c) => <div key={c.label} className="kv"><dt>{c.label}</dt><dd className="max-w-[60%] font-normal">{c.value} <span className={`pill ml-1 ${STATUS_PILL[c.status]}`}>{c.status}</span></dd></div>)}
                </dl>
              </Card>
            </div>
            <Card title="What drives the filings" sub="The claim types the study will measure. Shares and costs are blank on purpose until the study publishes" flush>
              <div className="overflow-x-auto">
                <table className="tbl">
                  <thead><tr><th>Claim type</th><th>Legal hook</th><th>Direction since 2024</th><th>Share of filings</th><th>Median cost</th></tr></thead>
                  <tbody>{d.claimTypes.map((c) => <tr key={c.type}><td className="font-semibold">{c.type}</td><td className="mono text-[11.5px]">{c.hook}</td><td className="tiny">{c.direction}</td><td><span className="pill pill-gray">Study output</span></td><td><span className="pill pill-gray">Study output</span></td></tr>)}</tbody>
                </table>
              </div>
            </Card>
            <Card title="The litigation study: how it gets built" sub="Produces the base rates and cost tables the loss model needs (decision D29)" flush>
              <div className="overflow-x-auto">
                <table className="tbl">
                  <thead><tr><th>Step</th><th>How</th><th>Cost and time</th></tr></thead>
                  <tbody>{d.study.map((s) => <tr key={s.step}><td className="font-semibold whitespace-nowrap">{s.step}</td><td className="text-[12.5px]">{s.how}</td><td className="tiny">{s.cost}</td></tr>)}</tbody>
                </table>
              </div>
              <p className="tiny m-0 px-[22px] py-3">The first edition covers federal filings only; state-court suits (Florida, Texas, Washington) come later.</p>
            </Card>
          </div>
        )}
      </Loader>
    </>
  );
}
