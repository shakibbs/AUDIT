import Link from 'next/link';

/** A wrong address: the portal's look and a way back, not a blank "404" (QA 2026-10-23). */
export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-bg p-6">
      <section className="card card-pad w-full max-w-[440px] text-center">
        <div className="ph-eyebrow">Comply iV</div>
        <h1 className="mt-1 text-[22px]">This page does not exist</h1>
        <p className="mb-5 mt-2 text-[13px] text-txt-2">The address may be mistyped, or the page has moved.</p>
        <div className="flex flex-wrap justify-center gap-2">
          <Link href="/" className="btn btn-primary btn-sm no-underline">Go to Overview</Link>
          <Link href="/portfolio" className="btn btn-ghost btn-sm no-underline">Insurers: Portfolio</Link>
        </div>
      </section>
    </main>
  );
}
