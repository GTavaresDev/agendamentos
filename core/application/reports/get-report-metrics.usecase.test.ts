import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { GetReportMetrics } from "./get-report-metrics.usecase";
import { buildAppointment, mockAppointmentRepository } from "../appointments/test-helpers";
import { mockUserRepository } from "../users/test-helpers";
import { buildService, mockServiceRepository } from "../services/test-helpers";
import { buildSale, mockSaleRepository } from "../sales/test-helpers";

describe("GetReportMetrics", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-08-06T12:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("counts appointments by status within the default period", async () => {
    const appointmentRepo = mockAppointmentRepository();
    const userRepo = mockUserRepository();
    const serviceRepo = mockServiceRepository();
    appointmentRepo.findAll.mockResolvedValue([
      buildAppointment({ id: "a1", date: "2026-08-01", status: "Concluído" }),
      buildAppointment({ id: "a2", date: "2026-08-02", status: "Confirmado" }),
      buildAppointment({ id: "a3", date: "2026-08-03", status: "Cancelado" }),
      buildAppointment({ id: "a4", date: "2026-08-04", status: "Pendente" }),
    ]);
    userRepo.findAll.mockResolvedValue([]);
    serviceRepo.findAll.mockResolvedValue([]);
    const useCase = new GetReportMetrics(appointmentRepo, userRepo, serviceRepo);

    const result = await useCase.execute();

    expect(result.totalAppointments).toBe(4);
    expect(result.completedAppointments).toBe(1);
    expect(result.confirmedAppointments).toBe(1);
    expect(result.canceledAppointments).toBe(1);
    expect(result.pendingAppointments).toBe(1);
  });

  it("excludes appointments outside the selected period", async () => {
    const appointmentRepo = mockAppointmentRepository();
    const userRepo = mockUserRepository();
    const serviceRepo = mockServiceRepository();
    appointmentRepo.findAll.mockResolvedValue([
      buildAppointment({ id: "a1", date: "2020-01-01", status: "Concluído" }),
    ]);
    userRepo.findAll.mockResolvedValue([]);
    serviceRepo.findAll.mockResolvedValue([]);
    const useCase = new GetReportMetrics(appointmentRepo, userRepo, serviceRepo);

    const result = await useCase.execute("Este mês");

    expect(result.totalAppointments).toBe(0);
  });

  it("uses the appointment's stored servicePrice when present", async () => {
    const appointmentRepo = mockAppointmentRepository();
    const userRepo = mockUserRepository();
    const serviceRepo = mockServiceRepository();
    appointmentRepo.findAll.mockResolvedValue([
      buildAppointment({ id: "a1", date: "2026-08-01", status: "Concluído", servicePrice: 75 }),
    ]);
    userRepo.findAll.mockResolvedValue([]);
    serviceRepo.findAll.mockResolvedValue([]);
    const useCase = new GetReportMetrics(appointmentRepo, userRepo, serviceRepo);

    const result = await useCase.execute();

    expect(result.servicesRevenueNum).toBe(75);
  });

  it("falls back to the service catalog price, then to 200, when servicePrice is missing", async () => {
    const appointmentRepo = mockAppointmentRepository();
    const userRepo = mockUserRepository();
    const serviceRepo = mockServiceRepository();
    appointmentRepo.findAll.mockResolvedValue([
      buildAppointment({ id: "a1", date: "2026-08-01", status: "Concluído", service: "Corte", servicePrice: null }),
    ]);
    userRepo.findAll.mockResolvedValue([]);
    serviceRepo.findAll.mockResolvedValue([buildService({ name: "Corte", price: 60 })]);
    const useCase = new GetReportMetrics(appointmentRepo, userRepo, serviceRepo);

    const result = await useCase.execute();

    expect(result.servicesRevenueNum).toBe(60);
  });

  it("combines services and product-sale revenue into totalRevenueNum", async () => {
    const appointmentRepo = mockAppointmentRepository();
    const userRepo = mockUserRepository();
    const serviceRepo = mockServiceRepository();
    const saleRepo = mockSaleRepository();
    appointmentRepo.findAll.mockResolvedValue([
      buildAppointment({ id: "a1", date: "2026-08-01", status: "Concluído", servicePrice: 100 }),
    ]);
    userRepo.findAll.mockResolvedValue([]);
    serviceRepo.findAll.mockResolvedValue([]);
    saleRepo.findAll.mockResolvedValue([buildSale({ totalPrice: 50, createdAt: new Date("2026-08-02") })]);
    const useCase = new GetReportMetrics(appointmentRepo, userRepo, serviceRepo, saleRepo);

    const result = await useCase.execute();

    expect(result.servicesRevenueNum).toBe(100);
    expect(result.productsRevenueNum).toBe(50);
    expect(result.totalRevenueNum).toBe(150);
    expect(result.salesCount).toBe(1);
  });

  it("works without a saleRepository (optional dependency)", async () => {
    const appointmentRepo = mockAppointmentRepository();
    const userRepo = mockUserRepository();
    const serviceRepo = mockServiceRepository();
    appointmentRepo.findAll.mockResolvedValue([]);
    userRepo.findAll.mockResolvedValue([]);
    serviceRepo.findAll.mockResolvedValue([]);
    const useCase = new GetReportMetrics(appointmentRepo, userRepo, serviceRepo);

    const result = await useCase.execute();

    expect(result.productsRevenueNum).toBe(0);
    expect(result.salesCount).toBe(0);
  });
});
