'use client';

import { useState } from 'react';
import { useSend, useSession } from '@/api/queries';
import { parseNumbers } from './BulkExport';

const MAX = 25;

/** After CiV accepts a litigation package request: the numbers it covers. They are turned into phone codes by the
 * backend and never stored; CiV makes the package and checks it before the client can download it. */
export function PackageNumbers() {
  const [text, setText] = useState('');
  const send = useSend<{ found: number; missing: number }>();
  const session = useSession().data;
  const canSend = Boolean(session && (session.role === 'admin' || session.isCounsel));
  const { numbers } = parseNumbers(text);
  const tooMany = numbers.length > MAX;
  if (!canSend) return <p className="tiny m-0">An Admin or your lawyer types the phone numbers here.</p>;
  return (
    <div className="flex flex-col gap-2">
      <label className="text-[12.5px] font-semibold" htmlFor="package-numbers">Type up to 25 phone numbers for your package</label>
      <textarea id="package-numbers" className="field mono min-h-[80px]" placeholder={'(480) 555-0923'} value={text}
        onChange={(e) => { setText(e.target.value); send.reset(); }} />
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" className="btn btn-primary btn-sm" disabled={numbers.length === 0 || tooMany || send.isPending}
          onClick={() => send.mutate({ method: 'POST', path: '/reports/litigation', body: { numbers } })}>Make the package</button>
        <span className="tiny" role="status">{tooMany ? `Up to ${MAX} numbers.` : `${numbers.length} ${numbers.length === 1 ? 'number' : 'numbers'} recognised · never stored`}</span>
      </div>
      {send.isError && <p className="tiny m-0 text-bad" role="alert">{send.error.message}</p>}
    </div>
  );
}
