"use server";

import { PrismaAppointmentRepository } from "@core/infra/persistence/prisma/repositories/PrismaAppointmentRepository";
import { PrismaUserRepository } from "@core/infra/persistence/prisma/repositories/PrismaUserRepository";
import { PrismaProductRepository } from "@core/infra/persistence/prisma/repositories/PrismaProductRepository";
import { PrismaClientRepository } from "@core/infra/persistence/prisma/repositories/PrismaClientRepository";
import { GetDashboardMetrics, DashboardMetrics } from "@core/application/reports/GetDashboardMetrics";
import { GetReportMetrics, ReportMetrics } from "@core/application/reports/GetReportMetrics";

const appointmentRepo = new PrismaAppointmentRepository();
const userRepo = new PrismaUserRepository();
const clientRepo = new PrismaClientRepository();

export async function fetchDashboardMetricsAction(): Promise<DashboardMetrics> {
  const useCase = new GetDashboardMetrics(appointmentRepo, userRepo, clientRepo);
  return await useCase.execute();
}

export async function fetchReportMetricsAction(period?: string): Promise<ReportMetrics> {
  const useCase = new GetReportMetrics(appointmentRepo, userRepo);
  return await useCase.execute(period);
}
