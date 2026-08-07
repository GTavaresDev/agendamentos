"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import {
  AuthenticateClient,
  ClientAccountError,
  MIN_CLIENT_PASSWORD_LENGTH,
  RegisterClientAccount,
} from "@core/application/portal/client-account.usecase";
import { PrismaClientRepository } from "@core/infra/persistence/prisma/repositories/prisma-client.repository";
import { formatActionError } from "@/lib/action-error-handler";
import {
  createClientSession,
  destroyClientSession,
  getClientSession,
  type ClientSession,
} from "@/lib/client-session";

const clientRepository = new PrismaClientRepository();

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
    const account = await new RegisterClientAccount(clientRepository).execute({
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

export async function logoutClientAction(): Promise<void> {
  await destroyClientSession();
  redirect("/cliente/login");
}

export async function getClientSessionAction(): Promise<ClientSession | null> {
  return getClientSession();
}

/**
 * Recuperação de senha.
 *
 * ponytail: a aplicação ainda não tem provedor de e-mail, então a ação valida
 * a entrada e responde sempre a mesma mensagem (sem revelar se o e-mail
 * existe). O envio do link com token entra aqui quando houver e-mail
 * transacional configurado — nada de mostrar token na tela.
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

  console.info("[portal] recuperação de senha solicitada");
  return { success: true };
}
