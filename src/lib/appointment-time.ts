export const BOOKING_TOLERANCE_MINUTES = 5;

/**
 * Retorna true quando o horário já passou da tolerância de agendamento.
 * Ex.: 14:00 permanece reservável até 14:05; depois disso fica indisponível.
 */
export function isBookingTimeExpired(
  dateIso: string,
  time: string,
  now: Date = new Date(),
  toleranceMinutes: number = BOOKING_TOLERANCE_MINUTES,
): boolean {
  const [year, month, day] = dateIso.split("-").map(Number);
  const [hours, minutes] = time.split(":").map(Number);

  if (
    Number.isNaN(year) ||
    Number.isNaN(month) ||
    Number.isNaN(day) ||
    Number.isNaN(hours) ||
    Number.isNaN(minutes)
  ) {
    return true;
  }

  const slotStart = new Date(year, month - 1, day, hours, minutes, 0, 0);
  const deadline = new Date(
    slotStart.getTime() + toleranceMinutes * 60 * 1000,
  );

  return now.getTime() > deadline.getTime();
}
