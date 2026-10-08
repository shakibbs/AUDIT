import type { Role } from '@/api/types';

export const ROLE_LABEL: Record<Role, string> = { admin: 'Admin', member: 'Member' };

/** Roles a client can give to its own people. */
export const CLIENT_ROLES: Role[] = ['admin', 'member'];

export const ROLE_CAN: Record<Role, string> = {
  admin: 'Everything, including people, settings, evidence files and legal holds',
  member: 'Sees the portal and works on findings; no people, settings or evidence files',
};
