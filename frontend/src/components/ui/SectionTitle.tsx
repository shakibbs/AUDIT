/** A small heading that groups the cards below it on a page. */
export function SectionTitle({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="mb-3 mt-2 flex flex-wrap items-baseline gap-x-3 gap-y-1">
      <h2 className="font-display text-[15px] font-bold text-txt">{title}</h2>
      {sub && <span className="tiny">{sub}</span>}
    </div>
  );
}
