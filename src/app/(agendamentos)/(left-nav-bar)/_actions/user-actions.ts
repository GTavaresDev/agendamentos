"use server";

import { PrismaUserRepository } from "@core/infra/persistence/prisma/repositories/prisma-user.repository";
import { CreateUser } from "@core/application/users/create-user.usecase";
import { ListUsers } from "@core/application/users/list-users.usecase";
import { UpdateUser } from "@core/application/users/update-user.usecase";
import { DeleteUser } from "@core/application/users/delete-user.usecase";
import { roleFromPermissionLevel } from "@core/domain/users/resolve-permission-level.business-rule";
import { StaffRole, UserProps } from "@core/domain/users/user.entity";
import { hashPassword } from "@core/infra/auth/password";
import { requireSessionAction } from "@/app/(agendamentos)/(left-nav-bar)/_actions/auth-actions";
import { formatActionError } from "@/lib/action-error-handler";

const userRepository = new PrismaUserRepository();

function canEditUser(actorRole: StaffRole, targetRole: StaffRole): boolean {
  if (actorRole === "Administrador") return true;
  if (actorRole === "Gestor") return targetRole === "Funcionario";
  return false;
}

function canEditProfile(actorRole: StaffRole, targetRole: StaffRole): boolean {
  return canEditUser(actorRole, targetRole);
}

function canEditPermissions(
  actorRole: StaffRole,
  targetRole: StaffRole,
): boolean {
  return actorRole === "Administrador" && canEditUser(actorRole, targetRole);
}

function toPublicUser(user: { toJSON(): UserProps }): UserProps {
  return user.toJSON();
}

export async function fetchUsersAction(filter?: {
  search?: string;
  role?: string;
  status?: string;
}): Promise<UserProps[]> {
  const session = await requireSessionAction();
  if (session.permissionLevel === 3 || session.role === "Funcionario") {
    return [];
  }
  const useCase = new ListUsers(userRepository);
  const users = await useCase.execute(filter);
  return users.map(toPublicUser);
}

export async function createUserAction(input: {
  name: string;
  email: string;
  phone?: string;
  password?: string;
  permissionLevel?: 1 | 2 | 3;
  status?: "Ativo" | "Inativo";
}): Promise<{ success: boolean; data?: UserProps; error?: string }> {
  try {
    const session = await requireSessionAction();

    if (session.permissionLevel === 3 || session.role === "Funcionario") {
      return { success: false, error: "Sem permissão para criar usuários." };
    }

    if (
      session.role === "Gestor" &&
      (input.permissionLevel === 1 || !input.permissionLevel)
    ) {
      if (input.permissionLevel === 1) {
        return {
          success: false,
          error:
            "Gestores só podem criar usuários do nível Gestor ou Funcionário.",
        };
      }
    }

    const level = input.permissionLevel || 3;
    if (session.role === "Gestor" && level === 1) {
      return {
        success: false,
        error:
          "Gestores só podem criar usuários do nível Gestor ou Funcionário.",
      };
    }

    const mappedRole: StaffRole = roleFromPermissionLevel(level);
    const encryptedPassword = input.password
      ? await hashPassword(input.password)
      : undefined;
    const useCase = new CreateUser(userRepository);

    const created = await useCase.execute({
      name: input.name,
      email: input.email.trim().toLowerCase(),
      phone: input.phone,
      password: encryptedPassword,
      role: mappedRole,
      status: input.status,
    });
    return { success: true, data: toPublicUser(created) };
  } catch (error: unknown) {
    return { success: false, error: formatActionError(error, "Erro ao criar usuário.") };
  }
}

export async function updateUserAction(input: {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  currentPassword?: string;
  password?: string;
  confirmPassword?: string;
  role?: StaffRole;
  status?: "Ativo" | "Inativo";
}): Promise<{ success: boolean; data?: UserProps; error?: string }> {
  try {
    const session = await requireSessionAction();
    const targetUser = await userRepository.findById(input.id);
    if (!targetUser) {
      return { success: false, error: "Usuário não encontrado." };
    }

    if (session.permissionLevel === 3 || session.role === "Funcionario") {
      return { success: false, error: "Sem permissão para alterar usuários." };
    }

    if (!canEditUser(session.role, targetUser.role)) {
      return {
        success: false,
        error:
          session.role === "Gestor"
            ? "Gestores não possuem permissão para alterar este usuário."
            : "Sem permissão para alterar este usuário.",
      };
    }

    const targetCanEditProfile = canEditProfile(session.role, targetUser.role);

    if (input.role && !targetCanEditProfile) {
      return {
        success: false,
        error: "Sem permissão para alterar o perfil deste usuário.",
      };
    }

    if (input.role && session.role === "Gestor" && input.role !== "Gestor") {
      return {
        success: false,
        error: "Gestores só podem promover usuários Funcionário para Gestor.",
      };
    }

    if (
      input.role &&
      session.role === "Gestor" &&
      targetUser.role !== "Funcionario"
    ) {
      return {
        success: false,
        error: "Gestores só podem alterar o perfil de usuários Funcionário.",
      };
    }

    let encryptedPassword: string | undefined;

    if (input.password || input.confirmPassword || input.currentPassword) {
      if (!input.currentPassword) {
        return {
          success: false,
          error: "Informe a senha atual para alterar a senha.",
        };
      }
      if (!input.password) {
        return { success: false, error: "Informe a nova senha." };
      }
      if (input.password !== input.confirmPassword) {
        return {
          success: false,
          error: "A nova senha e a confirmação de senha não coincidem.",
        };
      }

      // For password updates, strictly require the actual password stored in the database.
      if (!targetUser.password) {
        return {
          success: false,
          error: "Usuário não possui uma senha definida no banco de dados.",
        };
      }

      const { verifyPassword } = await import("@core/infra/auth/password");
      const isCurrentValid = await verifyPassword(
        input.currentPassword,
        targetUser.password,
      );

      if (!isCurrentValid) {
        return {
          success: false,
          error: "A senha atual informada está incorreta.",
        };
      }

      encryptedPassword = await hashPassword(input.password);
    }

    const useCase = new UpdateUser(userRepository);
    const updated = await useCase.execute({
      ...input,
      email: input.email?.trim().toLowerCase(),
      password: encryptedPassword,
      ...(input.status === "Ativo"
        ? { failedLoginAttempts: 0, lockedUntil: null }
        : {}),
    });
    return { success: true, data: toPublicUser(updated) };
  } catch (error: unknown) {
    return { success: false, error: formatActionError(error, "Erro ao atualizar usuário.") };
  }
}

export async function deleteUserAction(
  id: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await requireSessionAction();
    const targetUser = await userRepository.findById(id);
    if (!targetUser) {
      return { success: false, error: "Usuário não encontrado." };
    }

    if (session.role !== "Administrador") {
      return { success: false, error: "Sem permissão para excluir usuários." };
    }

    const useCase = new DeleteUser(userRepository);
    await useCase.execute(id);
    return { success: true };
  } catch (error: unknown) {
    return { success: false, error: formatActionError(error, "Erro ao excluir usuário.") };
  }
}
