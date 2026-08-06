import { Appointment } from "./appointment.entity";

export class ClientScheduleConflictError extends Error {
  constructor(
    message = "Este cliente já possui um atendimento neste horário.",
  ) {
    super(message);
    this.name = "ClientScheduleConflictError";
  }
}

export type ClientScheduleAppointment = {
  id: string;
  date: string;
  time: string;
  duration: string;
  name: string;
  status: string;
  clientId?: string | null;
};

export type ClientScheduleCandidate = {
  date: string;
  time: string;
  duration: string;
  name: string;
  clientId?: string | null;
  excludeId?: string | null;
};

function normalizeName(value: string): string {
  return value.trim().toLowerCase();
}

function isSameClient(
  existing: ClientScheduleAppointment,
  candidate: Pick<ClientScheduleCandidate, "clientId" | "name">,
): boolean {
  if (candidate.clientId && existing.clientId) {
    return existing.clientId === candidate.clientId;
  }

  return normalizeName(existing.name) === normalizeName(candidate.name);
}

function slotsOverlap(left: string[], right: string[]): boolean {
  const occupied = new Set(left);
  return right.some((slot) => occupied.has(slot));
}

/**
 * Um cliente não pode estar vinculado a dois atendimentos
 * no mesmo dia com intervalos (slots) sobrepostos.
 */
export function hasClientScheduleConflict(
  existingAppointments: ClientScheduleAppointment[],
  candidate: ClientScheduleCandidate,
): boolean {
  const candidateSlots = Appointment.getOccupiedSlots(
    candidate.time,
    candidate.duration,
  );

  if (candidateSlots.length === 0) {
    return false;
  }

  for (const appointment of existingAppointments) {
    if (candidate.excludeId && appointment.id === candidate.excludeId) {
      continue;
    }

    if (appointment.status === "Cancelado") {
      continue;
    }

    if (appointment.date !== candidate.date) {
      continue;
    }

    if (!isSameClient(appointment, candidate)) {
      continue;
    }

    const existingSlots = Appointment.getOccupiedSlots(
      appointment.time,
      appointment.duration,
    );

    if (slotsOverlap(existingSlots, candidateSlots)) {
      return true;
    }
  }

  return false;
}
