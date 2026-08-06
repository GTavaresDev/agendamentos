"use server";

import { PrismaAppointmentRepository } from "@core/infra/persistence/prisma/repositories/prisma-appointment.repository";
import { CreateAppointment } from "@core/application/appointments/create-appointment.usecase";
import { ListAppointments } from "@core/application/appointments/list-appointments.usecase";
import { UpdateAppointmentStatus } from "@core/application/appointments/update-appointment-status.usecase";
import { DeleteAppointment } from "@core/application/appointments/delete-appointment.usecase";
import { AppointmentProps } from "@core/domain/appointments/appointment.entity";
import { requireSessionAction } from "@/app/(agendamentos)/(left-nav-bar)/_actions/auth-actions";
import { formatActionError } from "@/lib/action-error-handler";

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
    return { success: false, error: formatActionError(error, "Erro ao agendar.") };
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
    return { success: false, error: formatActionError(error, "Erro ao atualizar agendamento.") };
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
    return { success: false, error: formatActionError(error, "Erro ao excluir agendamento.") };
  }
}
