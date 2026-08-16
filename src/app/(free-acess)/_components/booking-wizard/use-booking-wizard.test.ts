import { describe, expect, it, vi } from "vitest";
import { STEP_ORDER, STEP_TITLE } from "./booking-wizard.types";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
  }),
}));

vi.mock("../../_actions/portal-booking-actions", () => ({
  getProfessionalsForServiceAction: vi.fn().mockResolvedValue([
    { id: "pro-1", name: "Dra. Maria", initials: "DM" },
  ]),
  getAvailableDatesAction: vi.fn().mockResolvedValue(["2026-08-20", "2026-08-21"]),
  getAvailableTimesAction: vi.fn().mockResolvedValue(["09:00", "10:00"]),
  createClientAppointmentAction: vi.fn().mockResolvedValue({
    success: true,
    data: {
      id: "apt-1",
      serviceName: "Consulta",
      professionalName: "Dra. Maria",
      date: "2026-08-20",
      time: "09:00",
      duration: "30 min",
      status: "Pendente",
    },
  }),
}));

describe("booking-wizard types & config", () => {
  it("defines the correct order of steps", () => {
    expect(STEP_ORDER).toEqual([
      "servico",
      "profissional",
      "data",
      "horario",
      "confirmacao",
    ]);
  });

  it("defines titles and subtitles for each step", () => {
    expect(STEP_TITLE.servico.title).toBe("Escolha o serviço");
    expect(STEP_TITLE.profissional.title).toBe("Escolha o profissional");
    expect(STEP_TITLE.data.title).toBe("Escolha a data");
    expect(STEP_TITLE.horario.title).toBe("Escolha o horário");
    expect(STEP_TITLE.confirmacao.title).toBe("Confirme seu agendamento");
    expect(STEP_TITLE.sucesso.title).toBe("Agendamento realizado!");
  });
});
