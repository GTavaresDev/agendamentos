import { describe, expect, it } from "vitest";
import { UpdateAppointmentStatus } from "./update-appointment-status.usecase";
import { buildAppointment, mockAppointmentRepository } from "./test-helpers";

describe("UpdateAppointmentStatus", () => {
  it("throws when the appointment does not exist", async () => {
    const repo = mockAppointmentRepository();
    repo.findById.mockResolvedValue(null);
    const useCase = new UpdateAppointmentStatus(repo);

    await expect(useCase.execute("missing", "Concluído")).rejects.toThrow(/não encontrado/i);
  });

  it("updates the status while preserving other fields", async () => {
    const repo = mockAppointmentRepository();
    repo.findById.mockResolvedValue(buildAppointment({ id: "a1", status: "Confirmado" }));
    repo.update.mockImplementation(async (a) => a);
    const useCase = new UpdateAppointmentStatus(repo);

    const result = await useCase.execute("a1", "Concluído");

    expect(result.status).toBe("Concluído");
    expect(result.id).toBe("a1");
    expect(result.name).toBe("Maria Silva");
  });
});
