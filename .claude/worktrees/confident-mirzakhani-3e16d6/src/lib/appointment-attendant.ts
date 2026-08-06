import type { AppointmentProps } from "@core/domain/appointments/Appointment";

export function appointmentAttendantLabel(
  appointment: Pick<AppointmentProps, "userName">,
): string {
  if (appointment.userName) {
    return appointment.userName;
  }
  return "—";
}
