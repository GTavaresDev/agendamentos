"use server";

import { PrismaAppointmentRepository } from "@core/infra/persistence/prisma/repositories/prisma-appointment.repository";
import { PrismaUserRepository } from "@core/infra/persistence/prisma/repositories/prisma-user.repository";
import { PrismaProductRepository } from "@core/infra/persistence/prisma/repositories/prisma-product.repository";
import { PrismaClientRepository } from "@core/infra/persistence/prisma/repositories/prisma-client.repository";
import { PrismaServiceRepository } from "@core/infra/persistence/prisma/repositories/prisma-service.repository";
import { GetDashboardMetrics, DashboardMetrics } from "@core/application/reports/get-dashboard-metrics.usecase";
import { GetReportMetrics, ReportMetrics } from "@core/application/reports/get-report-metrics.usecase";
import { requireSessionAction } from "@/app/(agendamentos)/(left-nav-bar)/_actions/auth-actions";

import { PrismaSaleRepository } from "@core/infra/persistence/prisma/repositories/prisma-sale.repository";

const appointmentRepo = new PrismaAppointmentRepository();
const userRepo = new PrismaUserRepository();
const clientRepo = new PrismaClientRepository();
const serviceRepo = new PrismaServiceRepository();
const saleRepo = new PrismaSaleRepository();

export async function fetchDashboardMetricsAction(): Promise<DashboardMetrics> {
  await requireSessionAction();
  const useCase = new GetDashboardMetrics(appointmentRepo, userRepo, clientRepo);
  return await useCase.execute();
}

export async function fetchReportMetricsAction(period?: string): Promise<ReportMetrics> {
  await requireSessionAction();
  const useCase = new GetReportMetrics(appointmentRepo, userRepo, serviceRepo, saleRepo);
  return await useCase.execute(period);
}
