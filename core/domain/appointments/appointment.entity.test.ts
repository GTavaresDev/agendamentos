import { describe, expect, it } from "vitest";
import { Appointment, type AppointmentProps } from "./appointment.entity";

const props = (overrides: Partial<AppointmentProps> = {}): AppointmentProps => ({
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

describe("Appointment validation", () => {
  it("rejects an empty client name", () => {
    expect(() => new Appointment(props({ name: "" }))).toThrow(/Nome/);
  });

  it("rejects a missing time", () => {
    expect(() => new Appointment(props({ time: "" }))).toThrow(/Horário/);
  });

  it("accepts valid props", () => {
    expect(() => new Appointment(props())).not.toThrow();
  });
});

describe("Appointment.generateInitials", () => {
  it("uses first+last initial for multi-word names", () => {
    expect(Appointment.generateInitials("Maria Silva")).toBe("MS");
  });

  it("falls back to A for an empty name", () => {
    expect(Appointment.generateInitials("   ")).toBe("A");
  });
});

describe("Appointment.getOccupiedSlots", () => {
  it("returns a single slot for a default 30 min duration", () => {
    expect(Appointment.getOccupiedSlots("09:00", "30 min")).toEqual(["09:00"]);
  });

  it("returns two slots for a 60 min duration", () => {
    expect(Appointment.getOccupiedSlots("09:00", "60 min")).toEqual(["09:00", "09:30"]);
  });

  it("returns three slots for a 90 min duration", () => {
    expect(Appointment.getOccupiedSlots("09:00", "90 min")).toEqual([
      "09:00",
      "09:30",
      "10:00",
    ]);
  });

  it("returns an empty array for an unknown start time", () => {
    expect(Appointment.getOccupiedSlots("23:59", "30 min")).toEqual([]);
  });

  it("truncates slots that run past the end of the day", () => {
    expect(Appointment.getOccupiedSlots("17:30", "90 min")).toEqual(["17:30"]);
  });
});
