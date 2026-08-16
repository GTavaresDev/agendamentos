"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import {
  AuthenticateClient,
  ClientAccountError,
  GetClientEmailByResetToken,
  MIN_CLIENT_PASSWORD_LENGTH,
  RegisterClientAccount,
  RequestClientPasswordReset,
  ResetClientPassword,
  SetClientPassword,
} from "@core/application/portal/client-account.usecase";
import { sendPasswordResetEmail } from "@core/infra/email/resend-email-sender";
import { PrismaClientOAuthAccountRepository } from "@core/infra/persistence/prisma/repositories/prisma-client-oauth-account.repository";
import { PrismaClientPasswordResetTokenRepository } from "@core/infra/persistence/prisma/repositories/prisma-client-password-reset-token.repository";
import { PrismaClientRepository } from "@core/infra/persistence/prisma/repositories/prisma-client.repository";
import { formatActionError } from "@/lib/action-error-handler";
import {
  createClientSession,
  destroyClientSession,
  getClientSession,
  requireClientSession,
  type ClientSession,
} from "@/lib/client-session";
import { portalClientRepository } from "@/lib/portal-client-repository";
import { PORTAL_HOME_PATH, signIn as portalSignIn } from "@/portal-auth";
import { PASSWORD_NUDGE_COOKIE } from "../_components/password-nudge/password-nudge";

const clientRepository = new PrismaClientRepository();
const oauthAccountRepository = new PrismaClientOAuthAccountRepository();
const resetTokenRepository = new PrismaClientPasswordResetTokenRepository();
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://agendamentos.vercel.app";

export type PortalActionResult = { success: boolean; error?: string };

const registerSchema = z
  .object({
    name: z.string().trim().min(3, "Informe seu nome completo"),
    email: z.string().trim().toLowerCase().email("Informe um e-mail válido"),
    phone: z
      .string()
      .trim()
      .refine((value) => value.replace(/\D/g, "").length >= 10, {
        message: "Informe um telefone válido com DDD",
      }),
    password: z
      .string()
      .min(MIN_CLIENT_PASSWORD_LENGTH, `A senha deve ter pelo menos ${MIN_CLIENT_PASSWORD_LENGTH} caracteres`),
    passwordConfirmation: z.string(),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: "As senhas não conferem",
    path: ["passwordConfirmation"],
  });

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().min(1, "Informe o e-mail"),
  password: z.string().min(1, "Informe a senha"),
});

export async function registerClientAction(input: {
  name: string;
  email: string;
  phone: string;
  password: string;
  passwordConfirmation: string;
}): Promise<PortalActionResult> {
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  try {
    const account = await new RegisterClientAccount(
      clientRepository,
      oauthAccountRepository,
    ).execute({
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone,
      password: parsed.data.password,
    });
    await createClientSession(account);
    return { success: true };
  } catch (error) {
    if (error instanceof ClientAccountError) {
      return { success: false, error: error.message };
    }
    return { success: false, error: formatActionError(error, "Erro ao criar sua conta.") };
  }
}

export async function loginClientAction(input: {
  email: string;
  password: string;
}): Promise<PortalActionResult> {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "E-mail ou senha inválidos." };
  }

  try {
    const account = await new AuthenticateClient(clientRepository).execute(
      parsed.data.email,
      parsed.data.password,
    );
    await createClientSession(account);
    return { success: true };
  } catch (error) {
    if (error instanceof ClientAccountError) {
      return { success: false, error: error.message };
    }
    return { success: false, error: formatActionError(error, "Erro ao entrar.") };
  }
}

/**
 * Inicia o login com Google. Redireciona para o consentimento do Google; a
 * conta é resolvida no callback (src/portal-auth.ts) e a sessão do portal é
 * gravada lá. Nenhum segredo passa por aqui.
 */
export async function signInWithGoogleAction(): Promise<void> {
  await portalSignIn("google", { redirectTo: PORTAL_HOME_PATH });
}

