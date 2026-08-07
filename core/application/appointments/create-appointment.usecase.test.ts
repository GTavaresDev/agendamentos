import { describe, expect, it } from "vitest";
import { CreateAppointment } from "./create-appointment.usecase";
import { ClientScheduleConflictError } from "@core/domain/appointments/client-schedule-conflict.business-rule";
import { buildAppointment, mockAppointmentRepository } from "./test-helpers";

describe("CreateAppointment", () => {
  it("rejects a conflicting appointment for the same client", async () => {
    const repo = mockAppointmentRepository();
    repo.findByDate.mockResolvedValue([
      buildAppointment({ time: "09:00", duration: "30 min", clientId: "c1" }),
    ]);
    const useCase = new CreateAppointment(repo);

    await expect(
      useCase.execute({
        date: "2026-08-06",
        time: "09:00",
        name: "Maria Silva",
        service: "Corte",
        clientId: "c1",
      }),
    ).rejects.toThrow(ClientScheduleConflictError);
    expect(repo.save).not.toHaveBeenCalled();
  });

  it("applies default duration, status, service, and channel", async () => {
    const repo = mockAppointmentRepository();
    repo.findByDate.mockResolvedValue([]);
    repo.save.mockImplementation(async (a) => a);
    const useCase = new CreateAppointment(repo);

    const result = await useCase.execute({
      date: "2026-08-06",
      time: "09:00",
      name: "Maria Silva",
      service: "",
    });

    expect(result.duration).toBe("30 min");
    expect(result.status).toBe("Confirmado");
    expect(result.service).toBe("Consulta");
    expect(result.channelId).toBe("site");
    expect(result.initials).toBe("MS");
  });

  it("saves successfully when there is no conflict", async () => {
    const repo = mockAppointmentRepository();
    repo.findByDate.mockResolvedValue([]);
    repo.save.mockImplementation(async (a) => a);
    const useCase = new CreateAppointment(repo);

    const result = await useCase.execute({
      date: "2026-08-06",
      time: "10:00",
      name: "João Souza",
      service: "Corte",
    });

    expect(repo.save).toHaveBeenCalledTimes(1);
    expect(result.name).toBe("João Souza");
  });
});
