import { AppointmentRepository } from "@core/domain/appointments/AppointmentRepository";

export class DeleteAppointment {
  constructor(private appointmentRepository: AppointmentRepository) {}

  async execute(id: string): Promise<void> {
    const existing = await this.appointmentRepository.findById(id);
    if (!existing) {
      throw new Error("Agendamento não encontrado.");
    }
    await this.appointmentRepository.delete(id);
  }
}