/** Diz só se a conta já tem senha — nada além disso vai para a tela. */
export async function getClientAccountStatusAction(): Promise<{
  hasPassword: boolean;
}> {
  const session = await requireClientSession();
  const client = await portalClientRepository.findById(session.clientId);
  return { hasPassword: Boolean(client?.password) };
}

/**
 * Define a senha de quem entrou pelo Google e também quer o login por senha.
 * O cliente vem da sessão — o navegador não escolhe de quem é a senha.
 */
export async function setClientPasswordAction(input: {
  password: string;
  passwordConfirmation: string;
}): Promise<PortalActionResult> {
  const parsed = z
    .object({
      password: z
        .string()
        .min(
          MIN_CLIENT_PASSWORD_LENGTH,
          `A senha deve ter pelo menos ${MIN_CLIENT_PASSWORD_LENGTH} caracteres`,
        ),
      passwordConfirmation: z.string(),
    })
    .refine((data) => data.password === data.passwordConfirmation, {
      message: "As senhas não conferem",
      path: ["passwordConfirmation"],
    })
    .safeParse(input);

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  try {
    const session = await requireClientSession();
    await new SetClientPassword(clientRepository).execute(
      session.clientId,
      parsed.data.password,
    );
    return { success: true };
  } catch (error) {
    if (error instanceof ClientAccountError) {
      return { success: false, error: error.message };
    }
    return { success: false, error: formatActionError(error, "Erro ao definir sua senha.") };
  }
}

export async function logoutClientAction(): Promise<void> {
  await destroyClientSession();
  // A dispensa do convite de senha vale por sessão: sai junto com ela.
  (await cookies()).delete(PASSWORD_NUDGE_COOKIE);
  redirect("/cliente");
}

export async function getClientSessionAction(): Promise<ClientSession | null> {
  return getClientSession();
}

/**
 * Recuperação de senha.
 *
 * Sempre responde a mesma mensagem de sucesso, exista ou não o e-mail — quem
 * decide não revelar isso é o usecase (RequestClientPasswordReset). Falha no
 * envio do e-mail também não vaza para a tela.
 */
export async function requestClientPasswordResetAction(input: {
  email: string;
}): Promise<PortalActionResult> {
  const parsed = z
    .object({ email: z.string().trim().toLowerCase().email() })
    .safeParse(input);

  if (!parsed.success) {
    return { success: false, error: "Informe um e-mail válido." };
  }

  try {
    await new RequestClientPasswordReset(
      clientRepository,
      resetTokenRepository,
      sendPasswordResetEmail,
    ).execute(parsed.data.email, APP_URL);
  } catch (error) {
    console.error("[portal] falha ao processar recuperação de senha", error);
  }

  return { success: true };
}

/** Confere o token do link de redefinição e devolve o e-mail dono dele (ou null se inválido/expirado). */
export async function getClientEmailByResetTokenAction(
  token: string,
): Promise<string | null> {
  if (!token) return null;
  return new GetClientEmailByResetToken(clientRepository, resetTokenRepository).execute(token);
}

const resetPasswordSchema = z
  .object({
    token: z.string().trim().min(1),
    password: z
      .string()
      .min(MIN_CLIENT_PASSWORD_LENGTH, `A senha deve ter pelo menos ${MIN_CLIENT_PASSWORD_LENGTH} caracteres`),
    passwordConfirmation: z.string(),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: "As senhas não conferem",
    path: ["passwordConfirmation"],
  });

/** Troca a senha a partir de um token de redefinição válido — não depende de sessão. */
export async function resetClientPasswordAction(input: {
  token: string;
  password: string;
  passwordConfirmation: string;
}): Promise<PortalActionResult> {
  const parsed = resetPasswordSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  try {
    await new ResetClientPassword(clientRepository, resetTokenRepository).execute(
      parsed.data.token,
      parsed.data.password,
    );
    return { success: true };
  } catch (error) {
    if (error instanceof ClientAccountError) {
      return { success: false, error: error.message };
    }
    return { success: false, error: formatActionError(error, "Erro ao redefinir sua senha.") };
  }
}
