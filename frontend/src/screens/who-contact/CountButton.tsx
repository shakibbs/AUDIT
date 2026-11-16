/** A count that opens the phone numbers behind it (owner 2026-11-16); plain text where nothing can be opened. */
export function CountButton({ n, label, onOpen }: { n: number; label: string; onOpen?: () => void }) {
  const text = `${n.toLocaleString('en-US')} ${label}`;
  if (!onOpen) return <span className="text-[12.5px] font-bold">{text}</span>;
  return <button type="button" onClick={onOpen} className="text-left text-[12.5px] font-bold underline decoration-dotted underline-offset-[3px] hover:text-brand">{text}</button>;
}
