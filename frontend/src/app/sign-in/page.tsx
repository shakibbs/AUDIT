import { modeFromLink } from '@/screens/signin/mode';
import { SignInScreen } from '@/screens/signin/SignInScreen';

type Props = { searchParams: Promise<{ reset?: string; invite?: string }> };

export default async function Page({ searchParams }: Props) {
  const { reset, invite } = await searchParams;
  return <SignInScreen initial={modeFromLink(reset, invite)} />;
}
