'use client';

import { useActions } from '@/api/queries';
import { SeeFullDetails } from '@/components/shell/SeeFullDetails';
import { Card } from '@/components/ui/Card';
import { Empty } from '@/components/ui/Empty';
import { Loader } from '@/components/ui/Loader';
import { PageHead } from '@/components/ui/PageHead';
import { formatDate } from '@/lib/format';
import { useDrawer } from '@/state/DrawerContext';
import { SEVERITY_WORD } from './plainWords';

/** Simple view: the five most important open problems, in plain words. */
export function SimpleFixScreen() {
  const actions = useActions();
  const { open } = useDrawer();
  return (
    <>
      <PageHead eyebrow="Simple view" title="Things to fix" sub="The five most important open problems, most urgent first.">
        <SeeFullDetails href="/actions" label="See the full list" />
      </PageHead>
      <Loader query={actions}>
        {(list) => {
          const top = list.filter((a) => a.status !== 'resolved').sort((a, b) => a.rank - b.rank).slice(0, 5);
          return (
            <Card title="Top 5" sub={`${list.filter((a) => a.status !== 'resolved').length} open in all`} flush>
              {top.length === 0 ? <Empty>Nothing open. Well done.</Empty> : top.map((a, i) => (
                <button key={a.id} type="button" className="row-item !items-start" onClick={() => open('action', a.id)}>
                  <span className="rank">{i + 1}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[14.5px] font-semibold">{a.title}</span>
                    <span className="mt-1 block text-[13px] text-txt-2">{a.why}</span>
                    <span className="tiny mt-1.5 block">{a.assignee ? `Assigned to ${a.assignee}` : 'Nobody assigned yet'}{a.due ? ` · due ${formatDate(a.due)}` : ''}{a.overdue ? ' · overdue' : ''}</span>
                  </span>
                  <span className={`pill ${SEVERITY_WORD[a.severity].pill}`}>{SEVERITY_WORD[a.severity].label}</span>
                </button>
              ))}
            </Card>
          );
        }}
      </Loader>
    </>
  );
}
