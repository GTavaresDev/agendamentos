import { AppointmentProps } from "@core/domain/appointments/appointment.entity";

function normalizeName(value: string): string {
  return value.trim().toLowerCase();
}

function appointmentSortKey(appointment: AppointmentProps): string {
  return `${appointment.date}T${appointment.time}`;
}

export function getLastAppointmentForClient(
  appointments: AppointmentProps[],
  client: { id?: string; name: string },
): AppointmentProps | null {
  const clientId = client.id;
  const clientName = normalizeName(client.name);

  const matches = appointments.filter((appointment) => {
    if (appointment.status === "Cancelado") {
      return false;
    }

    if (clientId && appointment.clientId === clientId) {
      return true;
    }

    return normalizeName(appointment.name) === clientName;
  });

  if (matches.length === 0) {
    return null;
  }

  const sorted = [...matches].sort((a, b) =>
    appointmentSortKey(b).localeCompare(appointmentSortKey(a)),
  );

  return sorted[0] ?? null;
}

export function formatAppointmentRelativeLabel(
  appointment: AppointmentProps,
  now: Date = new Date(),
): string {
  const [year, month, day] = appointment.date.split("-").map(Number);
  if (Number.isNaN(year) || Number.isNaN(month) || Number.isNaN(day)) {
    return `${appointment.date}, ${appointment.time}`;
  }

  const appointmentDay = new Date(year, month - 1, day);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  const sameDay =
    appointmentDay.getFullYear() === today.getFullYear() &&
    appointmentDay.getMonth() === today.getMonth() &&
    appointmentDay.getDate() === today.getDate();

  if (sameDay) {
    return `Hoje, ${appointment.time}`;
  }

  const isYesterday =
    appointmentDay.getFullYear() === yesterday.getFullYear() &&
    appointmentDay.getMonth() === yesterday.getMonth() &&
    appointmentDay.getDate() === yesterday.getDate();

  if (isYesterday) {
    return `Ontem, ${appointment.time}`;
  }

  const formattedDate = appointmentDay.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
  });

  return `${formattedDate}, ${appointment.time}`;
}
