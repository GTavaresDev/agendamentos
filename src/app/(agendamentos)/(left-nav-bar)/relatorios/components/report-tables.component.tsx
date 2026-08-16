import { ArrowRight, MoreHorizontal } from "lucide-react";
import { Avatar } from "@/app/(agendamentos)/(left-nav-bar)/_components/ui/avatar.component";
import { Badge } from "@/app/(agendamentos)/(left-nav-bar)/_components/ui/badge.component";
import { Button } from "@/app/(agendamentos)/(left-nav-bar)/_components/ui/button.component";
import { Card, CardContent } from "@/app/(agendamentos)/(left-nav-bar)/_components/ui/card.component";
import { cn } from "@/lib/utils";
import { getHeatmapColor, HEATMAP_LEGEND } from "@/lib/heatmap-color";
import type { ReportMetrics } from "@core/application/reports/get-report-metrics.usecase";
import { SectionHead } from "./report-shared.component";

/** Valores do heatmap semanal vêm normalizados em 5 níveis (0–4); converte para 0–100%. */
const MAX_HEATMAP_LEVEL = 4;

export function ReportWeeklyAndChannels({
  dbMetrics,
}: {
  dbMetrics: ReportMetrics | null;
}) {
  return (
    <div className="mt-4 grid gap-4 xl:grid-cols-[1.15fr_.85fr]">
      <Card className="overflow-hidden border-zinc-200/80 bg-white shadow-xs">
        <SectionHead
          title="Mapa de ocupação semanal"
          description="Intensidade de procura por dia e período"
          info={{
            title: "Mapa de Ocupação Semanal",
            whatIsIt: "Matriz visual de mapa de calor (Heatmap) mostrando a concentração de agendamentos por dia e horário.",
            howItIsCalculated: "Frequência de atendimentos normalizada em 5 níveis de intensidade (de 0% a 100%).",
            exampleOrNote: "Cores mais vivas indicam os momentos de maior demanda.",
          }}
        />
        <CardContent className="p-3.5 sm:p-6">
          {dbMetrics?.weeklyData && dbMetrics.weeklyData.length > 0 ? (
            <>
              <div className="w-full overflow-x-auto pb-1">
                <div className="w-full min-w-[320px]">
                  <div className="mb-2 grid grid-cols-[32px_repeat(7,1fr)] sm:grid-cols-[44px_repeat(7,1fr)] gap-1 sm:gap-2 text-center text-[9px] sm:text-[10px] font-medium text-zinc-400">
                    <span />
                    <span>08–09</span>
                    <span>09–10</span>
                    <span>10–11</span>
                    <span>13–14</span>
                    <span>14–15</span>
                    <span>15–16</span>
                    <span>16–18</span>
                  </div>
                  {dbMetrics.weeklyData.map((row) => (
                    <div
                      key={row.day}
                      className="mb-1.5 sm:mb-2 grid grid-cols-[32px_repeat(7,1fr)] sm:grid-cols-[44px_repeat(7,1fr)] gap-1 sm:gap-2"
                    >
                      <span className="flex items-center text-[10px] sm:text-xs font-medium text-zinc-500 truncate">
                        {row.day}
                      </span>
                      {row.values.map((value, index) => {
                        const percent = (value / MAX_HEATMAP_LEVEL) * 100;
                        return (
                          <div
                            key={index}
                            title={`${row.day}: ocupação ${Math.round(percent)}%`}
                            className="h-7 sm:h-9 rounded-md transition-colors"
                            style={{ backgroundColor: getHeatmapColor(percent) }}
                          />
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-4 sm:mt-5 flex flex-wrap items-center justify-end gap-2 sm:gap-3 text-[9px] sm:text-[10px] text-zinc-500">
                {HEATMAP_LEGEND.map((level) => (
                  <span key={level.label} className="flex items-center gap-1 sm:gap-1.5">
                    <i
                      className="size-2.5 sm:size-3 rounded-sm shrink-0"
                      style={{ backgroundColor: level.color }}
                    />
                    {level.label}
                  </span>
                ))}
              </div>
            </>
          ) : (
            <div className="flex h-48 items-center justify-center text-zinc-400">
              <p>Nenhum dado disponível</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="overflow-hidden border-zinc-200/80 bg-white shadow-xs">
        <SectionHead
          title="Origem dos agendamentos"
          description="Canais usados pelos clientes"
          align="right"
          info={{
            title: "Origem dos Agendamentos",
            whatIsIt: "Distribuição dos canais de captação de clientes (WhatsApp, Online, Presencial, etc.).",
            howItIsCalculated: "(Agendamentos por Canal ÷ Total de Agendamentos) × 100",
            exampleOrNote: "Mede o engajamento dos clientes nos canais digitais de atendimento.",
          }}
        />
        <CardContent className="p-3.5 sm:p-6 space-y-4 sm:space-y-6">
          {dbMetrics?.channelsData && dbMetrics.channelsData.length > 0 ? (
            <>
              {dbMetrics.channelsData.map((channel, index) => (
                <div key={`${channel.name}-${index}`}>
                  <div className="mb-1.5 flex items-center justify-between text-xs sm:text-sm">
                    <span className="font-medium text-zinc-700 truncate">
                      {channel.name}
                    </span>
                    <span className="shrink-0">
                      <strong>{channel.value}</strong>{" "}
                      <small className="text-zinc-400">
                        ({channel.percent}%)
                      </small>
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-100">
                    <div
                      className="h-full rounded-full bg-zinc-950 transition-all duration-500"
                      style={{ width: `${channel.percent}%` }}
                    />
                  </div>
                </div>
              ))}
              {dbMetrics?.channelsData && (
                <div className="rounded-xl bg-zinc-50 p-3 sm:p-4 text-xs leading-5 text-zinc-500">
                  {(() => {
                    const digitalTotal = dbMetrics.channelsData.filter((c) => c.digital).reduce((sum, c) => sum + c.value, 0);
                    const digitalPercent = dbMetrics.totalAppointments > 0 ? Math.round((digitalTotal / dbMetrics.totalAppointments) * 100) : 0;
                    return (
                      <>
                        <strong className="block text-xs sm:text-sm text-zinc-900">
                          {digitalPercent}% chegam por canais digitais
                        </strong>
                        Canais digitais são responsáveis por {digitalTotal}{" "}
                        agendamentos.
                      </>
                    );
                  })()}
                </div>
              )}
            </>
          ) : (
            <div className="flex h-48 items-center justify-center text-zinc-400">
              <p>Nenhum dado disponível</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export function ReportTopClients({
  dbMetrics,
}: {
  dbMetrics: ReportMetrics | null;
}) {
  return (
    <Card className="mt-4 overflow-hidden border-zinc-200/80 bg-white shadow-xs">
      <SectionHead
        title="Clientes com maior recorrência"
        description="Frequência e valor acumulado no período"
        action={
          <Button variant="outline" size="sm" className="w-full sm:w-auto">
            Ver clientes <ArrowRight />
          </Button>
        }
        info={{
          title: "Clientes Mais Recorrentes",
          whatIsIt: "Ranking dos clientes que mais frequentam o estabelecimento e seu valor total gasto.",
          howItIsCalculated: "Agrupamento de atendimentos por cliente | Clientes com mais de 3 atendimentos são marcados como 'Recorrente'.",
          exampleOrNote: "Ajuda no planejamento de campanhas de retenção e fidelidade.",
        }}
      />
      {dbMetrics?.topClients && dbMetrics.topClients.length > 0 ? (
        <div className="divide-y divide-zinc-100 border-t border-zinc-100">
          {/* Desktop Header */}
          <div className="hidden lg:grid grid-cols-[1.6fr_repeat(4,.8fr)] gap-4 bg-zinc-50 px-5 py-3 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
            <span>Cliente</span>
            <span>Visitas</span>
            <span>Valor acumulado</span>
            <span>Última visita</span>
            <span>Perfil</span>
          </div>

          {/* Rows */}
          {dbMetrics.topClients.map((client) => (
            <div
              key={client.name}
              className="group relative flex flex-col gap-1.5 p-3 sm:p-3.5 border-b border-zinc-100 last:border-0 hover:bg-zinc-50/80 transition-colors lg:grid lg:grid-cols-[1.6fr_repeat(4,.8fr)] lg:items-center lg:py-3 lg:px-5 lg:border-b-0 lg:gap-4 text-sm"
            >
              {/* Line 1 for Mobile (< lg): Avatar + Name on left, Spent + Status on right */}
              <div className="flex items-center justify-between gap-2 lg:hidden">
                <div className="flex items-center gap-2.5 min-w-0">
                  <Avatar initials={client.initials} className="size-8 text-xs font-semibold shrink-0" />
                  <strong className="truncate text-sm font-semibold text-zinc-900">{client.name}</strong>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-700">
                    {client.spent}
                  </span>
                  <Badge
                    variant={client.status === "Recorrente" ? "default" : "secondary"}
                    className="text-[11px] px-2 py-0.5"
                  >
                    {client.status}
                  </Badge>
                </div>
              </div>

              {/* Line 2 for Mobile (< lg): Visits & Last visit indented under name */}
              <div className="flex items-center gap-1.5 text-xs text-zinc-500 min-w-0 overflow-hidden whitespace-nowrap pl-[42px] lg:hidden">
                <span className="font-medium text-zinc-700 shrink-0">{client.visits} visitas</span>
                <span className="text-zinc-300 shrink-0">•</span>
                <span className="shrink-0 text-zinc-400">Última: {client.last}</span>
              </div>

              {/* Desktop Client Info */}
              <div className="hidden lg:flex items-center gap-3 min-w-0">
                <Avatar initials={client.initials} />
                <strong className="truncate">{client.name}</strong>
              </div>

              {/* Desktop Visits */}
              <span className="hidden lg:block text-zinc-700 font-medium">{client.visits}</span>

              {/* Desktop Spent */}
              <strong className="hidden lg:block text-zinc-900">{client.spent}</strong>

              {/* Desktop Last Visit */}
              <span className="hidden lg:block text-zinc-500">{client.last}</span>

              {/* Desktop Status Badge */}
              <div className="hidden lg:block">
                <Badge
                  variant={client.status === "Recorrente" ? "default" : "secondary"}
                  className="w-fit"
                >
                  {client.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex h-48 items-center justify-center text-zinc-400">
          <p>Nenhum cliente com agendamentos</p>
        </div>
      )}
    </Card>
  );
}

export function ReportTeamAndFinance({
  dbMetrics,
}: {
  dbMetrics: ReportMetrics | null;
}) {
  return (
    <div className="mt-4">
      <Card className="flex flex-col overflow-hidden border-zinc-200/80 bg-white shadow-xs">
        <SectionHead
          title="Desempenho por profissional"
          description="Produtividade, presença, ocupação e receita"
          action={
            <Button variant="outline" size="sm" className="w-full sm:w-auto">
              Ver equipe <ArrowRight />
            </Button>
          }
          info={{
            title: "Desempenho da Equipe",
            whatIsIt: "Tabela de acompanhamento individual dos profissionais de atendimento.",
            howItIsCalculated: "Atendimentos Concluídos, Taxa de Presença (não-cancelamentos), Taxa de Ocupação da agenda do profissional e Receita Total gerada.",
            exampleOrNote: "Base essencial para comissionamento e mensuração de metas.",
          }}
        />
        <div className="divide-y divide-zinc-100 border-t border-zinc-100">
          {dbMetrics?.professionals && dbMetrics.professionals.length > 0 ? (
            <>
              {/* Desktop Header */}
              <div className="hidden lg:grid grid-cols-[1.4fr_repeat(5,.8fr)_40px] gap-4 bg-zinc-50 px-5 py-3 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                <span>Profissional</span>
                <span>Atendimentos</span>
                <span>Presença</span>
                <span>Ocupação</span>
                <span>Receita</span>
                <span>Avaliação</span>
                <span />
              </div>

              {/* Rows */}
              {dbMetrics.professionals.map((person) => (
                <div
                  key={person.name}
                  className="group relative flex flex-col gap-1.5 p-3 sm:p-3.5 border-b border-zinc-100 last:border-0 hover:bg-zinc-50/80 transition-colors lg:grid lg:grid-cols-[1.4fr_repeat(5,.8fr)_40px] lg:items-center lg:py-3.5 lg:px-5 lg:border-b-0 lg:gap-4 text-sm"
                >
                  {/* Line 1 for Mobile (< lg): Avatar + Name on left, Revenue + Rating on right */}
                  <div className="flex items-center justify-between gap-2 lg:hidden">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Avatar initials={person.initials} className="size-8 text-xs font-semibold shrink-0" />
                      <strong className="truncate text-sm font-semibold text-zinc-900">{person.name}</strong>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-700">
                        {person.revenue}
                      </span>
                      <span className="inline-flex items-center gap-0.5 rounded-md bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700">
                        ★ {person.score}
                      </span>
                    </div>
                  </div>

                  {/* Line 2 for Mobile (< lg): Appointments, Presence, Occupancy indented under name */}
                  <div className="flex items-center gap-1.5 text-xs text-zinc-500 min-w-0 overflow-hidden whitespace-nowrap pl-[42px] lg:hidden">
                    <span className="font-medium text-zinc-700 shrink-0">{person.appointments} atendimentos</span>
                    <span className="text-zinc-300 shrink-0">•</span>
                    <span className="shrink-0">Presença: {person.presence}</span>
                    <span className="text-zinc-300 shrink-0">•</span>
                    <span className="shrink-0">Ocupação: {person.occupancy}</span>
                  </div>

                  {/* Desktop Professional Info */}
                  <div className="hidden lg:flex items-center gap-3 min-w-0">
                    <Avatar initials={person.initials} />
                    <strong className="truncate">{person.name}</strong>
                  </div>

                  {/* Desktop Appointments */}
                  <span className="hidden lg:block text-zinc-700">{person.appointments}</span>

                  {/* Desktop Presence */}
                  <span className="hidden lg:block text-zinc-700">{person.presence}</span>

                  {/* Desktop Occupancy */}
                  <span className="hidden lg:block text-zinc-700">{person.occupancy}</span>

                  {/* Desktop Revenue */}
                  <strong className="hidden lg:block text-zinc-900">{person.revenue}</strong>

                  {/* Desktop Score */}
                  <span className="hidden lg:flex items-center gap-1 font-medium text-amber-600">
                    ★ {person.score}
                  </span>

                  {/* Desktop Actions Menu */}
                  <div className="hidden lg:flex relative justify-end">
                    <button type="button" className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-100">
                      <MoreHorizontal className="size-4" />
                    </button>
                  </div>
                </div>
              ))}
            </>
          ) : (
            <div className="flex h-48 items-center justify-center text-zinc-400">
              <p>Nenhum profissional com agendamentos</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
