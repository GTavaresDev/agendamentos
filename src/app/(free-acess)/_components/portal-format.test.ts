import { describe, expect, it } from "vitest";
import {
  clientStatusLabel,
  firstName,
  formatDate,
  formatDayMonth,
  formatDayNumber,
  formatFriendlyDate,
  formatMonthShort,
  formatShortWeekday,
  formatWeekday,
  getStatusBadgeVariant,
  isToday,
} from "./portal-format";

describe("portal-format utilities", () => {
  it("formats client status labels correctly", () => {
    expect(clientStatusLabel("Pendente")).toBe("Aguardando confirmação");
    expect(clientStatusLabel("Confirmado")).toBe("Confirmado");
    expect(clientStatusLabel("Concluído")).toBe("Atendimento concluído");
    expect(clientStatusLabel("Cancelado")).toBe("Cancelado");
  });

  it("returns badge variants for appointment status", () => {
    expect(getStatusBadgeVariant("Pendente")).toBe("warning");
    expect(getStatusBadgeVariant("Confirmado")).toBe("success");
    expect(getStatusBadgeVariant("Cancelado")).toBe("destructive");
  });

  it("formats dates into pt-BR formats", () => {
    const iso = "2026-08-15";
    expect(formatDate(iso)).toBe("15/08/2026");
    expect(formatDayNumber(iso)).toBe("15");
    expect(formatDayMonth(iso)).toContain("15");
    expect(formatWeekday(iso)).toContain("sábado");
    expect(formatShortWeekday(iso)).toBe("sáb");
    expect(formatMonthShort(iso)).toBe("ago");
  });

  it("identifies today correctly", () => {
    const todayIso = "2026-08-16";
    const refDate = new Date(2026, 7, 16, 12, 0, 0);
    expect(isToday(todayIso, refDate)).toBe(true);
    expect(isToday("2026-08-15", refDate)).toBe(false);
  });

  it("formats friendly dates (Hoje, Amanhã, or full date)", () => {
    const refDate = new Date(2026, 7, 16, 10, 0, 0);
    expect(formatFriendlyDate("2026-08-16", refDate)).toBe("Hoje");
    expect(formatFriendlyDate("2026-08-17", refDate)).toBe("Amanhã");
    expect(formatFriendlyDate("2026-08-20", refDate)).toContain("20/08/2026");
  });

  it("extracts first name properly", () => {
    expect(firstName("Gabriel Tavares")).toBe("Gabriel");
    expect(firstName(" Maria Souza ")).toBe("Maria");
    expect(firstName("Ana")).toBe("Ana");
  });
});
