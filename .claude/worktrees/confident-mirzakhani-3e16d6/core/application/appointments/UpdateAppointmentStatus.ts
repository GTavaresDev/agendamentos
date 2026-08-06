import { Appointment } from "@core/domain/appointments/Appointment";
import { AppointmentRepository } from "@core/domain/appointments/AppointmentRepository";

export class UpdateAppointmentStatus {
  constructor(private appointmentRepository: AppointmentRepository) {}

  async execute(
    id: string,
    status: "Confirmado" | "Pendente" | "Concluído" | "Cancelado",
  ): Promise<Appointment> {
    const existing = await this.appointmentRepository.findById(id);
    if (!existing) {
      throw new Error("Agendamento não encontrado.");
    }

    const updated = new Appointment({
      id: existing.id,
      date: existing.date,
      time: existing.time,
      name: existing.name,
      service: existing.service,
      duration: existing.duration,
      status,
      initials: existing.initials,
      channelId: existing.channelId,
      notes: existing.notes,
      userId: existing.userId,
      clientId: existing.clientId,
      userName: existing.userName,
      userRole: existing.userRole,
      createdAt: existing.createdAt,
    });

    return await this.appointmentRepository.update(updated);
  }
}
