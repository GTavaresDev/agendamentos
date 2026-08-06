"use server";

import { z } from "zod";
import {
  AuthenticateUser,
  AuthenticationError,
} from "@core/application/users/AuthenticateUser";
import { resolvePermissionLevel } from "@core/domain/users/resolvePermissionLevel";
import { PrismaUserRepository } from "@core/infra/persistence/prisma/repositories/PrismaUserRepository";
import { auth, signOut } from "@/auth";
import {
  createAuthSession,
  readAuthSessionPayload,
  restoreActorSession,
  writeImpersonationSession,
  type SessionActor,
} from "@/lib/create-auth-session";
import type { StaffRole } from "@core/domain/users/User";

const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Informe o e-mail")
    .refine((val) => val.includes("@"), {
      message: "Informe um e-mail válido com @",
    }),
  password: z.string().min(1, "Informe a senha"),
});

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: StaffRole;
  permissionLevel: 1 | 2 | 3;
  initials: string;
  permissions?: Array<{ name: string }>;
  impersonating?: boolean;
  impersonator?: SessionActor;
};

export async function loginAction(input: {
  email: string;
  password: string;
}): Promise<{ success: boolean; error?: string }> {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Credenciais inválidas" };
  }

  try {
    const useCase = new AuthenticateUser(new PrismaUserRepository());
    const user = await useCase.execute(
      parsed.data.email,
      parsed.data.password,
    );
    await createAuthSession(user);
    return { success: true };
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return { success: false, error: error.message };
    }
    throw error;
  }
}

export async function logoutAction(): Promise<void> {
  await signOut({ redirectTo: "/login" });
}

export async function getCurrentSessionAction(): Promise<SessionUser | null> {
  const session = await auth();
  if (!session?.user?.id || !session.user.role) {
    return null;
  }

  let impersonator: SessionActor | undefined;
  if (session.user.impersonating && session.user.impersonator) {
    impersonator = session.user.impersonator;
  }

  return {
    id: session.user.id,
    name: session.user.name || "",
    email: session.user.email || "",
    role: session.user.role,
    permissionLevel: session.user.permissionLevel || 3,
    initials: session.user.initials || "",
    permissions: (session.user as any).permissions,
    impersonating: Boolean(session.user.impersonating),
    impersonator,
  };
}

export async function requireSessionAction(): Promise<SessionUser> {
  const session = await getCurrentSessionAction();
  if (!session) {
    throw new Error("Não autenticado");
  }
  return session;
}

function resolveActor(
  payload: Awaited<ReturnType<typeof readAuthSessionPayload>>,
): SessionActor | null {
  if (!payload) {
    return null;
  }

  if (
    payload.impersonating &&
    payload.impersonatorId &&
    payload.impersonatorRole
  ) {
    return {
      id: payload.impersonatorId,
      name: payload.impersonatorName || "",
      email: payload.impersonatorEmail || "",
      role: payload.impersonatorRole,
      permissionLevel: payload.impersonatorPermissionLevel || 1,
      initials: payload.impersonatorInitials || "",
    };
  }

  return {
    id: payload.id,
    name: payload.name,
    email: payload.email,
    role: payload.role,
    permissionLevel: payload.permissionLevel,
    initials: payload.initials,
  };
}

export async function startImpersonationAction(
  targetUserId: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const payload = await readAuthSessionPayload();
    const actor = resolveActor(payload);

    if (!actor || actor.role !== "Administrador") {
      return {
        success: false,
        error: "Apenas Administradores podem usar impersonation.",
      };
    }

    if (actor.id === targetUserId) {
      return {
        success: false,
        error: "Você já está nesta conta.",
      };
    }

    const repository = new PrismaUserRepository();
    const target = await repository.findById(targetUserId);
    if (!target) {
      return { success: false, error: "Usuário não encontrado." };
    }

    await writeImpersonationSession({
      actor,
      target: {
        id: target.id,
        name: target.name,
        email: target.email,
        role: target.role,
        permissionLevel: resolvePermissionLevel(target),
        initials: target.initials,
      },
    });

    return { success: true };
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Erro ao assumir usuário.";
    return { success: false, error: message };
  }
}

export async function stopImpersonationAction(): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const payload = await readAuthSessionPayload();
    if (!payload?.impersonating) {
      return { success: false, error: "Nenhuma impersonation ativa." };
    }

    const actor = resolveActor(payload);
    if (!actor) {
      return { success: false, error: "Sessão inválida." };
    }

    await restoreActorSession(actor);
    return { success: true };
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Erro ao sair da conta.";
    return { success: false, error: message };
  }
}
