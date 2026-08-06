"use server";

import { PrismaUserRepository } from "@core/infra/persistence/prisma/repositories/PrismaUserRepository";
import { PrismaPermissionRepository } from "@core/infra/persistence/prisma/repositories/PrismaPermissionRepository";
import { GrantPermission } from "@core/application/users/GrantPermission";
import { RevokePermission } from "@core/application/users/RevokePermission";
import { ListSystemPermissions } from "@core/application/users/ListSystemPermissions";
import { UpdateSystemPermission } from "@core/application/users/UpdateSystemPermission";
import { SystemPermissionProps } from "@core/domain/users/SystemPermission";
import { UserPermissionProps } from "@core/domain/users/UserPermission";
import { requireSessionAction } from "@/app/(agendamentos)/(left-nav-bar)/_actions/auth-actions";
import { canSharePermissions, validatePermissionGrant } from "@core/domain/users/PermissionValidation";

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
    const message = error instanceof Error ? error.message : "Erro ao conceder permissão.";
    return { success: false, error: message };
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
    const message = error instanceof Error ? error.message : "Erro ao revogar permissão.";
    return { success: false, error: message };
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
    const result = await useCase.execute();

    return { success: true, data: result };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro ao listar permissões.";
    return { success: false, error: message };
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
    const message = error instanceof Error ? error.message : "Erro ao atualizar permissão.";
    return { success: false, error: message };
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
    const message = error instanceof Error ? error.message : "Erro ao buscar permissões.";
    return { success: false, error: message };
  }
}

export async function getAvailablePermissionsForUserAction(): Promise<{
  success: boolean;
  data?: SystemPermissionProps[];
  grantablePermissions?: string[];
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

    const useCase = new ListSystemPermissions(permissionRepository);
    const allPermissions = await useCase.execute();

    // Filter to only permissions the current user can grant
    const grantableNames = granter.permissions?.map(p => p.name) || [];
    if (granter.role === "Administrador") {
      grantableNames.push(...allPermissions.map(p => p.name));
    }

    return { success: true, data: allPermissions, grantablePermissions: Array.from(new Set(grantableNames)) };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro ao listar permissões.";
    return { success: false, error: message };
  }
}

export async function updateUserPermissionsAction(input: {
  userId: string;
  permissionNames: string[];
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

    // Validate all permissions can be granted
    const grantableNames = granter.permissions?.map(p => p.name) || [];
    if (granter.role === "Administrador") {
      const allPerms = await permissionRepository.findAllSystemPermissions();
      grantableNames.push(...allPerms.map(p => p.name));
    }

    for (const permName of toAdd) {
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

    return { success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro ao atualizar permissões.";
    return { success: false, error: message };
  }
}
