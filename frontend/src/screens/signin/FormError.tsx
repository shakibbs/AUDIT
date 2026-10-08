/** The red message under a sign-in form. */
export function FormError({ message }: { message: string }) {
  return <p className="mb-0 mt-3 text-[12.5px]" style={{ color: 'var(--bad-ink)' }} role="alert">{message}</p>;
}
