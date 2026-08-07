import { vi, type Mocked } from "vitest";
import { Appointment, type AppointmentProps } from "@core/domain/appointments/appointment.entity";
import type { AppointmentRepository } from "@core/domain/appointments/appointment.repository";

export function buildAppointment(overrides: Partial<AppointmentProps> = {}): Appointment {
  return new Appointment({
    id: "a1",
    date: "2026-08-06",
    time: "09:00",
    name: "Maria Silva",
    service: "Corte",
    duration: "30 min",
    status: "Confirmado",
    initials: "MS",
    channelId: "site",
    ...overrides,
  });
}

export function mockAppointmentRepository(): Mocked<AppointmentRepository> {
  return {
    findAll: vi.fn(),
    findByDate: vi.fn(),
    findById: vi.fn(),
    save: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  } as unknown as Mocked<AppointmentRepository>;
}
