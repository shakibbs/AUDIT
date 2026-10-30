'use client';

import { useVault } from '@/api/queries';
import { CoverageStrip } from '@/components/charts/CoverageStrip';
import { Card } from '@/components/ui/Card';
import { Kpi } from '@/components/ui/Kpi';
import { Loader } from '@/components/ui/Loader';
import { PageHead } from '@/components/ui/PageHead';
import { formatCount, formatDate, formatDateTime } from '@/lib/format';
import { LegalHolds } from './LegalHolds';
import { PositionLookup } from './PositionLookup';
import { VerifyFile } from './VerifyFile';
import { useMonth } from '@/state/PortalContext';

export function VaultScreen() {
  const vault = useVault(useMonth());
  return (
    <>
      <PageHead eyebrow="Evidence" title="Evidence Vault" sub="Fingerprints of what CiV saw, sealed into a daily anchor. Look up a number, verify a file, or place a hold." />
      <Loader query={vault}>
        {(v) => (
          <div className="flex flex-col gap-5">
            <div className="grid gap-4 sm:grid-cols-3">
              <Kpi tag="Records held" value={v.artifacts} foot={`${v.period ? `Read in ${v.period} · ` : ''}Each with a SHA-256 fingerprint`} />
              <Kpi tag="Daily anchors" value={formatCount(v.anchors)} foot={`${v.period ? `Sealed in ${v.period} · ` : ''}${v.lastAnchor ? `Last anchor ${formatDateTime(v.lastAnchor)} UTC` : 'No daily seal yet'}`} info="Once a day, the fingerprints of every new record are combined into one value and sealed. Any later change to a record would no longer match its anchor." />
              <Kpi tag="Deleted under retention" value={formatCount(v.deletedUnderRetention)} foot="Past their retention date and not under a hold" />
            </div>
            <Card title="Coverage" sub={`Which months the record covers · engagement began ${formatDate(v.engagedSince)}`}>
              <CoverageStrip coverage={v.coverage} />
            </Card>
            <PositionLookup />
            <VerifyFile />
            <LegalHolds />
          </div>
        )}
      </Loader>
    </>
  );
}
