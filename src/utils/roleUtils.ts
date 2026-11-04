/**
 * Centralized Role Management & Navigation Utilities for VYNTRA CAFE
 */

export const normalizeRole = (role?: string): string => {
  if (!role) return '';
  return role.toUpperCase().replace(/[\s-]+/g, '_').trim();
};

export const ROLE_GROUPS = {
  ADMIN: ['ADMIN', 'SUPER_ADMIN', 'OWNER'],
  MANAGER: ['MANAGER', 'ADMIN', 'SUPER_ADMIN', 'OWNER'],
  WAITER: ['WAITER', 'SERVICE_STAFF', 'ADMIN', 'SUPER_ADMIN', 'OWNER', 'MANAGER'],
  CHEF: ['CHEF', 'KITCHEN_STAFF', 'COOK', 'ADMIN', 'SUPER_ADMIN', 'OWNER', 'MANAGER'],
  CASHIER: ['CASHIER', 'ADMIN', 'SUPER_ADMIN', 'OWNER', 'MANAGER'],
  CUSTOMER: ['CUSTOMER'],
} as const;

/**
 * Returns the correct primary dashboard route for a given user role
 */
export const getRoleDashboardPath = (role?: string): string => {
  const norm = normalizeRole(role);
  if (['ADMIN', 'SUPER_ADMIN', 'OWNER'].includes(norm)) {
    return '/admin/dashboard';
  }
  if (['MANAGER'].includes(norm)) {
    return '/manager/dashboard';
  }
  if (['WAITER', 'SERVICE_STAFF'].includes(norm)) {
    return '/waiter/dashboard';
  }
  if (['CHEF', 'KITCHEN_STAFF', 'COOK'].includes(norm)) {
    return '/chef/dashboard';
  }
  if (['CASHIER'].includes(norm)) {
    return '/cashier/dashboard';
  }
  return '/';
};

/**
 * Returns the dedicated login route for a role
 */
export const getRoleLoginPath = (role?: string): string => {
  const norm = normalizeRole(role);
  if (['ADMIN', 'SUPER_ADMIN', 'OWNER'].includes(norm)) {
    return '/admin/login';
  }
  if (['MANAGER'].includes(norm)) {
    return '/manager/login';
  }
  if (['WAITER', 'SERVICE_STAFF'].includes(norm)) {
    return '/waiter/login';
  }
  if (['CHEF', 'KITCHEN_STAFF', 'COOK'].includes(norm)) {
    return '/chef/login';
  }
  if (['CASHIER'].includes(norm)) {
    return '/cashier/login';
  }
  return '/login';
};

/**
 * Checks if a given role is considered a staff or management role
 */
export const isStaffRole = (role?: string): boolean => {
  const norm = normalizeRole(role);
  return [
    'ADMIN',
    'SUPER_ADMIN',
    'OWNER',
    'MANAGER',
    'WAITER',
    'SERVICE_STAFF',
    'CHEF',
    'KITCHEN_STAFF',
    'COOK',
    'CASHIER',
  ].includes(norm);
};

/**
 * Checks whether userRole is included in the allowed list of roles
 */
export const hasRoleAccess = (userRole: string | undefined, allowedRoles: readonly string[] | string[]): boolean => {
  if (!userRole) return false;
  const userNorm = normalizeRole(userRole);
  const normalizedAllowed = allowedRoles.map((r) => normalizeRole(r));
  return normalizedAllowed.includes(userNorm);
};

