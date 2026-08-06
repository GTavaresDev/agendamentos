import type { AppointmentProps } from "@core/domain/appointments/appointment.entity";

export function appointmentAttendantLabel(
  appointment: Pick<AppointmentProps, "userName">,
): string {
  if (appointment.userName) {
    return appointment.userName;
  }
  return "—";
}
