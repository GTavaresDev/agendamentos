import { Appointment } from "./appointment.entity";

export interface AppointmentRepository {
  findAll(): Promise<Appointment[]>;
  findByDate(date: string): Promise<Appointment[]>;
  findById(id: string): Promise<Appointment | null>;
  save(appointment: Appointment): Promise<Appointment>;
  update(appointment: Appointment): Promise<Appointment>;
  delete(id: string): Promise<void>;
}
