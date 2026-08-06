import { UserPermissionProps } from "./user-permission.entity";
import { StaffRole, User } from "./user.entity";

export function resolvePermissionLevel(
  user: Pick<User, "role" | "permissions"> | {
    role: StaffRole;
    permissions?: UserPermissionProps[];
  },
): 1 | 2 | 3 {
  if (user.role === "Administrador") {
    return 1;
  }
  if (user.role === "Gestor") {
    return 2;
  }
  return 3;
}

export function roleFromPermissionLevel(level: 1 | 2 | 3): StaffRole {
  if (level === 1) return "Administrador";
  if (level === 2) return "Gestor";
  return "Funcionario";
}
