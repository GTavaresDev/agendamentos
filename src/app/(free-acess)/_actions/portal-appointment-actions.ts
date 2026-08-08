"use server";

import { revalidatePath } from "next/cache";
import {
  CancelClientAppointment,
  ClientAppointmentError,
  GetClientAppointment,
  ListClientAppointments,
  type ClientAppointmentDTO,
  type ClientAppointmentsView,
} from "@core/application/portal/client-appointments.usecase";
import { PrismaAppointmentRepository } from "@core/infra/persistence/prisma/repositories/prisma-appointment.repository";
import { formatActionError } from "@/lib/action-error-handler";
import { requireClientSession } from "@/lib/client-session";

const appointmentRepository = new PrismaAppointmentRepository();

/** Só os agendamentos do cliente autenticado — o filtro é da consulta. */
export async function getClientAppointmentsAction(): Promise<ClientAppointmentsView> {
  const session = await requireClientSession();
  return new ListClientAppointments(appointmentRepository).execute(session.clientId);
}

export async function getClientAppointmentAction(
  id: string,
): Promise<ClientAppointmentDTO | null> {
  const session = await requireClientSession();
  return new GetClientAppointment(appointmentRepository).execute(id, session.clientId);
}

export async function cancelClientAppointmentAction(
  id: string,
): Promise<{ success: boolean; data?: ClientAppointmentDTO; error?: string }> {
  try {
    const session = await requireClientSession();
    const cancelled = await new CancelClientAppointment(appointmentRepository).execute(
      id,
      session.clientId,
    );

    revalidatePath("/cliente/painel/meus-agendamentos");
    revalidatePath("/cliente/painel");
    return { success: true, data: cancelled };
  } catch (error) {
    if (error instanceof ClientAppointmentError) {
      return { success: false, error: error.message };
    }
    return { success: false, error: formatActionError(error, "Erro ao cancelar agendamento.") };
  }
}
