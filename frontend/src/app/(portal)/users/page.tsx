import { AdminOnly } from '@/components/ui/AdminOnly';
import { UsersScreen } from '@/screens/users/UsersScreen';

export default function Page() {
  return <AdminOnly><UsersScreen /></AdminOnly>;
}
