import { describe, expect, it } from "vitest";
import { findAvailableStartTimes } from "./availability.business-rule";
import type { ClientScheduleAppointment } from "./client-schedule-conflict.business-rule";

const DATE = "2026-08-15";
// Antes do expediente: nenhum horário do dia expirou ainda.
const MORNING = new Date(2026, 7, 15, 7, 0, 0);

function appointment(
  overrides: Partial<ClientScheduleAppointment> = {},
): ClientScheduleAppointment {
  return {
    id: "a1",
    date: DATE,
    time: "15:00",
    duration: "30 min",
    name: "Outro Cliente",
    status: "Confirmado",
    clientId: "outro",
    ...overrides,
  };
}

const client = { clientId: "c1", clientName: "Maria Silva" };

describe("findAvailableStartTimes", () => {
  it("libera a agenda inteira quando não há nada marcado", () => {
    const times = findAvailableStartTimes([], {
      date: DATE,
      serviceMinutes: 30,
      now: MORNING,
      ...client,
    });

    expect(times).toContain("08:00");
    expect(times).toContain("17:30");
  });

  it("bloqueia o bloco já ocupado", () => {
    const times = findAvailableStartTimes([appointment({ time: "15:00" })], {
      date: DATE,
      serviceMinutes: 30,
      now: MORNING,
      ...client,
    });

    expect(times).not.toContain("15:00");
    expect(times).toContain("15:30");
  });

  it("exige a duração inteira livre: 45 min às 14:30 não cabe com atendimento às 15:00", () => {
    const times = findAvailableStartTimes([appointment({ time: "15:00" })], {
      date: DATE,
      serviceMinutes: 45,
      now: MORNING,
      ...client,
    });

    expect(times).not.toContain("14:30");
    expect(times).toContain("13:00");
  });

  it("ignora agendamentos cancelados", () => {
    const times = findAvailableStartTimes(
      [appointment({ time: "15:00", status: "Cancelado" })],
      { date: DATE, serviceMinutes: 30, now: MORNING, ...client },
    );

    expect(times).toContain("15:00");
  });

  it("ignora agendamentos de outras datas", () => {
    const times = findAvailableStartTimes(
      [appointment({ time: "15:00", date: "2026-08-16" })],
      { date: DATE, serviceMinutes: 30, now: MORNING, ...client },
    );

    expect(times).toContain("15:00");
  });

  it("não oferece horários passados do dia corrente", () => {
    const times = findAvailableStartTimes([], {
      date: DATE,
      serviceMinutes: 30,
      now: new Date(2026, 7, 15, 14, 0, 0),
      ...client,
    });

    expect(times).not.toContain("08:00");
    expect(times).not.toContain("13:30");
    expect(times).toContain("14:30");
  });

  it("não deixa o cliente marcar sobre o próprio atendimento", () => {
    const times = findAvailableStartTimes(
      [appointment({ time: "10:00", clientId: "c1", name: "Maria Silva" })],
      { date: DATE, serviceMinutes: 30, now: MORNING, ...client },
    );

    expect(times).not.toContain("10:00");
  });

  it("não oferece início que estoure o fim do expediente", () => {
    const times = findAvailableStartTimes([], {
      date: DATE,
      serviceMinutes: 90,
      now: MORNING,
      ...client,
    });

    expect(times).not.toContain("17:00");
    expect(times).not.toContain("17:30");
    expect(times).toContain("16:30");
  });
});
