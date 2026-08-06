"use server";

import { PrismaUserRepository } from "@core/infra/persistence/prisma/repositories/prisma-user.repository";
import { PrismaPermissionRepository } from "@core/infra/persistence/prisma/repositories/prisma-permission.repository";
import { GrantPermission } from "@core/application/users/grant-permission.usecase";
import { RevokePermission } from "@core/application/users/revoke-permission.usecase";
import { ListSystemPermissions } from "@core/application/users/list-system-permissions.usecase";
import { ListActiveSystemPermissions } from "@core/application/users/list-active-system-permissions.usecase";
import { UpdateSystemPermission } from "@core/application/users/update-system-permission.usecase";
import { SystemPermissionProps } from "@core/domain/users/system-permission.entity";
import { UserPermissionProps } from "@core/domain/users/user-permission.entity";
import { requireSessionAction } from "@/app/(agendamentos)/(left-nav-bar)/_actions/auth-actions";
import { canSharePermissions, validatePermissionGrant } from "@core/domain/users/permission-validation.business-rule";
import {
  assertPermissionIsAssignable,
  getActiveSystemPermissionNames,
  getAssignablePermissionNames,
  getGrantablePermissionNames,
  getInactiveAssignedPermissions,
} from "@core/domain/users/permission-assignment.business-rule";
import { formatActionError } from "@/lib/action-error-handler";

const userRepository = new PrismaUserRepository();
const permissionRepository = new PrismaPermissionRepository();

export async function grantPermissionAction(input: {
  targetUserId: string;
  permissionName: string;
}): Promise<{ success: boolean; data?: UserPermissionProps; error?: string }> {
  try {
    const session = await requireSessionAction();

    const granter = await userRepository.findById(session.id);
    if (!granter) {
      return { success: false, error: "Usuário não encontrado." };
    }

    if (!canSharePermissions({ role: granter.role, permissions: granter.permissions })) {
      return {
        success: false,
        error: "Você não possui permissão para atribuir permissões a outros usuários.",
      };
    }

    const useCase = new GrantPermission(permissionRepository, userRepository);
    const result = await useCase.execute({
      granterId: session.id,
      targetUserId: input.targetUserId,
      permissionName: input.permissionName,
    });

    return { success: true, data: result };
  } catch (error: unknown) {
    return { success: false, error: formatActionError(error, "Erro ao conceder permissão.") };
  }
}

export async function revokePermissionAction(input: {
  targetUserId: string;
  permissionName: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await requireSessionAction();

    const granter = await userRepository.findById(session.id);
    if (!granter) {
      return { success: false, error: "Usuário não encontrado." };
    }

    if (!canSharePermissions({ role: granter.role, permissions: granter.permissions })) {
      return {
        success: false,
        error: "Você não possui permissão para revogar permissões de outros usuários.",
      };
    }

    const useCase = new RevokePermission(permissionRepository, userRepository);
    await useCase.execute({
      granterId: session.id,
      targetUserId: input.targetUserId,
      permissionName: input.permissionName,
    });

    return { success: true };
  } catch (error: unknown) {
    return { success: false, error: formatActionError(error, "Erro ao revogar permissão.") };
  }
}

export async function listSystemPermissionsAction(): Promise<{
  success: boolean;
  data?: SystemPermissionProps[];
  error?: string;
}> {
  try {
    const session = await requireSessionAction();

    if (session.permissionLevel !== 1 && session.role !== "Administrador") {
      return { success: false, error: "Apenas Administradores podem visualizar permissões do sistema." };
    }

    const useCase = new ListSystemPermissions(permissionRepository);
    const rawResult = await useCase.execute();
    const result = rawResult.filter(
      (p) => !["Administrador", "Gestor", "Funcionario"].includes(p.name)
    );

    return { success: true, data: result };
  } catch (error: unknown) {
    return { success: false, error: formatActionError(error, "Erro ao listar permissões.") };
  }
}

export async function updateSystemPermissionAction(input: {
  id: number;
  enabled?: boolean;
  description?: string;
}): Promise<{ success: boolean; data?: SystemPermissionProps; error?: string }> {
  try {
    const session = await requireSessionAction();

    if (session.permissionLevel !== 1 && session.role !== "Administrador") {
      return { success: false, error: "Apenas Administradores podem modificar permissões do sistema." };
    }

    const useCase = new UpdateSystemPermission(permissionRepository);
    const result = await useCase.execute(input);

    return { success: true, data: result };
  } catch (error: unknown) {
    return { success: false, error: formatActionError(error, "Erro ao atualizar permissão.") };
  }
}

