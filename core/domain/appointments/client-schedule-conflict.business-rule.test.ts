import { describe, expect, it } from "vitest";
import {
  hasClientScheduleConflict,
  type ClientScheduleAppointment,
} from "./client-schedule-conflict.business-rule";

const existing = (overrides: Partial<ClientScheduleAppointment> = {}): ClientScheduleAppointment => ({
  id: "a1",
  date: "2026-08-06",
  time: "09:00",
  duration: "30 min",
  name: "Maria Silva",
  status: "Confirmado",
  clientId: "c1",
  ...overrides,
});

describe("hasClientScheduleConflict", () => {
  it("detects an overlap for the same client on the same day/slot", () => {
    const result = hasClientScheduleConflict([existing()], {
      date: "2026-08-06",
      time: "09:00",
      duration: "30 min",
      name: "Maria Silva",
      clientId: "c1",
    });
    expect(result).toBe(true);
  });

  it("matches by normalized name when clientId is absent", () => {
    const result = hasClientScheduleConflict(
      [existing({ clientId: null })],
      {
        date: "2026-08-06",
        time: "09:00",
        duration: "30 min",
        name: "  MARIA silva  ",
      },
    );
    expect(result).toBe(true);
  });

  it("ignores different clients even with the same name-normalized mismatch", () => {
    const result = hasClientScheduleConflict([existing({ clientId: "c1" })], {
      date: "2026-08-06",
      time: "09:00",
      duration: "30 min",
      name: "Maria Silva",
      clientId: "c2",
    });
    expect(result).toBe(false);
  });

  it("ignores appointments on a different day", () => {
    const result = hasClientScheduleConflict([existing({ date: "2026-08-05" })], {
      date: "2026-08-06",
      time: "09:00",
      duration: "30 min",
      name: "Maria Silva",
      clientId: "c1",
    });
    expect(result).toBe(false);
  });

  it("ignores cancelled appointments", () => {
    const result = hasClientScheduleConflict([existing({ status: "Cancelado" })], {
      date: "2026-08-06",
      time: "09:00",
      duration: "30 min",
      name: "Maria Silva",
      clientId: "c1",
    });
    expect(result).toBe(false);
  });

  it("excludes the appointment being updated via excludeId", () => {
    const result = hasClientScheduleConflict([existing({ id: "a1" })], {
      date: "2026-08-06",
      time: "09:00",
      duration: "30 min",
      name: "Maria Silva",
      clientId: "c1",
      excludeId: "a1",
    });
    expect(result).toBe(false);
  });

  it("detects overlap when a longer duration slot overlaps a shorter one", () => {
    const result = hasClientScheduleConflict([existing({ time: "09:00", duration: "30 min" })], {
      date: "2026-08-06",
      time: "08:30",
      duration: "60 min",
      name: "Maria Silva",
      clientId: "c1",
    });
    expect(result).toBe(true);
  });

  it("returns false when the candidate slots don't overlap", () => {
    const result = hasClientScheduleConflict([existing({ time: "09:00", duration: "30 min" })], {
      date: "2026-08-06",
      time: "10:00",
      duration: "30 min",
      name: "Maria Silva",
      clientId: "c1",
    });
    expect(result).toBe(false);
  });

  it("returns false for an invalid/unknown candidate start time", () => {
    const result = hasClientScheduleConflict([existing()], {
      date: "2026-08-06",
      time: "23:59",
      duration: "30 min",
      name: "Maria Silva",
      clientId: "c1",
    });
    expect(result).toBe(false);
  });

  it("returns false with no existing appointments", () => {
    const result = hasClientScheduleConflict([], {
      date: "2026-08-06",
      time: "09:00",
      duration: "30 min",
      name: "Maria Silva",
      clientId: "c1",
    });
    expect(result).toBe(false);
  });
});
