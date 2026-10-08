import { ViewSwitch } from '@/components/shell/ViewSwitch';
import { ActionsScreen } from '@/screens/actions/ActionsScreen';
import { SimpleFixScreen } from '@/screens/simple/SimpleFixScreen';

export default function Page() {
  return <ViewSwitch simple={<SimpleFixScreen />} full={<ActionsScreen />} />;
}
