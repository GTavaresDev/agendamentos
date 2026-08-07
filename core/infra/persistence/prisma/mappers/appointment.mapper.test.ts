import { describe, expect, it } from "vitest";
import { AppointmentMapper } from "./appointment.mapper";

const rawBase = {
  id: "a1",
  date: "2026-08-06",
  time: "09:00",
  name: "Maria Silva",
  service: "Corte",
  duration: "30 min",
  status: "Confirmado",
  initials: "MS",
  channelId: "site",
  notes: null,
  userId: null,
  clientId: null,
  serviceId: null,
  createdAt: new Date("2026-01-01"),
  updatedAt: new Date("2026-01-02"),
};

describe("AppointmentMapper.toDomain", () => {
  it("maps relation fields when present", () => {
    const appointment = AppointmentMapper.toDomain({
      ...rawBase,
      user: { name: "João", role: "Gestor" },
      serviceRecord: { price: 60, color: "#fff" },
    });

    expect(appointment.userName).toBe("João");
    expect(appointment.userRole).toBe("Gestor");
    expect(appointment.servicePrice).toBe(60);
    expect(appointment.serviceColor).toBe("#fff");
  });

  it("defaults relation fields to null when absent", () => {
    const appointment = AppointmentMapper.toDomain(rawBase);

    expect(appointment.userName).toBeNull();
    expect(appointment.userRole).toBeNull();
    expect(appointment.servicePrice).toBeNull();
    expect(appointment.serviceColor).toBeNull();
  });
});

describe("AppointmentMapper.toPersistence", () => {
  it("normalizes optional fields to null and strips relation fields", () => {
    const appointment = AppointmentMapper.toDomain(rawBase);
    const raw = AppointmentMapper.toPersistence(appointment);

    expect(raw).toEqual({
      id: "a1",
      date: "2026-08-06",
      time: "09:00",
      name: "Maria Silva",
      service: "Corte",
      duration: "30 min",
      status: "Confirmado",
      initials: "MS",
      channelId: "site",
      notes: null,
      userId: null,
      clientId: null,
      serviceId: null,
    });
  });
});
