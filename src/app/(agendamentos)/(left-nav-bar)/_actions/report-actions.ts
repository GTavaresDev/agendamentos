"use server";

import { PrismaAppointmentRepository } from "@core/infra/persistence/prisma/repositories/prisma-appointment.repository";
import { PrismaUserRepository } from "@core/infra/persistence/prisma/repositories/prisma-user.repository";
import { PrismaProductRepository } from "@core/infra/persistence/prisma/repositories/prisma-product.repository";
import { PrismaClientRepository } from "@core/infra/persistence/prisma/repositories/prisma-client.repository";
import { PrismaServiceRepository } from "@core/infra/persistence/prisma/repositories/prisma-service.repository";
import { GetDashboardMetrics, DashboardMetrics } from "@core/application/reports/get-dashboard-metrics.usecase";
import { GetReportMetrics, ReportMetrics } from "@core/application/reports/get-report-metrics.usecase";
import { requireSessionAction } from "@/app/(agendamentos)/(left-nav-bar)/_actions/auth-actions";
import { CacheKeys, CacheTTL, getCached } from "@core/infra/cache";
import { canAccessReports } from "@/lib/permissions";

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

/**
 * Métricas do período. É o caminho mais caro do sistema — quatro tabelas
 * inteiras somadas em memória (~800 ms no Neon) — e é puramente informativo,
 * então tolera a defasagem do TTL de 20 min.
 *
 * A permissão é conferida AQUI, e não só na página: a página apenas redireciona
 * quem não pode ver, mas a Server Action é chamável direto, e ela devolve
 * faturamento e dados de clientes. A verificação vem antes do cache — o Redis
 * nunca é um caminho alternativo para escapar da autorização.
 */
export async function fetchReportMetricsAction(period?: string): Promise<ReportMetrics> {
  const session = await requireSessionAction();
  if (!canAccessReports(session)) {
    throw new Error("Você não tem permissão para ver relatórios.");
  }

  return getCached(CacheKeys.reports(period ?? "padrao"), CacheTTL.reports, () =>
    new GetReportMetrics(appointmentRepo, userRepo, serviceRepo, saleRepo).execute(period),
  );
}
