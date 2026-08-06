"use server";

import { PrismaClientRepository } from "@core/infra/persistence/prisma/repositories/prisma-client.repository";
import { CreateClient } from "@core/application/clients/create-client.usecase";
import { ListClients } from "@core/application/clients/list-clients.usecase";
import { UpdateClient } from "@core/application/clients/update-client.usecase";
import { DeleteClient } from "@core/application/clients/delete-client.usecase";
import { ClientProps } from "@core/domain/clients/client.entity";
import { requireSessionAction } from "@/app/(agendamentos)/(left-nav-bar)/_actions/auth-actions";
import { formatActionError } from "@/lib/action-error-handler";

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
    return { success: false, error: formatActionError(error, "Erro ao cadastrar cliente.") };
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
    return { success: false, error: formatActionError(error, "Erro ao atualizar cliente.") };
  }
}

export async function deleteClientAction(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    await requireSessionAction();
    const useCase = new DeleteClient(clientRepository);
    await useCase.execute(id);
    return { success: true };
  } catch (error: unknown) {
    return { success: false, error: formatActionError(error, "Erro ao excluir cliente.") };
  }
}
