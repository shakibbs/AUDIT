import { ViewSwitch } from '@/components/shell/ViewSwitch';
import { ReportsScreen } from '@/screens/reports/ReportsScreen';
import { SimpleReportsScreen } from '@/screens/simple/SimpleReportsScreen';

export default function Page() {
  return <ViewSwitch simple={<SimpleReportsScreen />} full={<ReportsScreen />} />;
}
