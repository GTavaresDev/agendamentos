import { ServiceRepository } from "../../domain/services/service.repository";
import { AppointmentRepository } from "../../domain/appointments/appointment.repository";

export class DeleteService {
  constructor(
    private serviceRepository: ServiceRepository,
    private appointmentRepository: AppointmentRepository,
  ) {}

  async execute(id: string): Promise<void> {
    const service = await this.serviceRepository.findById(id);
    if (!service) {
      throw new Error("Serviço não encontrado.");
    }

    const appointments = await this.appointmentRepository.findAll();
    const hasAppointments = appointments.some((a) => a.serviceId === id);

    if (hasAppointments) {
      throw new Error(
        "Não é possível deletar este serviço pois existem agendamentos vinculados. Considere marcar como inativo.",
      );
    }

    await this.serviceRepository.delete(id);
  }
}
