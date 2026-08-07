"use server";

import { z } from "zod";
import { ClientAccountError } from "@core/application/portal/client-account.usecase";
import {
  CompleteClientProfile,
  GetClientProfileStatus,
  type ClientProfileStatusDTO,
} from "@core/application/portal/complete-client-profile.usecase";
import { PrismaClientRepository } from "@core/infra/persistence/prisma/repositories/prisma-client.repository";
import { formatActionError } from "@/lib/action-error-handler";
import { requireClientSession } from "@/lib/client-session";
import type { PortalActionResult } from "./portal-auth-actions";

const clientRepository = new PrismaClientRepository();

/** Estado do cadastro do cliente autenticado. Só dados dele mesmo. */
export async function getClientProfileStatusAction(): Promise<ClientProfileStatusDTO> {
  const session = await requireClientSession();
  return new GetClientProfileStatus(clientRepository).execute(session.clientId);
}

const profileSchema = z.object({
  name: z.string().trim().min(3, "Informe seu nome completo"),
  phone: z
    .string()
    .trim()
    .refine((value) => value.replace(/\D/g, "").length >= 10, {
      message: "Informe um telefone válido com DDD",
    }),
  birthDate: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Informe uma data de nascimento válida"),
});

export async function completeClientProfileAction(input: {
  name: string;
  phone: string;
  birthDate: string;
}): Promise<PortalActionResult> {
  const parsed = profileSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  try {
    const session = await requireClientSession();
    await new CompleteClientProfile(clientRepository).execute({
      clientId: session.clientId,
      ...parsed.data,
    });
    return { success: true };
  } catch (error) {
    if (error instanceof ClientAccountError) {
      return { success: false, error: error.message };
    }
    return {
      success: false,
      error: formatActionError(error, "Não foi possível salvar seu cadastro."),
    };
  }
}
