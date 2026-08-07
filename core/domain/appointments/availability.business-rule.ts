import { Appointment } from "./appointment.entity";
import { durationLabelFromMinutes, startTimesThatFit } from "./appointment-duration";
import { isBookingTimeExpired } from "./booking-time.business-rule";
import {
  hasClientScheduleConflict,
  type ClientScheduleAppointment,
} from "./client-schedule-conflict.business-rule";

export interface AvailabilityQuery {
  date: string;
  serviceMinutes: number;
  clientId: string;
  clientName: string;
  now?: Date;
}

/**
 * Horários em que um atendimento de `serviceMinutes` cabe inteiro na agenda.
 *
 * Reaproveita as regras já vigentes na agenda interna:
 * - blocos de 30 min ocupados por agendamentos não cancelados (a ocupação é da
 *   clínica, não por profissional — é assim que a agenda interna bloqueia);
 * - tolerância de 5 min para horários do dia corrente (sem retroativo);
 * - o cliente não pode ter dois atendimentos sobrepostos.
 */
export function findAvailableStartTimes(
  appointments: ClientScheduleAppointment[],
  query: AvailabilityQuery,
): string[] {
  const now = query.now ?? new Date();
  const duration = durationLabelFromMinutes(query.serviceMinutes);
  const dayAppointments = appointments.filter(
    (appointment) => appointment.date === query.date,
  );

  const occupied = new Set<string>();
  for (const appointment of dayAppointments) {
    if (appointment.status === "Cancelado") continue;
    for (const slot of Appointment.getOccupiedSlots(appointment.time, appointment.duration)) {
      occupied.add(slot);
    }
  }

  return startTimesThatFit(query.serviceMinutes).filter((time) => {
    if (isBookingTimeExpired(query.date, time, now)) {
      return false;
    }

    const required = Appointment.getOccupiedSlots(time, duration);
    if (required.length === 0 || required.some((slot) => occupied.has(slot))) {
      return false;
    }

    return !hasClientScheduleConflict(dayAppointments, {
      date: query.date,
      time,
      duration,
      name: query.clientName,
      clientId: query.clientId,
    });
  });
}
