import type { Role } from '@/api/types';

export const ROLE_LABEL: Record<Role, string> = { admin: 'Admin', member: 'Member' };

/** Roles a client can give to its own people. */
export const CLIENT_ROLES: Role[] = ['admin', 'member'];

export const ROLE_CAN: Record<Role, string> = {
  admin: 'Everything, including people, settings, evidence files and legal holds',
  member: 'Sees the whole portal; cannot change people, settings or evidence files',
};
