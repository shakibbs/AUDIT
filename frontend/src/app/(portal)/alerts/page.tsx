import { ViewSwitch } from '@/components/shell/ViewSwitch';
import { AlertsScreen } from '@/screens/alerts/AlertsScreen';
import { SimpleAlertsScreen } from '@/screens/simple/SimpleAlertsScreen';

export default function Page() {
  return <ViewSwitch simple={<SimpleAlertsScreen />} full={<AlertsScreen />} />;
}
