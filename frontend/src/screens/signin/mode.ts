/** Which form the sign-in page shows. */
export type Mode = { kind: 'sign-in' } | { kind: 'reset' } | { kind: 'new-password'; link: string } | { kind: 'invite'; token: string };

// Links in emails land here as /sign-in?reset=<uid>.<token> or /sign-in?invite=<token>.
export function modeFromLink(reset?: string, invite?: string): Mode {
  if (reset) return { kind: 'new-password', link: reset };
  if (invite) return { kind: 'invite', token: invite };
  return { kind: 'sign-in' };
}
