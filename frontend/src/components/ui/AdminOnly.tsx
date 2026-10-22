'use client';

import { useSession } from '@/api/queries';

/** Pages only the company's Admin may open (owner, 2026-10-23): others see a short note instead. */
export function AdminOnly({ children }: { children: React.ReactNode }) {
  const session = useSession().data;
  if (session && session.role !== 'admin') {
    return (
      <div className="card card-pad mx-auto mt-10 max-w-xl text-center">
        <h1 className="text-[20px]">Only an Admin can open this page</h1>
        <p className="mt-3 text-[13px] text-txt-2">Ask your company&apos;s Admin if you need something changed here.</p>
      </div>
    );
  }
  return <>{children}</>;
}
