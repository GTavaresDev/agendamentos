type UserWithPermissions = {
  permissionLevel?: 1 | 2 | 3;
  permissions?: Array<{ name: string }>;
};

export function canAccessReports(user?: UserWithPermissions | null): boolean {
  if (!user) return false;
  if (user.permissionLevel === 1 || user.permissionLevel === 2) return true;
  return user.permissions?.some((p) => p.name === 'ver_relatorios') ?? false;
}

export function canAccessUsers(user?: UserWithPermissions | null): boolean {
  if (!user) return false;
  if (user.permissionLevel === 1 || user.permissionLevel === 2) return true;
  return user.permissions?.some((p) => p.name === 'compartilhar_permissoes') ?? false;
}
