"use server";

import { PrismaClientRepository } from "@core/infra/persistence/prisma/repositories/PrismaClientRepository";
import { CreateClient } from "@core/application/clients/CreateClient";
import { ListClients } from "@core/application/clients/ListClients";
import { UpdateClient } from "@core/application/clients/UpdateClient";
import { DeleteClient } from "@core/application/clients/DeleteClient";
import { ClientProps } from "@core/domain/clients/Client";
import { requireSessionAction } from "@/app/(agendamentos)/(left-nav-bar)/_actions/auth-actions";

const clientRepository = new PrismaClientRepository();

export async function fetchClientsAction(): Promise<ClientProps[]> {
  await requireSessionAction();
  const useCase = new ListClients(clientRepository);
  const clients = await useCase.execute();
  return clients.map((c) => c.toJSON());
}

export async function createClientAction(input: {
  name: string;
  email: string;
  phone: string;
  cpf?: string;
  birthDate?: string;
  status?: "Ativo" | "Inativo";
}): Promise<{ success: boolean; data?: ClientProps; error?: string }> {
  try {
    await requireSessionAction();
    const useCase = new CreateClient(clientRepository);
    const created = await useCase.execute(input);
    return { success: true, data: created.toJSON() };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro ao cadastrar cliente.";
    return { success: false, error: message };
  }
}

export async function updateClientAction(input: {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  cpf?: string;
  birthDate?: string;
  status?: "Ativo" | "Inativo";
}): Promise<{ success: boolean; data?: ClientProps; error?: string }> {
  try {
    await requireSessionAction();
    const useCase = new UpdateClient(clientRepository);
    const updated = await useCase.execute(input);
    return { success: true, data: updated.toJSON() };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro ao atualizar cliente.";
    return { success: false, error: message };
  }
}

export async function deleteClientAction(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    await requireSessionAction();
    const useCase = new DeleteClient(clientRepository);
    await useCase.execute(id);
    return { success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro ao excluir cliente.";
    return { success: false, error: message };
  }
}
