import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ArrowRight, CalendarDays, ShoppingBag, TrendingUp, WalletCards } from "lucide-react";
import { Badge } from "@/app/(agendamentos)/(left-nav-bar)/_components/ui/badge";
import { Button } from "@/app/(agendamentos)/(left-nav-bar)/_components/ui/button";
import { Card, CardContent } from "@/app/(agendamentos)/(left-nav-bar)/_components/ui/card";
import type { ReportMetrics } from "@core/application/reports/get-report-metrics.usecase";
import { CustomTooltip, SectionHead } from "./report-shared";

export function ReportTrendCharts({
  dbMetrics,
  period,
}: {
  dbMetrics: ReportMetrics | null;
  period: string;
}) {
  return (
    <div className="mt-4 grid gap-4 xl:grid-cols-3">
      <Card className="flex flex-col overflow-hidden">
        <SectionHead
          title="Resumo financeiro"
          description="Receita estimada do período"
          info={{
            title: "Resumo Financeiro",
            whatIsIt: "Divisão da receita estimada em Serviços (Agendamentos) e Produtos (Vendas no Caixa), com tickets médios.",
            howItIsCalculated: "Lucro Serviços = Σ(Preço Serviço) | Lucro Produtos = Σ(Valor Vendas) | Ticket Médio = Receita Total ÷ Registros",
            exampleOrNote: "Compara a rentabilidade da prestação de serviços com a venda de produtos.",
          }}
        />
        <CardContent className="flex-1 flex flex-col justify-between p-3.5 sm:p-5 space-y-3 sm:space-y-4">
          {/* Main Total Revenue */}
          <div className="rounded-xl border border-zinc-200/80 bg-zinc-50/70 p-3 sm:p-4">
            <span className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
              Receita Total do Período
            </span>
            <div className="mt-1 flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 sm:gap-2">
              <span className="text-xl sm:text-2xl font-bold text-zinc-950 truncate">
                {dbMetrics?.estimatedRevenue || "R$ 0,00"}
              </span>
              <span className="text-[10px] sm:text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60 w-fit">
                Agendamentos + Vendas
              </span>
            </div>
          </div>

          {/* Breakdown: Services vs Products */}
          <div className="space-y-3">
            {/* Services (Agendamentos) */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="flex items-center gap-1.5 font-medium text-zinc-700">
                  <CalendarDays className="size-3.5 text-zinc-500" />
                  Lucro de Agendamentos
                </span>
                <span className="font-semibold text-zinc-900">
                  {dbMetrics?.servicesRevenue || "R$ 0,00"}{" "}
                  <span className="text-[11px] font-normal text-zinc-400">
                    ({dbMetrics?.servicesPercent || 0}%)
                  </span>
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-100">
                <div
                  className="h-full rounded-full bg-zinc-950 transition-all duration-500"
                  style={{ width: `${dbMetrics?.servicesPercent || 0}%` }}
                />
              </div>
            </div>

            {/* Products (Vendas) */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="flex items-center gap-1.5 font-medium text-zinc-700">
                  <ShoppingBag className="size-3.5 text-zinc-500" />
                  Lucro de Produtos
                </span>
                <span className="font-semibold text-zinc-900">
                  {dbMetrics?.productsRevenue || "R$ 0,00"}{" "}
                  <span className="text-[11px] font-normal text-zinc-400">
                    ({dbMetrics?.productsPercent || 0}%)
                  </span>
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-100">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                  style={{ width: `${dbMetrics?.productsPercent || 0}%` }}
                />
              </div>
            </div>
          </div>

          {/* Sub-Metrics: Tickets */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-zinc-100 text-xs">
            <div className="rounded-lg bg-zinc-50 p-2.5">
              <span className="text-[10px] text-zinc-500 block">Ticket Médio (Serviços)</span>
              <strong className="text-zinc-900 text-xs font-semibold">{dbMetrics?.avgAppointmentTicket || "R$ 0,00"}</strong>
            </div>
            <div className="rounded-lg bg-zinc-50 p-2.5">
              <span className="text-[10px] text-zinc-500 block">Ticket Médio (Vendas)</span>
              <strong className="text-zinc-900 text-xs font-semibold">{dbMetrics?.avgSaleTicket || "R$ 0,00"}</strong>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="flex flex-col overflow-hidden border-zinc-200/80 bg-white shadow-xs">
        <SectionHead
          title="Evolução dos agendamentos"
          description={`${period} · volume total e cancelamentos`}
          action={
            <Badge variant="outline" className="w-fit text-[10px] sm:text-xs">
              <TrendingUp className="mr-1 size-3" /> Tendência positiva
            </Badge>
          }
          info={{
            title: "Evolução dos Agendamentos",
            whatIsIt: "Acompanhamento mês a mês da quantidade de novos agendamentos criados e cancelamentos.",
            howItIsCalculated: "Agrupamento dos compromissos por mês com base no período selecionado.",
            exampleOrNote: "Permite monitorar a sazonalidade e taxa de desistência.",
          }}
        />
        <CardContent className="p-3.5 sm:p-5 flex-1 flex flex-col justify-between">
          <div className="h-[210px] sm:h-[250px] w-full min-w-0">
            {dbMetrics?.monthlyData && dbMetrics.monthlyData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={dbMetrics.monthlyData}
                  margin={{ left: -26, right: 6, top: 10, bottom: 0 }}
                >
                  <defs>
                    <linearGradient
                      id="bookings"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor="#18181b"
                        stopOpacity={0.2}
                      />
                      <stop
                        offset="100%"
                        stopColor="#18181b"
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    stroke="#e4e4e7"
                    strokeDasharray="3 3"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#a1a1aa", fontSize: 10 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#a1a1aa", fontSize: 10 }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="agendamentos"
                    name="Agendamentos"
                    stroke="#18181b"
                    strokeWidth={2.5}
                    fill="url(#bookings)"
                  />
                  <Line
                    type="monotone"
                    dataKey="cancelados"
                    name="Cancelados"
                    stroke="#a1a1aa"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-zinc-400 text-xs">
                <p>Nenhum dado disponível para o período</p>
              </div>
            )}
          </div>
          {dbMetrics?.monthlyData && dbMetrics.monthlyData.length > 0 && (
            <div className="mt-2 flex justify-center gap-4 sm:gap-5 text-[10px] sm:text-[11px] text-zinc-500">
              <span className="flex items-center gap-1.5">
                <i className="size-2 rounded-full bg-zinc-950" />{" "}
                Agendamentos
              </span>
              <span className="flex items-center gap-1.5">
                <i className="size-2 rounded-full bg-zinc-400" />{" "}
                Cancelamentos
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="flex flex-col overflow-hidden border-zinc-200/80 bg-white shadow-xs">
        <SectionHead
          title="Status dos agendamentos"
          description="Distribuição do período"
          align="right"
          info={{
            title: "Status dos Agendamentos",
            whatIsIt: "Distribuição percentual dos estados dos agendamentos no período.",
            howItIsCalculated: "Proporção de cada status (Concluído, Confirmado, Cancelado, Pendente) sobre o total geral.",
            exampleOrNote: "Mede a saúde operacional da sua agenda.",
          }}
        />
        <CardContent className="p-3.5 sm:p-5 flex-1 flex flex-col justify-center gap-3 sm:gap-4">
          <div className="relative h-[180px] sm:h-[210px] w-full">
            {dbMetrics?.statusData && dbMetrics.statusData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={dbMetrics.statusData}
                      dataKey="value"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={2}
                      stroke="none"
                    >
                      {dbMetrics.statusData.map((item) => (
                        <Cell key={item.name} fill={item.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                  <strong className="text-xl sm:text-3xl">{dbMetrics.statusData.reduce((sum, s) => sum + s.value, 0)}</strong>
                  <span className="text-[10px] sm:text-[11px] text-zinc-400">total</span>
                </div>
              </>
            ) : (
              <div className="flex h-full items-center justify-center text-zinc-400 text-xs">
                <p>Nenhum dado disponível</p>
              </div>
            )}
          </div>
          {dbMetrics?.statusData && dbMetrics.statusData.length > 0 && (
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              {dbMetrics.statusData.map((item) => (
                <div
                  key={item.name}
                  className="flex items-center gap-1.5 text-[11px] sm:text-xs"
                >
                  <i
                    className="size-2 rounded-full shrink-0"
                    style={{ background: item.color }}
                  />
                  <span className="min-w-0 flex-1 truncate text-zinc-500">
                    {item.name}
                  </span>
                  <strong className="shrink-0">{item.value}</strong>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export function ReportServiceCharts({
  dbMetrics,
}: {
  dbMetrics: ReportMetrics | null;
}) {
  return (
    <div className="mt-4 grid gap-4 xl:grid-cols-2">
      <Card>
        <SectionHead
          title="Serviços mais agendados"
          description="Volume e receita estimada por serviço"
          action={
            <Button variant="ghost" size="sm">
              Detalhes <ArrowRight />
            </Button>
          }
          info={{
            title: "Serviços Mais Agendados",
            whatIsIt: "Ranking dos serviços com maior volume de agendamentos e faturamento gerado.",
            howItIsCalculated: "Contagem de agendamentos ordenada pelo número de ocorrências por serviço.",
            exampleOrNote: "Identifica os serviços campeões de vendas do estabelecimento.",
          }}
        />
        <CardContent>
          <div className="h-[300px]">
            {dbMetrics?.servicesData && dbMetrics.servicesData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={dbMetrics.servicesData}
                  layout="vertical"
                  margin={{ left: 8, right: 20 }}
                >
                  <CartesianGrid
                    horizontal={false}
                    stroke="#e4e4e7"
                    strokeDasharray="3 3"
                  />
                  <XAxis
                    type="number"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#a1a1aa", fontSize: 10 }}
                  />
                  <YAxis
                    dataKey="name"
                    type="category"
                    width={112}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#71717a", fontSize: 10 }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar
                    dataKey="total"
                    name="Agendamentos"
                    radius={[0, 5, 5, 0]}
                    barSize={18}
                  >
                    {dbMetrics.servicesData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-zinc-400">
                <p>Nenhum serviço agendado</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      <Card>
        <SectionHead
          title="Ocupação por horário"
          description="Distribuição de agendamentos"
          action={<Badge variant="secondary">Pico: {dbMetrics?.peakHour || "—"}</Badge>}
          align="right"
          info={{
            title: "Ocupação por Horário",
            whatIsIt: "Distribuição da intensidade de agendamentos ao longo das horas do dia de funcionamento.",
            howItIsCalculated: "Soma de agendamentos por hora de início | Pico = hora de maior concentração.",
            exampleOrNote: "Útil para organizar escalas e turnos dos profissionais.",
          }}
        />
        <CardContent>
          <div className="h-[300px]">
            {dbMetrics?.hourlyData && dbMetrics.hourlyData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={dbMetrics.hourlyData}
                  margin={{ left: -25, right: 15, top: 10 }}
              >
                <CartesianGrid
                  stroke="#e4e4e7"
                  strokeDasharray="3 3"
                  vertical={false}
                />
                <XAxis
                  dataKey="hour"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#a1a1aa", fontSize: 10 }}
                />
                <YAxis
                  domain={[0, 100]}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#a1a1aa", fontSize: 10 }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="ocupacao"
                  name="Ocupação (%)"
                  stroke="#18181b"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: "#fff", strokeWidth: 2 }}
                  activeDot={{ r: 5, fill: "#18181b" }}
                />
              </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-zinc-400">
                <p>Nenhum dado disponível</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
