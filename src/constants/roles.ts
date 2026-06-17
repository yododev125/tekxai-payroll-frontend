/**
 * Role names must match backend ROLE_NAMES exactly.
 * BUG-004 FIX: Added EMPLOYEE (correct spelling), HR, MARKETING, DIVISION_MANAGER
 */
export const USER_ROLES = {
  SUPER_ADMIN:      'SUPER_ADMIN',
  ADMIN:            'ADMIN',
  HR:               'HR',
  EMPLOYEE:         'EMPLOYEE',
  MARKETING:        'MARKETING',
  DIVISION_MANAGER: 'DIVISION_MANAGER',
  // Legacy alias kept for any existing references
  EMPLLOYEE:        'EMPLOYEE',
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

export const ADMIN_ROLES: UserRole[] = ['SUPER_ADMIN', 'ADMIN', 'HR', 'DIVISION_MANAGER'];
export const MARKETING_ROLES: UserRole[] = ['MARKETING'];

export const isAdminRole = (role: string | null | undefined): boolean =>
  ADMIN_ROLES.includes(role as UserRole);

export const isUserRole = (value: string | null | undefined): value is UserRole =>
  Object.values(USER_ROLES).includes(value as UserRole);
