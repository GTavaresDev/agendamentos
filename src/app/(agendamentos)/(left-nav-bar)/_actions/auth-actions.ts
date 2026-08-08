"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import {
  ImpersonateClient,
  ImpersonationError,
} from "@core/application/portal/impersonate-client.usecase";
import {
  AuthenticateUser,
  AuthenticationError,
} from "@core/application/users/authenticate-user.usecase";
import { resolvePermissionLevel } from "@core/domain/users/resolve-permission-level.business-rule";
import { PrismaClientRepository } from "@core/infra/persistence/prisma/repositories/prisma-client.repository";
import { PrismaUserRepository } from "@core/infra/persistence/prisma/repositories/prisma-user.repository";
import { auth, signOut } from "@/auth";
import {
  createClientSession,
  destroyClientSession,
  getClientSession,
} from "@/lib/client-session";
import {
  createAuthSession,
  readAuthSessionPayload,
  restoreActorSession,
  writeImpersonationSession,
  type SessionActor,
} from "@/lib/create-auth-session";
import type { StaffRole } from "@core/domain/users/user.entity";
import { formatActionError } from "@/lib/action-error-handler";

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
    return { success: false, error: formatActionError(error, "Erro ao autenticar.") };
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
      permissions: undefined, // Usually admin doesn't strictly need them
    };
  }

  return {
    id: payload.id,
    name: payload.name,
    email: payload.email,
    role: payload.role,
    permissionLevel: payload.permissionLevel,
    initials: payload.initials,
    permissions: payload.permissions,
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
        permissions: target.permissions,
      },
    });

    return { success: true };
  } catch (error: unknown) {
    return { success: false, error: formatActionError(error, "Erro ao assumir usuário.") };
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
    return { success: false, error: formatActionError(error, "Erro ao sair da conta.") };
  }
}

/**
 * Trilha de auditoria da visualização.
 *
 * ponytail: o projeto não tem tabela de auditoria; o registro vai para o log
 * do servidor, que já é onde os erros de ação são registrados. Vira tabela
 * quando houver um módulo de auditoria de verdade. Nunca loga token, senha ou
 * segredo — só ids e horário.
 */
function logImpersonation(
  event: "inicio" | "fim",
  adminId: string,
  clientId: string,
): void {
  console.info(
    `[impersonation][cliente] ${event} adminId=${adminId} clientId=${clientId} at=${new Date().toISOString()}`,
  );
}

/**
 * "Ver como cliente": abre a sessão do PORTAL com a identidade efetiva do
 * cliente escolhido.
 *
 * O cookie da equipe não é tocado — o administrador continua autenticado por
 * baixo e volta ao sistema interno sem login. Nenhuma senha é lida, criada ou
 * verificada, e o Google não entra no caminho.
 */
export async function startClientImpersonationAction(
  clientId: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const payload = await readAuthSessionPayload();
    const actor = resolveActor(payload);

    if (!actor) {
      return { success: false, error: "Faça login para continuar." };
    }

    const account = await new ImpersonateClient(new PrismaClientRepository()).execute(
      {
        id: actor.id,
        name: actor.name,
        role: actor.role,
        impersonating: Boolean(payload?.impersonating),
      },
      clientId,
    );

    await createClientSession(account, { id: actor.id, name: actor.name });
    logImpersonation("inicio", actor.id, account.id);

    return { success: true };
  } catch (error: unknown) {
    if (error instanceof ImpersonationError) {
      return { success: false, error: error.message };
    }
    return {
      success: false,
      error: formatActionError(error, "Erro ao entrar como cliente."),
    };
  }
}

/**
 * Encerra a visualização e devolve o administrador ao sistema interno.
 *
 * Só derruba a sessão do portal se ela for de fato uma visualização — um
 * cliente de verdade chamando isto não é deslogado.
 */
export async function stopClientImpersonationAction(): Promise<void> {
  const session = await getClientSession();

  if (!session?.impersonatorId) {
    redirect("/cliente/painel");
  }

  logImpersonation("fim", session.impersonatorId, session.clientId);
  await destroyClientSession();
  redirect("/configuracoes");
}
