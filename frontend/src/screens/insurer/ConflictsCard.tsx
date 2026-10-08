import type { Insured } from '@/api/types';
import { Card } from '@/components/ui/Card';

/** Statements the company made that conflict with what CiV observed. Shown as they are, never softened. */
export function ConflictsCard({ insured }: { insured: Insured }) {
  return (
    <Card title="Statements that conflict with observation" sub="Shown to the insurer as they are" flush>
      {insured.conflicts.length === 0 ? <p className="m-0 px-[22px] pb-5 text-[13px] text-txt-2">None this period.</p> : insured.conflicts.map((c) => (
        <div key={c.stated} className="border-t border-line-2 px-[22px] py-3 first:border-t-0">
          <div className="tiny">Insured states</div>
          <div className="text-[13px] font-semibold">“{c.stated}”</div>
          <div className="tiny mt-2">CiV observed</div>
          <div className="text-[13px]">{c.observed}</div>
          <div className="mt-2 flex flex-wrap gap-1.5"><span className="pill pill-red">{c.treatment}</span><span className="flag">{c.ref}</span></div>
        </div>
      ))}
    </Card>
  );
}
