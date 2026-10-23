'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { apiUpload } from '@/api/client';
import type { VendorContract } from '@/api/types';

export interface ContractFields { vendor: string; file: File; endsOn: string; disputeDays: string }

/** The one way both contract forms (the page card and the vendor panel) upload a vendor contract (2026-10-23).
 * Each form keeps its own fields and messages; this sends the file and refreshes the pages. */
export function useContractUpload() {
  const client = useQueryClient();
  const [busy, setBusy] = useState(false);
  async function upload({ vendor, file, endsOn, disputeDays }: ContractFields): Promise<VendorContract> {
    const form = new FormData();
    form.append('vendor', vendor.trim());
    form.append('file', file);
    if (endsOn) form.append('endsOn', endsOn);
    if (disputeDays) form.append('disputeDays', disputeDays);
    setBusy(true);
    try {
      const saved = await apiUpload<VendorContract>('/vendor-contracts', form);
      await client.invalidateQueries();
      return saved;
    } finally {
      setBusy(false);
    }
  }
  return { busy, upload };
}
