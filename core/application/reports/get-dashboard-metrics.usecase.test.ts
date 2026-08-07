import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { GetDashboardMetrics } from "./get-dashboard-metrics.usecase";
import { buildAppointment, mockAppointmentRepository } from "../appointments/test-helpers";
import { buildUser, mockUserRepository } from "../users/test-helpers";
import { buildClient, mockClientRepository } from "../clients/test-helpers";

describe("GetDashboardMetrics", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-08-06T12:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("counts only Confirmado/Concluído appointments happening today", async () => {
    const appointmentRepo = mockAppointmentRepository();
    const userRepo = mockUserRepository();
    appointmentRepo.findAll.mockResolvedValue([
      buildAppointment({ id: "a1", date: "2026-08-06", status: "Confirmado" }),
      buildAppointment({ id: "a2", date: "2026-08-06", status: "Cancelado" }),
      buildAppointment({ id: "a3", date: "2026-08-05", status: "Confirmado" }),
    ]);
    userRepo.findAll.mockResolvedValue([]);
    const useCase = new GetDashboardMetrics(appointmentRepo, userRepo);

    const result = await useCase.execute();

    expect(result.todayAppointmentsCount).toBe(1);
  });

  it("counts only Ativo users and clients", async () => {
    const appointmentRepo = mockAppointmentRepository();
    const userRepo = mockUserRepository();
    const clientRepo = mockClientRepository();
    appointmentRepo.findAll.mockResolvedValue([]);
    userRepo.findAll.mockResolvedValue([
      buildUser({ id: "u1", status: "Ativo" }),
      buildUser({ id: "u2", status: "Inativo" }),
    ]);
    clientRepo.findAll.mockResolvedValue([
      buildClient({ id: "c1", status: "Ativo" }),
      buildClient({ id: "c2", status: "Inativo" }),
    ]);
    const useCase = new GetDashboardMetrics(appointmentRepo, userRepo, clientRepo);

    const result = await useCase.execute();

    expect(result.activeUsersCount).toBe(1);
    expect(result.activeClientsCount).toBe(1);
  });

  it("computes attendanceRate as 0 when there are no appointments today", async () => {
    const appointmentRepo = mockAppointmentRepository();
    const userRepo = mockUserRepository();
    appointmentRepo.findAll.mockResolvedValue([]);
    userRepo.findAll.mockResolvedValue([]);
    const useCase = new GetDashboardMetrics(appointmentRepo, userRepo);

    const result = await useCase.execute();

    expect(result.attendanceRate).toBe(0);
  });

  it("computes attendanceRate as the ratio of completed to total appointments today", async () => {
    const appointmentRepo = mockAppointmentRepository();
    const userRepo = mockUserRepository();
    appointmentRepo.findAll.mockResolvedValue([
      buildAppointment({ id: "a1", date: "2026-08-06", status: "Concluído" }),
      buildAppointment({ id: "a2", date: "2026-08-06", status: "Confirmado" }),
    ]);
    userRepo.findAll.mockResolvedValue([]);
    const useCase = new GetDashboardMetrics(appointmentRepo, userRepo);

    const result = await useCase.execute();

    expect(result.attendanceRate).toBe(50);
  });

  it("works without a clientRepository (optional dependency)", async () => {
    const appointmentRepo = mockAppointmentRepository();
    const userRepo = mockUserRepository();
    appointmentRepo.findAll.mockResolvedValue([]);
    userRepo.findAll.mockResolvedValue([]);
    const useCase = new GetDashboardMetrics(appointmentRepo, userRepo);

    const result = await useCase.execute();

    expect(result.activeClientsCount).toBe(0);
    expect(result.newClientsCount).toBe(0);
  });
});
