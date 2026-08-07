import { UpdateAppointmentStatus } from "@core/application/appointments/update-appointment-status.usecase";
import { Appointment } from "@core/domain/appointments/appointment.entity";
import { AppointmentRepository } from "@core/domain/appointments/appointment.repository";
import { canClientCancelAppointment } from "@core/domain/appointments/client-cancellation.business-rule";

/**
 * Agendamento na visão do cliente.
 *
 * Não expõe preço, notas internas, canal, cargo do profissional, ids de
 * usuário/serviço nem qualquer dado operacional.
 */
export interface ClientAppointmentDTO {
  id: string;
  date: string;
  time: string;
  serviceName: string;
  duration: string;
  professionalName: string | null;
  status: "Confirmado" | "Pendente" | "Concluído" | "Cancelado";
  canCancel: boolean;
}

export class ClientAppointmentError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ClientAppointmentError";
  }
}

/** "60 min (1h)" → "60 min" */
function shortDuration(duration: string): string {
  return duration.replace(/\s*\(.*\)\s*/, "").trim();
}

export function toClientAppointmentDTO(
  appointment: Appointment,
  now: Date = new Date(),
): ClientAppointmentDTO {
  return {
    id: appointment.id,
    date: appointment.date,
    time: appointment.time,
    serviceName: appointment.service || "Atendimento",
    duration: shortDuration(appointment.duration),
    professionalName: appointment.userName ?? null,
    status: appointment.status,
    canCancel: canClientCancelAppointment(
      { date: appointment.date, time: appointment.time, status: appointment.status },
      now,
    ).allowed,
  };
}

function sortKey(appointment: ClientAppointmentDTO): string {
  return `${appointment.date}T${appointment.time}`;
}

function nowKey(now: Date): string {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export interface ClientAppointmentsView {
  upcoming: ClientAppointmentDTO[];
  past: ClientAppointmentDTO[];
  next: ClientAppointmentDTO | null;
}

export class ListClientAppointments {
  constructor(private appointmentRepository: AppointmentRepository) {}

  async execute(clientId: string, now: Date = new Date()): Promise<ClientAppointmentsView> {
    const appointments = await this.appointmentRepository.findByClientId(clientId);
    const all = appointments.map((appointment) => toClientAppointmentDTO(appointment, now));
    const reference = nowKey(now);

    const upcoming = all
      .filter((appointment) => sortKey(appointment) >= reference)
      .sort((a, b) => sortKey(a).localeCompare(sortKey(b)));

    const past = all
      .filter((appointment) => sortKey(appointment) < reference)
      .sort((a, b) => sortKey(b).localeCompare(sortKey(a)));

    const next =
      upcoming.find((appointment) => appointment.status !== "Cancelado") ?? null;

    return { upcoming, past, next };
  }
}

export class GetClientAppointment {
  constructor(private appointmentRepository: AppointmentRepository) {}

  async execute(
    id: string,
    clientId: string,
    now: Date = new Date(),
  ): Promise<ClientAppointmentDTO | null> {
    // A posse é parte da consulta — nunca um findById seguido de comparação.
    const appointment = await this.appointmentRepository.findByIdAndClientId(id, clientId);
    return appointment ? toClientAppointmentDTO(appointment, now) : null;
  }
}

export class CancelClientAppointment {
  constructor(private appointmentRepository: AppointmentRepository) {}

  async execute(
    id: string,
    clientId: string,
    now: Date = new Date(),
  ): Promise<ClientAppointmentDTO> {
    const appointment = await this.appointmentRepository.findByIdAndClientId(id, clientId);
    if (!appointment) {
      throw new ClientAppointmentError("Agendamento não encontrado.");
    }

    const check = canClientCancelAppointment(
      { date: appointment.date, time: appointment.time, status: appointment.status },
      now,
    );
    if (!check.allowed) {
      throw new ClientAppointmentError(check.reason ?? "Não é possível cancelar este agendamento.");
    }

    const updated = await new UpdateAppointmentStatus(this.appointmentRepository).execute(
      appointment.id,
      "Cancelado",
    );

    return toClientAppointmentDTO(updated, now);
  }
}
