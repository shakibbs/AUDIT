import { AdminOnly } from '@/components/ui/AdminOnly';
import { SettingsScreen } from '@/screens/settings/SettingsScreen';

export default function Page() {
  return <AdminOnly><SettingsScreen /></AdminOnly>;
}
