'use client';

import { useState } from 'react';
import { apiGet } from '@/api/client';
import type { HashCheck } from '@/api/types';
import { Card } from '@/components/ui/Card';
import { formatDate } from '@/lib/format';

async function sha256(file: File): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', await file.arrayBuffer());
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('');
}

/** Is this file exactly one CiV holds or made? Its fingerprint is worked out in the browser; the file is never sent. */
export function VerifyFile() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<(HashCheck & { hash: string }) | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  async function check() {
    if (!file) return;
    setBusy(true);
    setError('');
    setResult(null);
    try {
      const hash = await sha256(file);
      setResult({ ...(await apiGet<HashCheck>('/hash-check', { hash })), hash });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'The file could not be checked.');
    } finally {
      setBusy(false);
    }
  }
  return (
    <Card title="Verify a file" sub="Is this file exactly the one CiV holds or made? Only its fingerprint is sent, never the file">
      <div className="flex flex-wrap items-end gap-3">
        <div><label className="label" htmlFor="vf-file">File</label><input id="vf-file" type="file" className="field !w-[320px]" onChange={(e) => { setFile(e.target.files?.[0] ?? null); setResult(null); }} /></div>
        <button type="button" className="btn btn-primary" disabled={!file || busy} onClick={check}>{busy ? 'Checking…' : 'Verify'}</button>
      </div>
      {result && (result.found ? (
        <p className="m-0 mt-4 text-[13px]" role="status"><span className="pill pill-green mr-2">Matches</span>
          This is exactly {result.artifact}{result.capturedAt ? `, from ${formatDate(result.capturedAt)}` : ''}{result.anchoredOn ? `, sealed on ${formatDate(result.anchoredOn)}` : ''}. Nobody changed it.</p>
      ) : (
        <p className="m-0 mt-4 text-[13px]" role="status"><span className="pill pill-red mr-2">No match</span>
          This file was changed after CiV made it, or it is not a file CiV holds for your company.</p>
      ))}
      {result && <p className="tiny mb-0 mt-2 mono break-all">SHA-256 {result.hash}</p>}
      {error && <p className="tiny m-0 mt-2 text-bad">{error}</p>}
    </Card>
  );
}
