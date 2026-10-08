import { ViewSwitch } from '@/components/shell/ViewSwitch';
import { OverviewScreen } from '@/screens/overview/OverviewScreen';
import { SimpleHomeScreen } from '@/screens/simple/SimpleHomeScreen';

export default function Page() {
  return <ViewSwitch simple={<SimpleHomeScreen />} full={<OverviewScreen />} />;
}
