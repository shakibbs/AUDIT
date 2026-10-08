import type { Role } from '@/api/types';

/** Pages an underwriter may open. Everything else belongs to the client. */
export const UNDERWRITER_PATHS = ['/portfolio', '/exposure', '/integrity', '/attestation', '/litigation', '/uw-export', '/rulebook', '/regulatory'];
/** Insurer pages that cover the insurer's whole book; clients never open them. */
export const INSURER_ONLY_PATHS = ['/portfolio', '/exposure', '/litigation'];

const matches = (pathname: string, paths: string[]) => paths.some((p) => pathname === p || pathname.startsWith(`${p}/`));

export type ViewBlock = 'none' | 'client-page' | 'insurer-page';

/** Whether this role may open this page, and if not, why. */
export function viewBlock(role: Role, pathname: string): ViewBlock {
  if (role === 'underwriter') return matches(pathname, UNDERWRITER_PATHS) ? 'none' : 'client-page';
  return matches(pathname, INSURER_ONLY_PATHS) ? 'insurer-page' : 'none';
}
