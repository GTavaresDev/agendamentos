import { describe, expect, it } from "vitest";
import {
  buildAppointment,
  mockAppointmentRepository,
} from "@core/application/appointments/test-helpers";
import {
  CancelClientAppointment,
  ClientAppointmentError,
  GetClientAppointment,
  ListClientAppointments,
} from "./client-appointments.usecase";

const NOW = new Date(2026, 7, 15, 12, 0, 0);

describe("ListClientAppointments", () => {
  it("consulta somente os agendamentos do cliente autenticado", async () => {
    const repo = mockAppointmentRepository();
    repo.findByClientId.mockResolvedValue([]);

    await new ListClientAppointments(repo).execute("c1", NOW);

    expect(repo.findByClientId).toHaveBeenCalledWith("c1");
    expect(repo.findAll).not.toHaveBeenCalled();
  });

  it("separa próximos e anteriores e aponta o próximo atendimento", async () => {
    const repo = mockAppointmentRepository();
    repo.findByClientId.mockResolvedValue([
      buildAppointment({ id: "passado", date: "2026-08-10", time: "09:00" }),
      buildAppointment({ id: "hoje-cedo", date: "2026-08-15", time: "09:00" }),
      buildAppointment({ id: "futuro", date: "2026-08-20", time: "14:30" }),
      buildAppointment({ id: "hoje-tarde", date: "2026-08-15", time: "16:00" }),
    ]);

    const view = await new ListClientAppointments(repo).execute("c1", NOW);

    expect(view.upcoming.map((a) => a.id)).toEqual(["hoje-tarde", "futuro"]);
    expect(view.past.map((a) => a.id)).toEqual(["hoje-cedo", "passado"]);
    expect(view.next?.id).toBe("hoje-tarde");
  });

  it("ignora cancelados ao indicar o próximo atendimento", async () => {
    const repo = mockAppointmentRepository();
    repo.findByClientId.mockResolvedValue([
      buildAppointment({ id: "cancelado", date: "2026-08-16", time: "09:00", status: "Cancelado" }),
      buildAppointment({ id: "valido", date: "2026-08-17", time: "09:00" }),
    ]);

    const view = await new ListClientAppointments(repo).execute("c1", NOW);

    expect(view.next?.id).toBe("valido");
  });

  it("não expõe preço, notas nem ids internos", async () => {
    const repo = mockAppointmentRepository();
    repo.findByClientId.mockResolvedValue([
      buildAppointment({
        date: "2026-08-20",
        servicePrice: 850,
        notes: "cliente pediu desconto",
        userId: "u1",
        serviceId: "sv1",
        channelId: "recepcao",
      }),
    ]);

    const view = await new ListClientAppointments(repo).execute("c1", NOW);
    const serialized = JSON.stringify(view.upcoming[0]);

    expect(serialized).not.toContain("850");
    expect(serialized).not.toContain("desconto");
    expect(serialized).not.toContain("recepcao");
    expect(serialized).not.toContain("sv1");
  });
});

describe("GetClientAppointment", () => {
  it("busca com posse na própria consulta", async () => {
    const repo = mockAppointmentRepository();
    repo.findByIdAndClientId.mockResolvedValue(buildAppointment());

    await new GetClientAppointment(repo).execute("a1", "c1", NOW);

    expect(repo.findByIdAndClientId).toHaveBeenCalledWith("a1", "c1");
    expect(repo.findById).not.toHaveBeenCalled();
  });

  it("devolve nulo para agendamento de outro cliente", async () => {
    const repo = mockAppointmentRepository();
    repo.findByIdAndClientId.mockResolvedValue(null);

    const result = await new GetClientAppointment(repo).execute("a-de-outro", "c1", NOW);

    expect(result).toBeNull();
  });
});

describe("CancelClientAppointment", () => {
  it("cancela agendamento futuro do próprio cliente", async () => {
    const repo = mockAppointmentRepository();
    const appointment = buildAppointment({ date: "2026-08-20", time: "14:30" });
    repo.findByIdAndClientId.mockResolvedValue(appointment);
    repo.findById.mockResolvedValue(appointment);
    repo.update.mockImplementation(async (updated) => updated);

    const result = await new CancelClientAppointment(repo).execute("a1", "c1", NOW);

    expect(repo.findByIdAndClientId).toHaveBeenCalledWith("a1", "c1");
    expect(result.status).toBe("Cancelado");
  });

  it("não cancela agendamento de outro cliente", async () => {
    const repo = mockAppointmentRepository();
    repo.findByIdAndClientId.mockResolvedValue(null);

    await expect(
      new CancelClientAppointment(repo).execute("a-de-outro", "c1", NOW),
    ).rejects.toThrow(ClientAppointmentError);
    expect(repo.update).not.toHaveBeenCalled();
  });

  it("não cancela atendimento que já passou", async () => {
    const repo = mockAppointmentRepository();
    repo.findByIdAndClientId.mockResolvedValue(
      buildAppointment({ date: "2026-08-15", time: "09:00" }),
    );

    await expect(
      new CancelClientAppointment(repo).execute("a1", "c1", NOW),
    ).rejects.toThrow(/já passou/i);
    expect(repo.update).not.toHaveBeenCalled();
  });

  it("não cancela atendimento concluído nem já cancelado", async () => {
    const repo = mockAppointmentRepository();

    repo.findByIdAndClientId.mockResolvedValue(
      buildAppointment({ date: "2026-08-20", status: "Concluído" }),
    );
    await expect(
      new CancelClientAppointment(repo).execute("a1", "c1", NOW),
    ).rejects.toThrow(/concluídos/i);

    repo.findByIdAndClientId.mockResolvedValue(
      buildAppointment({ date: "2026-08-20", status: "Cancelado" }),
    );
    await expect(
      new CancelClientAppointment(repo).execute("a1", "c1", NOW),
    ).rejects.toThrow(/já foi cancelado/i);

    expect(repo.update).not.toHaveBeenCalled();
  });
});
