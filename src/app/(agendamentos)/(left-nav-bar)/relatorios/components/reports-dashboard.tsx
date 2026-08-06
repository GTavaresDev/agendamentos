"use client";

import { useEffect, useState } from "react";
import { CalendarDays, ChevronDown, Clock3, Download, UserRoundCheck, WalletCards } from "lucide-react";
import { Button } from "@/app/(agendamentos)/(left-nav-bar)/_components/ui/button";
import { fetchReportMetricsAction } from "@/app/(agendamentos)/(left-nav-bar)/_actions/report-actions";
import type { ReportMetrics } from "@core/application/reports/get-report-metrics.usecase";
import { DashboardSkeleton, LoadingOverlayCard } from "@/app/(agendamentos)/(left-nav-bar)/_components/ui/page-skeletons";
import { MetricCard } from "./report-shared";
import { ReportServiceCharts, ReportTrendCharts } from "./report-charts";
import {
  ReportTeamAndFinance,
  ReportTopClients,
  ReportWeeklyAndChannels,
} from "./report-tables";

export function ReportsDashboard() {
  const [period, setPeriod] = useState("Últimos 6 meses");
  const [loading, setLoading] = useState(true);
  const [dbMetrics, setDbMetrics] = useState<ReportMetrics | null>(null);

  useEffect(() => {
    setLoading(true);
    fetchReportMetricsAction(period).then((data) => {
      if (data) setDbMetrics(data);
      setLoading(false);
    });
  }, [period]);

  if (loading && !dbMetrics) {
    return (
      <div className="relative min-h-[calc(100vh-84px)]">
        <DashboardSkeleton />
        <LoadingOverlayCard label="Carregando relatórios..." />
      </div>
    );
  }

  const totalAppts = dbMetrics ? dbMetrics.totalAppointments : 0;
  const totalRevenue = dbMetrics ? dbMetrics.estimatedRevenue : "R$ 0,0";
  const attendanceRateVal = dbMetrics ? dbMetrics.attendanceRate : "92,1%";
  const occupancyRateVal = dbMetrics ? dbMetrics.occupancyRate : "78,4%";

  function handleExport() {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      "Mês,Agendamentos,Cancelados,Receita\n" +
      (dbMetrics?.monthlyData || []).map((e) => `${e.month},${e.agendamentos},${e.cancelados},${e.receita}`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `relatorio_${period.toLowerCase().replace(/\s+/g, "_")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div className="relative mx-auto max-w-[1560px] p-4 sm:p-6 lg:p-8">
      {loading && <LoadingOverlayCard label="Atualizando relatórios..." />}
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <p className="text-sm font-medium">Desempenho do negócio</p>
              <p className="mt-1 text-sm text-zinc-500">
                Atualizado em 1 de agosto de 2026, às 08:30.
              </p>
            </div>
            <div className="flex gap-2">
              <div className="relative">
                <select
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                  className="h-10 appearance-none rounded-lg border border-zinc-200 bg-white pl-3 pr-9 text-sm font-medium outline-none"
                >
                  <option>Este mês</option>
                  <option>Últimos 3 meses</option>
                  <option>Últimos 6 meses</option>
                  <option>Este ano</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
              </div>
              <Button variant="outline" onClick={handleExport}>
                <Download /> Exportar
              </Button>
            </div>
          </div>

          <div className="grid gap-2.5 sm:gap-4 grid-cols-2 xl:grid-cols-4">
            <MetricCard
              title="Total de agendamentos"
              value={totalAppts.toString()}
              change="—"
              description={`${dbMetrics?.completedAppointments || 0} concluídos`}
              icon={CalendarDays}
              align="left"
              info={{
                title: "Total de Agendamentos",
                whatIsIt: "Soma de todos os agendamentos registrados no sistema no período.",
                howItIsCalculated: "Concluídos + Confirmados + Cancelados + Pendentes",
                exampleOrNote: "Inclui agendamentos presenciais, via WhatsApp e canais digitais.",
              }}
            />
            <MetricCard
              title="Receita total"
              value={totalRevenue}
              change="—"
              description={`Serviços (${dbMetrics?.servicesRevenue || "R$ 0,00"}) + Produtos (${dbMetrics?.productsRevenue || "R$ 0,00"})`}
              icon={WalletCards}
              positive={true}
              align="left"
              info={{
                title: "Receita Total",
                whatIsIt: "Faturamento bruto acumulado de serviços prestados e vendas de produtos.",
                howItIsCalculated: "Σ(Preço Serviços Concluídos e Confirmados) + Σ(Vendas de Produtos)",
                exampleOrNote: "Reflete as receitas ativas registradas no banco de dados.",
              }}
            />
            <MetricCard
              title="Taxa de comparecimento"
              value={attendanceRateVal}
              change="—"
              description={`${dbMetrics?.completedAppointments || 0} concluídos / ${totalAppts} total`}
              icon={UserRoundCheck}
              align="right"
              info={{
                title: "Taxa de Comparecimento",
                whatIsIt: "Proporção de clientes que compareceram e concluíram o atendimento.",
                howItIsCalculated: "(Agendamentos Concluídos ÷ Total de Agendamentos) × 100",
                exampleOrNote: "Mede a assiduidade dos clientes e a eficácia de confirmação.",
              }}
            />
            <MetricCard
              title="Taxa de ocupação"
              value={occupancyRateVal}
              change="—"
              description={`${(dbMetrics?.confirmedAppointments || 0) + (dbMetrics?.completedAppointments || 0)} reservados`}
              icon={Clock3}
              align="right"
              info={{
                title: "Taxa de Ocupação",
                whatIsIt: "Nível de aproveitamento da capacidade de atendimento da agenda.",
                howItIsCalculated: "((Agendamentos Concluídos + Confirmados) ÷ Total Geral) × 100",
                exampleOrNote: "Ajuda a identificar a eficiência da ocupação da sua grade de horários.",
              }}
            />
          </div>

          <ReportTrendCharts dbMetrics={dbMetrics} period={period} />

          <ReportServiceCharts dbMetrics={dbMetrics} />

          <ReportWeeklyAndChannels dbMetrics={dbMetrics} />

          <ReportTopClients dbMetrics={dbMetrics} />

          <ReportTeamAndFinance dbMetrics={dbMetrics} />

          <p className="mt-5 text-center text-[11px] text-zinc-400">
            Relatório gerado em tempo real com base na base de dados do sistema.
          </p>
    </div>
  );
}
