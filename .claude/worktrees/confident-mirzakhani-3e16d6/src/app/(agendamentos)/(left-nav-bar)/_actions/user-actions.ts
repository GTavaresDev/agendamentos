"use server";

import { PrismaUserRepository } from "@core/infra/persistence/prisma/repositories/PrismaUserRepository";
import { CreateUser } from "@core/application/users/CreateUser";
import { ListUsers } from "@core/application/users/ListUsers";
import { UpdateUser } from "@core/application/users/UpdateUser";
import { DeleteUser } from "@core/application/users/DeleteUser";
import { roleFromPermissionLevel } from "@core/domain/users/resolvePermissionLevel";
import { StaffRole, UserProps } from "@core/domain/users/User";
import { hashPassword } from "@core/infra/auth/password";
import { requireSessionAction } from "@/app/(agendamentos)/(left-nav-bar)/_actions/auth-actions";

const userRepository = new PrismaUserRepository();

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
          error: "Gestores só podem criar usuários do nível Gestor ou Funcionário.",
        };
      }
    }

    const level = input.permissionLevel || 3;
    if (session.role === "Gestor" && level === 1) {
      return {
        success: false,
        error: "Gestores só podem criar usuários do nível Gestor ou Funcionário.",
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
    const message = error instanceof Error ? error.message : "Erro ao criar usuário.";
    return { success: false, error: message };
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

    if (session.role === "Gestor") {
      if (targetUser.role === "Administrador") {
        return {
          success: false,
          error: "Gestores não possuem permissão para alterar usuários Administradores.",
        };
      }
      if (targetUser.role === "Gestor") {
        return {
          success: false,
          error: "Gestores não possuem permissão para alterar outros Gestores.",
        };
      }
    }

    let encryptedPassword: string | undefined;

    if (input.password || input.confirmPassword || input.currentPassword) {
      if (!input.currentPassword) {
        return { success: false, error: "Informe a senha atual para alterar a senha." };
      }
      if (!input.password) {
        return { success: false, error: "Informe a nova senha." };
      }
      if (input.password !== input.confirmPassword) {
        return { success: false, error: "A nova senha e a confirmação de senha não coincidem." };
      }

      // For password updates, strictly require the actual password stored in the database.
      if (!targetUser.password) {
        return { success: false, error: "Usuário não possui uma senha definida no banco de dados." };
      }

      const { verifyPassword } = await import("@core/infra/auth/password");
      const isCurrentValid = await verifyPassword(input.currentPassword, targetUser.password);

      if (!isCurrentValid) {
        return { success: false, error: "A senha atual informada está incorreta." };
      }

      encryptedPassword = await hashPassword(input.password);
    }

    const useCase = new UpdateUser(userRepository);
    const updated = await useCase.execute({
      ...input,
      email: input.email?.trim().toLowerCase(),
      password: encryptedPassword,
      ...(input.status === "Ativo" ? { failedLoginAttempts: 0, lockedUntil: null } : {}),
    });
    return { success: true, data: toPublicUser(updated) };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro ao atualizar usuário.";
    return { success: false, error: message };
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
    const message = error instanceof Error ? error.message : "Erro ao excluir usuário.";
    return { success: false, error: message };
  }
}
