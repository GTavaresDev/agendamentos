import { Appointment } from "./appointment.entity";

export interface AppointmentRepository {
  findAll(): Promise<Appointment[]>;
  findByDate(date: string): Promise<Appointment[]>;
  /** Intervalo fechado de datas ISO (yyyy-mm-dd), usado pelo cálculo de disponibilidade. */
  findByDateRange(startDate: string, endDate: string): Promise<Appointment[]>;
  findById(id: string): Promise<Appointment | null>;
  findByClientId(clientId: string): Promise<Appointment[]>;
  /** Busca com posse obrigatória: só retorna se o agendamento pertencer ao cliente. */
  findByIdAndClientId(id: string, clientId: string): Promise<Appointment | null>;
  save(appointment: Appointment): Promise<Appointment>;
  update(appointment: Appointment): Promise<Appointment>;
  delete(id: string): Promise<void>;
}