export async function getUserPermissionsAction(userId: string): Promise<{
  success: boolean;
  data?: UserPermissionProps[];
  error?: string;
}> {
  try {
    const session = await requireSessionAction();
    const user = await userRepository.findById(userId);

    if (!user) {
      return { success: false, error: "Usuário não encontrado." };
    }

    return { success: true, data: user.permissions };
  } catch (error: unknown) {
    return { success: false, error: formatActionError(error, "Erro ao buscar permissões.") };
  }
}

export async function getAvailablePermissionsForUserAction(input?: {
  userId?: string;
}): Promise<{
  success: boolean;
  data?: SystemPermissionProps[];
  grantablePermissions?: string[];
  inactiveAssignedPermissions?: UserPermissionProps[];
  selectedPermissions?: string[];
  error?: string;
}> {
  try {
    const session = await requireSessionAction();
    const granter = await userRepository.findById(session.id);

    if (!granter) {
      return { success: false, error: "Usuário não encontrado." };
    }

    // Only users with compartilhar_permissoes can assign permissions
    if (!canSharePermissions({ role: granter.role, permissions: granter.permissions })) {
      return {
        success: false,
        error: "Você não possui permissão para atribuir permissões.",
      };
    }

    const useCase = new ListActiveSystemPermissions(permissionRepository);
    const rawActivePermissions = await useCase.execute();
    const activePermissions = rawActivePermissions.filter(
      (p) => !["Administrador", "Gestor", "Funcionario"].includes(p.name)
    );
    const activeNames = getActiveSystemPermissionNames(activePermissions);
    const grantablePermissions = getGrantablePermissionNames(
      { role: granter.role, permissions: granter.permissions },
      activePermissions,
    );

    let inactiveAssignedPermissions: UserPermissionProps[] | undefined;
    let selectedPermissions: string[] | undefined;

    if (input?.userId) {
      const targetUser = await userRepository.findById(input.userId);
      if (!targetUser) {
        return { success: false, error: "Usuário alvo não encontrado." };
      }

      inactiveAssignedPermissions = getInactiveAssignedPermissions(
        targetUser.permissions,
        activeNames,
      );
      selectedPermissions = getAssignablePermissionNames(
        targetUser.permissions,
        activeNames,
      );
    }

    return {
      success: true,
      data: activePermissions,
      grantablePermissions,
      inactiveAssignedPermissions,
      selectedPermissions,
    };
  } catch (error: unknown) {
    return { success: false, error: formatActionError(error, "Erro ao listar permissões.") };
  }
}

export async function updateUserPermissionsAction(input: {
  userId: string;
  permissionNames: string[];
}): Promise<{ success: boolean; data?: UserPermissionProps[]; error?: string }> {
  try {
    const session = await requireSessionAction();

    const granter = await userRepository.findById(session.id);
    if (!granter) {
      return { success: false, error: "Usuário não encontrado." };
    }

    if (!canSharePermissions({ role: granter.role, permissions: granter.permissions })) {
      return {
        success: false,
        error: "Você não possui permissão para atribuir permissões.",
      };
    }

    const target = await userRepository.findById(input.userId);
    if (!target) {
      return { success: false, error: "Usuário alvo não encontrado." };
    }

    // Get current permissions
    const currentPermissions = await permissionRepository.findUserPermissions(input.userId);
    const currentNames = currentPermissions.map(p => p.name);

    // Determine permissions to add and remove
    const toAdd = input.permissionNames.filter(name => !currentNames.includes(name));
    const toRemove = currentNames.filter(name => !input.permissionNames.includes(name));

    const rawActivePermissions = await new ListActiveSystemPermissions(
      permissionRepository,
    ).execute();
    const activePermissions = rawActivePermissions.filter(
      (p) => !["Administrador", "Gestor", "Funcionario"].includes(p.name)
    );
    const activeNames = getActiveSystemPermissionNames(activePermissions);
    const grantableNames = getGrantablePermissionNames(
      { role: granter.role, permissions: granter.permissions },
      activePermissions,
    );

    for (const permName of toAdd) {
      try {
        assertPermissionIsAssignable(permName, activeNames);
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Permissão indisponível.",
        };
      }

      if (!grantableNames.includes(permName)) {
        return {
          success: false,
          error: `Você não possui permissão para atribuir ${permName}.`,
        };
      }

      // Validate hierarchy
      try {
        validatePermissionGrant(
          { role: granter.role, permissions: granter.permissions },
          target.role,
          permName
        );
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Validação de permissão falhou.",
        };
      }
    }

    // Apply changes
    for (const permName of toAdd) {
      await permissionRepository.grantPermission(input.userId, permName);
    }

    for (const permName of toRemove) {
      await permissionRepository.revokePermission(input.userId, permName);
    }

    const refreshedPermissions = await permissionRepository.findUserPermissions(input.userId);
    return { success: true, data: refreshedPermissions.map((p) => p.toJSON()) };
  } catch (error: unknown) {
    return { success: false, error: formatActionError(error, "Erro ao atualizar permissões.") };
  }
}
