import { Appointment } from "@core/domain/appointments/appointment.entity";
import { AppointmentRepository } from "@core/domain/appointments/appointment.repository";
import {
  ClientScheduleConflictError,
  hasClientScheduleConflict,
} from "@core/domain/appointments/client-schedule-conflict.business-rule";

export interface CreateAppointmentInput {
  date: string;
  time: string;
  name: string;
  service: string;
  duration?: string;
  status?: "Confirmado" | "Pendente" | "Concluído" | "Cancelado";
  channelId?: string;
  notes?: string;
  userId?: string;
  clientId?: string;
  serviceId?: string;
}

export class CreateAppointment {
  constructor(private appointmentRepository: AppointmentRepository) {}

  async execute(input: CreateAppointmentInput): Promise<Appointment> {
    const duration = input.duration || "30 min";
    const status = input.status || "Confirmado";
    const dayAppointments = await this.appointmentRepository.findByDate(
      input.date,
    );

    const hasConflict = hasClientScheduleConflict(
      dayAppointments.map((appointment) => appointment.toJSON()),
      {
        date: input.date,
        time: input.time,
        duration,
        name: input.name,
        clientId: input.clientId || null,
      },
    );

    if (hasConflict) {
      throw new ClientScheduleConflictError();
    }

    const initials = Appointment.generateInitials(input.name);
    const appointment = new Appointment({
      id: crypto.randomUUID(),
      date: input.date,
      time: input.time,
      name: input.name,
      service: input.service || "Consulta",
      duration,
      status,
      initials,
      channelId: input.channelId || "site",
      notes: input.notes || null,
      userId: input.userId || null,
      clientId: input.clientId || null,
      serviceId: input.serviceId || null,
    });

    return await this.appointmentRepository.save(appointment);
  }
}
