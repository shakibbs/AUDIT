import type { CheckSource } from '@/api/types';
import { SOURCE_META } from '@/lib/whoContact';

/** Where a check's result came from. */
export function SourceChip({ source }: { source: CheckSource }) {
  return <span className={`pill ${SOURCE_META[source].pill}`}>{SOURCE_META[source].label}</span>;
}
