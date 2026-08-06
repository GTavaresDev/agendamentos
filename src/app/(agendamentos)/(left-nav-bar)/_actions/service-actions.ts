"use server";

import { PrismaServiceRepository } from "@core/infra/persistence/prisma/repositories/prisma-service.repository";
import { PrismaAppointmentRepository } from "@core/infra/persistence/prisma/repositories/prisma-appointment.repository";
import { CreateService } from "@core/application/services/create-service.usecase";
import { ListServices } from "@core/application/services/list-services.usecase";
import { UpdateService } from "@core/application/services/update-service.usecase";
import { DeleteService } from "@core/application/services/delete-service.usecase";
import { ServiceProps } from "@core/domain/services/service.entity";
import { requireSessionAction } from "@/app/(agendamentos)/(left-nav-bar)/_actions/auth-actions";
import { formatActionError } from "@/lib/action-error-handler";

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
    return { success: false, error: formatActionError(error, "Erro ao cadastrar serviço.") };
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
    return { success: false, error: formatActionError(error, "Erro ao atualizar serviço.") };
  }
}

export async function deleteServiceAction(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    await requireSessionAction();
    const useCase = new DeleteService(serviceRepository, appointmentRepository);
    await useCase.execute(id);
    return { success: true };
  } catch (error: unknown) {
    return { success: false, error: formatActionError(error, "Erro ao excluir serviço.") };
  }
}
