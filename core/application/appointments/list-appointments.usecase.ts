import { Appointment } from "@core/domain/appointments/appointment.entity";
import { AppointmentRepository } from "@core/domain/appointments/appointment.repository";

export interface ListAppointmentsFilter {
  date?: string;
  search?: string;
  status?: string;
}

export class ListAppointments {
  constructor(private appointmentRepository: AppointmentRepository) {}

  async execute(filter?: ListAppointmentsFilter): Promise<Appointment[]> {
    let list: Appointment[];
    if (filter?.date) {
      list = await this.appointmentRepository.findByDate(filter.date);
    } else {
      list = await this.appointmentRepository.findAll();
    }

    if (filter?.search) {
      const term = filter.search.toLowerCase();
      list = list.filter(
        (a) =>
          a.name.toLowerCase().includes(term) ||
          a.service?.toLowerCase().includes(term),
      );
    }

    if (filter?.status && filter.status !== "Todos") {
      list = list.filter((a) => a.status === filter.status);
    }

    return list;
  }
}
