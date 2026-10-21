'use client';

import { useProofRequests } from '@/api/queries';
import { Card } from '@/components/ui/Card';
import { Empty } from '@/components/ui/Empty';
import { Loader } from '@/components/ui/Loader';
import { ProofRequestRow } from './ProofRequestRow';

/** Numbers from uploaded lists CiV asks you to prove: a fixed sample per list. Attach proof or say you have none
 * within 30 days. CiV keeps the file privately and checks it; until then those calls stay "Weak". */
export function ProofRequestsCard() {
  const requests = useProofRequests();
  return (
    <Loader query={requests}>
      {(data) => (
        <Card title="Proof requests" sub="A sample of numbers from each uploaded list with no evidence. Answer within 30 days; CiV checks every file." flush>
          {data.requests.length === 0 ? <Empty>No proof requests.</Empty> : (
            <div className="overflow-x-auto">
              <table className="tbl">
                <thead><tr><th>Number</th><th>List</th><th>State</th><th>Your answer</th></tr></thead>
                <tbody>{data.requests.map((r) => <ProofRequestRow key={r.id} request={r} canAnswer={data.canAnswer} />)}</tbody>
              </table>
            </div>
          )}
          <p className="tiny mx-[22px] mb-4 mt-3">CiV keeps the files you attach privately, logs every time one is opened, and deletes them after 4 years.</p>
        </Card>
      )}
    </Loader>
  );
}
