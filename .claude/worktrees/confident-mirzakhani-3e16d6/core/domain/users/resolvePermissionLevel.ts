import { PERMISSION_LEVELS, UserPermissionProps } from "./UserPermission";
import { StaffRole, User } from "./User";

export function resolvePermissionLevel(
  user: Pick<User, "role" | "permissions"> | {
    role: StaffRole;
    permissions?: UserPermissionProps[];
  },
): 1 | 2 | 3 {
  const permissionName = user.permissions?.[0]?.name || user.role;

  if (permissionName === PERMISSION_LEVELS.ADMINISTRADOR.name) {
    return 1;
  }
  if (permissionName === PERMISSION_LEVELS.GESTOR.name) {
    return 2;
  }
  return 3;
}

export function roleFromPermissionLevel(level: 1 | 2 | 3): StaffRole {
  if (level === 1) return "Administrador";
  if (level === 2) return "Gestor";
  return "Funcionario";
}
