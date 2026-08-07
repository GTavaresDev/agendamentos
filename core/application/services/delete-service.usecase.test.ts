import { describe, expect, it } from "vitest";
import { DeleteService } from "./delete-service.usecase";
import { buildService, mockServiceRepository } from "./test-helpers";
import { buildAppointment, mockAppointmentRepository } from "../appointments/test-helpers";

describe("DeleteService", () => {
  it("throws when the service does not exist", async () => {
    const serviceRepo = mockServiceRepository();
    const appointmentRepo = mockAppointmentRepository();
    serviceRepo.findById.mockResolvedValue(null);
    const useCase = new DeleteService(serviceRepo, appointmentRepo);

    await expect(useCase.execute("missing")).rejects.toThrow(/não encontrado/i);
  });

  it("rejects deletion when there are linked appointments", async () => {
    const serviceRepo = mockServiceRepository();
    const appointmentRepo = mockAppointmentRepository();
    serviceRepo.findById.mockResolvedValue(buildService({ id: "sv1" }));
    appointmentRepo.findAll.mockResolvedValue([buildAppointment({ serviceId: "sv1" })]);
    const useCase = new DeleteService(serviceRepo, appointmentRepo);

    await expect(useCase.execute("sv1")).rejects.toThrow(/agendamentos vinculados/);
    expect(serviceRepo.delete).not.toHaveBeenCalled();
  });

  it("deletes when there are no linked appointments", async () => {
    const serviceRepo = mockServiceRepository();
    const appointmentRepo = mockAppointmentRepository();
    serviceRepo.findById.mockResolvedValue(buildService({ id: "sv1" }));
    appointmentRepo.findAll.mockResolvedValue([buildAppointment({ serviceId: "other" })]);
    const useCase = new DeleteService(serviceRepo, appointmentRepo);

    await useCase.execute("sv1");

    expect(serviceRepo.delete).toHaveBeenCalledWith("sv1");
  });
});
