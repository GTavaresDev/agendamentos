import { StaffRole } from './user.entity';
import { UserPermissionProps } from './user-permission.entity';

const ROLE_HIERARCHY: Record<StaffRole, number> = {
  'Administrador': 1,
  'Gestor': 2,
  'Funcionario': 3,
};

export class PermissionValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PermissionValidationError';
  }
}

export interface PermissionCheckContext {
  role: StaffRole;
  permissions?: UserPermissionProps[];
}

/**
 * Checks if a user has a specific permission
 */
export function hasPermission(
  context: PermissionCheckContext,
  permissionName: string
): boolean {
  return (
    context.permissions?.some(
      p => p.name === permissionName && p.enabled !== false,
    ) ?? false
  );
}

/**
 * Checks if a user can share permissions
 */
export function canSharePermissions(context: PermissionCheckContext): boolean {
  return hasPermission(context, 'compartilhar_permissoes') || context.role === 'Administrador';
}

/**
 * Checks if a user can access reports
 */
export function canAccessReports(context: PermissionCheckContext): boolean {
  if (context.role === 'Administrador') return true;
  return hasPermission(context, 'ver_relatorios');
}

/**
 * Validates that a user can grant a specific permission to another user
 */
export function validatePermissionGrant(
  granterContext: PermissionCheckContext,
  targetRole: StaffRole,
  permissionName: string
): void {
  // User must have permission sharing ability
  if (!canSharePermissions(granterContext)) {
    throw new PermissionValidationError(
      'Você não possui permissão para atribuir permissões a outros usuários.'
    );
  }

  // User can only grant permissions they already have
  if (!hasPermission(granterContext, permissionName) && granterContext.role !== 'Administrador') {
    throw new PermissionValidationError(
      'Você só pode atribuir permissões que você já possui.'
    );
  }

  // Respect hierarchy: lower hierarchy levels cannot grant to higher ones
  const granterHierarchy = ROLE_HIERARCHY[granterContext.role];
  const targetHierarchy = ROLE_HIERARCHY[targetRole];

  if (granterHierarchy > targetHierarchy) {
    throw new PermissionValidationError(
      'Você não pode atribuir permissões para usuários com nível hierárquico mais alto que o seu.'
    );
  }
}

/**
 * Get role hierarchy level
 */
export function getRoleHierarchyLevel(role: StaffRole): number {
  return ROLE_HIERARCHY[role];
}

/**
 * Check if a role can manage another role (hierarchy)
 */
export function canManageRole(
  granterRole: StaffRole,
  targetRole: StaffRole
): boolean {
  const granterLevel = ROLE_HIERARCHY[granterRole];
  const targetLevel = ROLE_HIERARCHY[targetRole];
  return granterLevel <= targetLevel;
}
