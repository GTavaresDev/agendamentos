import { ALL_TIMES } from "./appointment.entity";

/** Rótulos aceitos por Appointment.getOccupiedSlots (1, 2 ou 3 slots de 30 min). */
const DURATION_LABELS = ["30 min", "60 min (1h)", "90 min (1h30)"] as const;

export const SLOT_MINUTES = 30;
export const MAX_SLOTS_PER_APPOINTMENT = DURATION_LABELS.length;

/**
 * Converte a duração do serviço (minutos) no rótulo de duração usado pelos
 * agendamentos. A agenda trabalha em blocos de 30 min, então arredonda para
 * cima: 45 min ocupa 2 blocos.
 */
export function durationLabelFromMinutes(minutes: number): string {
  const slots = slotsFromMinutes(minutes);
  return DURATION_LABELS[slots - 1];
}

export function slotsFromMinutes(minutes: number): number {
  const slots = Math.ceil((minutes || SLOT_MINUTES) / SLOT_MINUTES);
  // ponytail: a agenda só modela 1–3 blocos; serviços acima de 90 min ocupam 3.
  return Math.min(Math.max(slots, 1), MAX_SLOTS_PER_APPOINTMENT);
}

/**
 * Horários em que um atendimento de `minutes` cabe inteiro no expediente,
 * ou seja, existem blocos consecutivos suficientes até o fim do dia.
 */
export function startTimesThatFit(minutes: number): string[] {
  const slots = slotsFromMinutes(minutes);
  return ALL_TIMES.filter((_, index) => index + slots <= ALL_TIMES.length);
}
