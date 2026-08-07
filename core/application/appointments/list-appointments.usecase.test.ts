import { describe, expect, it } from "vitest";
import { ListAppointments } from "./list-appointments.usecase";
import { buildAppointment, mockAppointmentRepository } from "./test-helpers";

describe("ListAppointments", () => {
  it("uses findAll when no date filter is given", async () => {
    const repo = mockAppointmentRepository();
    repo.findAll.mockResolvedValue([buildAppointment()]);
    const useCase = new ListAppointments(repo);

    await useCase.execute();

    expect(repo.findAll).toHaveBeenCalled();
    expect(repo.findByDate).not.toHaveBeenCalled();
  });

  it("uses findByDate when a date filter is given", async () => {
    const repo = mockAppointmentRepository();
    repo.findByDate.mockResolvedValue([buildAppointment()]);
    const useCase = new ListAppointments(repo);

    await useCase.execute({ date: "2026-08-06" });

    expect(repo.findByDate).toHaveBeenCalledWith("2026-08-06");
    expect(repo.findAll).not.toHaveBeenCalled();
  });

  it("filters by search across name and service", async () => {
    const repo = mockAppointmentRepository();
    repo.findAll.mockResolvedValue([
      buildAppointment({ id: "a1", name: "Maria Silva", service: "Corte" }),
      buildAppointment({ id: "a2", name: "João Souza", service: "Manicure" }),
    ]);
    const useCase = new ListAppointments(repo);

    const result = await useCase.execute({ search: "corte" });

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("a1");
  });

  it("filters by status, ignoring the 'Todos' sentinel", async () => {
    const repo = mockAppointmentRepository();
    repo.findAll.mockResolvedValue([
      buildAppointment({ id: "a1", status: "Confirmado" }),
      buildAppointment({ id: "a2", status: "Cancelado" }),
    ]);
    const useCase = new ListAppointments(repo);

    expect(await useCase.execute({ status: "Cancelado" })).toHaveLength(1);
    expect(await useCase.execute({ status: "Todos" })).toHaveLength(2);
  });
});
