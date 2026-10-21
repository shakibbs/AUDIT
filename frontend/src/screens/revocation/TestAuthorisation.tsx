import type { Revocation } from '@/api/types';
import { Card } from '@/components/ui/Card';
import { formatDate } from '@/lib/format';

/** How opt-outs are measured: from the client's real opt-outs in their own tools (no CiV test lines). */
export function TestAuthorisation({ revocation }: { revocation: Revocation }) {
  const a = revocation.authorisation;
  return (
    <Card title="Opt-out measurement" sub="Measured from your real opt-outs in your own tools">
      <dl className="m-0">
        <div className="kv"><dt>Signed</dt><dd>{formatDate(a.signedOn)}</dd></div>
        <div className="kv"><dt>Measurement window</dt><dd>{formatDate(a.windowFrom)} – {formatDate(a.windowTo)}</dd></div>
        <div className="kv"><dt>Channels</dt><dd>{a.channels.join(', ')}</dd></div>
        <div className="kv"><dt>Opt-outs measured</dt><dd className="mono">{revocation.tests} in {revocation.windowDays} days</dd></div>
      </dl>
    </Card>
  );
}
