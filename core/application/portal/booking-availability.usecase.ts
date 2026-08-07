import { AppointmentRepository } from "@core/domain/appointments/appointment.repository";
import { findAvailableStartTimes } from "@core/domain/appointments/availability.business-rule";
import { ServiceRepository } from "@core/domain/services/service.repository";
import { BookingCatalogError } from "./booking-catalog.usecase";

/** Janela de agendamento oferecida ao cliente, a partir de hoje (2 semanas). */
export const BOOKING_WINDOW_DAYS = 14;

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export interface AvailabilityRequest {
  serviceId: string;
  clientId: string;
  clientName: string;
  now?: Date;
}

export function toIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

/**
 * Disponibilidade calculada sempre no servidor, a partir dos agendamentos
 * gravados. O navegador só recebe o resultado.
 */
export class GetBookingAvailability {
  constructor(
    private appointmentRepository: AppointmentRepository,
    private serviceRepository: ServiceRepository,
  ) {}

  private async requireServiceMinutes(serviceId: string): Promise<number> {
    const service = await this.serviceRepository.findById(serviceId);
    if (!service || service.status !== "Ativo") {
      throw new BookingCatalogError("Serviço indisponível.");
    }
    return service.duration;
  }

  /** Datas (ISO) com pelo menos um horário livre dentro da janela de agendamento. */
  async listDates(request: AvailabilityRequest): Promise<string[]> {
    const now = request.now ?? new Date();
    const serviceMinutes = await this.requireServiceMinutes(request.serviceId);

    const startDate = toIsoDate(now);
    const endDate = toIsoDate(addDays(now, BOOKING_WINDOW_DAYS - 1));
    const appointments = await this.appointmentRepository.findByDateRange(
      startDate,
      endDate,
    );
    const scheduled = appointments.map((appointment) => appointment.toJSON());

    const dates: string[] = [];
    for (let offset = 0; offset < BOOKING_WINDOW_DAYS; offset += 1) {
      const date = toIsoDate(addDays(now, offset));
      const times = findAvailableStartTimes(scheduled, {
        date,
        serviceMinutes,
        clientId: request.clientId,
        clientName: request.clientName,
        now,
      });
      if (times.length > 0) {
        dates.push(date);
      }
    }

    return dates;
  }

  /** Horários livres numa data. Fonte da verdade para o passo 4 do agendamento. */
  async listTimes(request: AvailabilityRequest & { date: string }): Promise<string[]> {
    const now = request.now ?? new Date();

    if (!ISO_DATE.test(request.date)) {
      throw new BookingCatalogError("Data inválida.");
    }

    const today = toIsoDate(now);
    const lastDate = toIsoDate(addDays(now, BOOKING_WINDOW_DAYS - 1));
    if (request.date < today || request.date > lastDate) {
      return [];
    }

    const serviceMinutes = await this.requireServiceMinutes(request.serviceId);
    const dayAppointments = await this.appointmentRepository.findByDate(request.date);

    return findAvailableStartTimes(
      dayAppointments.map((appointment) => appointment.toJSON()),
      {
        date: request.date,
        serviceMinutes,
        clientId: request.clientId,
        clientName: request.clientName,
        now,
      },
    );
  }
}
