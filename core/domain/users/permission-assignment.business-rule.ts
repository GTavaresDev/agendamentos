import type { StaffRole } from "./user.entity";
import type { SystemPermissionProps } from "./system-permission.entity";
import type { UserPermissionProps } from "./user-permission.entity";

export function getActiveSystemPermissionNames(
  activeSystemPermissions: SystemPermissionProps[],
): Set<string> {
  return new Set(activeSystemPermissions.map((permission) => permission.name));
}

export function getGrantablePermissionNames(
  granter: { role: StaffRole; permissions?: UserPermissionProps[] },
  activeSystemPermissions: SystemPermissionProps[],
): string[] {
  const names = (granter.permissions ?? [])
    .filter((permission) => permission.enabled !== false)
    .map((permission) => permission.name);

  if (granter.role === "Administrador") {
    names.push(...activeSystemPermissions.map((permission) => permission.name));
  }

  return Array.from(new Set(names));
}

export function getAssignablePermissionNames(
  userPermissions: UserPermissionProps[] | undefined,
  activeSystemPermissionNames: Set<string>,
): string[] {
  return (userPermissions ?? [])
    .filter(
      (permission) =>
        permission.enabled !== false && activeSystemPermissionNames.has(permission.name),
    )
    .map((permission) => permission.name);
}

export function getInactiveAssignedPermissions(
  userPermissions: UserPermissionProps[] | undefined,
  activeSystemPermissionNames: Set<string>,
): UserPermissionProps[] {
  return (userPermissions ?? []).filter(
    (permission) =>
      permission.enabled !== false && !activeSystemPermissionNames.has(permission.name),
  );
}

export function assertPermissionIsAssignable(
  permissionName: string,
  activeSystemPermissionNames: Set<string>,
): void {
  if (!activeSystemPermissionNames.has(permissionName)) {
    throw new Error(
      `A permissão ${permissionName} está desativada e não pode ser atribuída.`,
    );
  }
}
