"use server";

import { PrismaServiceRepository } from "@core/infra/persistence/prisma/repositories/PrismaServiceRepository";
import { PrismaAppointmentRepository } from "@core/infra/persistence/prisma/repositories/PrismaAppointmentRepository";
import { CreateService } from "@core/application/services/CreateService";
import { ListServices } from "@core/application/services/ListServices";
import { UpdateService } from "@core/application/services/UpdateService";
import { DeleteService } from "@core/application/services/DeleteService";
import { ServiceProps } from "@core/domain/services/Service";
import { requireSessionAction } from "@/app/(agendamentos)/(left-nav-bar)/_actions/auth-actions";

const serviceRepository = new PrismaServiceRepository();
const appointmentRepository = new PrismaAppointmentRepository();

export async function fetchServicesAction(): Promise<ServiceProps[]> {
  await requireSessionAction();
  const useCase = new ListServices(serviceRepository);
  const services = await useCase.execute();
  return services.map((s) => s.toJSON());
}

export async function createServiceAction(input: {
  name: string;
  duration: number;
  description?: string;
  price?: number;
  status?: "Ativo" | "Inativo";
  color?: string;
}): Promise<{ success: boolean; data?: ServiceProps; error?: string }> {
  try {
    await requireSessionAction();
    const useCase = new CreateService(serviceRepository);
    const created = await useCase.execute(input);
    return { success: true, data: created.toJSON() };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro ao cadastrar serviço.";
    return { success: false, error: message };
  }
}

export async function updateServiceAction(input: {
  id: string;
  name?: string;
  duration?: number;
  description?: string;
  price?: number;
  status?: "Ativo" | "Inativo";
  color?: string;
}): Promise<{ success: boolean; data?: ServiceProps; error?: string }> {
  try {
    await requireSessionAction();
    const useCase = new UpdateService(serviceRepository);
    const updated = await useCase.execute(input);
    return { success: true, data: updated.toJSON() };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro ao atualizar serviço.";
    return { success: false, error: message };
  }
}

export async function deleteServiceAction(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    await requireSessionAction();
    const useCase = new DeleteService(serviceRepository, appointmentRepository);
    await useCase.execute(id);
    return { success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro ao excluir serviço.";
    return { success: false, error: message };
  }
}
