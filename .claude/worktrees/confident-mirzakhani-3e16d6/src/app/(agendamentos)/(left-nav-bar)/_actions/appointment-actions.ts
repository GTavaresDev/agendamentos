"use server";

import { PrismaAppointmentRepository } from "@core/infra/persistence/prisma/repositories/PrismaAppointmentRepository";
import { CreateAppointment } from "@core/application/appointments/CreateAppointment";
import { ListAppointments } from "@core/application/appointments/ListAppointments";
import { UpdateAppointmentStatus } from "@core/application/appointments/UpdateAppointmentStatus";
import { DeleteAppointment } from "@core/application/appointments/DeleteAppointment";
import { AppointmentProps } from "@core/domain/appointments/Appointment";
import { requireSessionAction } from "@/app/(agendamentos)/(left-nav-bar)/_actions/auth-actions";

const appointmentRepository = new PrismaAppointmentRepository();

export async function fetchAppointmentsAction(filter?: {
  date?: string;
  search?: string;
  status?: string;
}): Promise<AppointmentProps[]> {
  await requireSessionAction();
  const useCase = new ListAppointments(appointmentRepository);
  const list = await useCase.execute(filter);
  return list.map((a) => a.toJSON());
}

export async function createAppointmentAction(input: {
  date: string;
  time: string;
  name: string;
  service: string;
  duration?: string;
  status?: "Confirmado" | "Pendente" | "Concluído" | "Cancelado";
  channelId?: string;
  notes?: string;
  clientId?: string;
  serviceId?: string;
}): Promise<{ success: boolean; data?: AppointmentProps; error?: string }> {
  try {
    const session = await requireSessionAction();
    const useCase = new CreateAppointment(appointmentRepository);
    const created = await useCase.execute({
      ...input,
      userId: session.id,
    });
    return { success: true, data: created.toJSON() };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro ao agendar.";
    return { success: false, error: message };
  }
}

export async function updateAppointmentStatusAction(
  id: string,
  status: "Confirmado" | "Pendente" | "Concluído" | "Cancelado",
): Promise<{ success: boolean; data?: AppointmentProps; error?: string }> {
  try {
    await requireSessionAction();
    const useCase = new UpdateAppointmentStatus(appointmentRepository);
    const updated = await useCase.execute(id, status);
    return { success: true, data: updated.toJSON() };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro ao atualizar agendamento.";
    return { success: false, error: message };
  }
}

export async function deleteAppointmentAction(
  id: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireSessionAction();
    const useCase = new DeleteAppointment(appointmentRepository);
    await useCase.execute(id);
    return { success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro ao excluir agendamento.";
    return { success: false, error: message };
  }
}
