"use client";

import { useState } from "react";
import Link from "next/link";
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
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Bell,
  CalendarDays,
  ChartNoAxesCombined,
  ChevronDown,
  Clock3,
  Download,
  LayoutDashboard,
  LogOut,
  Menu,
  MoreHorizontal,
  Settings,
  TrendingUp,
  UserRoundCheck,
  UsersRound,
  WalletCards,
  X,
} from "lucide-react";
import { Avatar } from "@/app/(agendamentos)/_components/ui/avatar";
import { Badge } from "@/app/(agendamentos)/_components/ui/badge";
import { Button } from "@/app/(agendamentos)/_components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/(agendamentos)/_components/ui/card";
import { cn } from "@/lib/utils";
import { appointmentChannels } from "@/app/mocks/scheduling";

const digitalChannels = appointmentChannels.filter((channel) => channel.digital);
const digitalChannelTotal = digitalChannels.reduce(
  (total, channel) => total + channel.value,
  0,
);
const digitalChannelPercent = digitalChannels.reduce(
  (total, channel) => total + channel.percent,
  0,
);

const monthly = [
  { month: "Fev", agendamentos: 214, cancelados: 19, receita: 29100 },
  { month: "Mar", agendamentos: 248, cancelados: 16, receita: 33600 },
  { month: "Abr", agendamentos: 236, cancelados: 21, receita: 32400 },
  { month: "Mai", agendamentos: 287, cancelados: 18, receita: 39800 },
  { month: "Jun", agendamentos: 305, cancelados: 15, receita: 44200 },
  { month: "Jul", agendamentos: 342, cancelados: 17, receita: 48600 },
];

const statusData = [
  { name: "Concluídos", value: 286, color: "#18181b" },
  { name: "Confirmados", value: 30, color: "#71717a" },
  { name: "Cancelados", value: 17, color: "#d4d4d8" },
  { name: "Não compareceu", value: 9, color: "#f4f4f5" },
];

const services = [
  { name: "Consulta inicial", total: 92, receita: "R$ 13.800" },
  { name: "Retorno", total: 76, receita: "R$ 7.600" },
  { name: "Avaliação", total: 61, receita: "R$ 9.150" },
  { name: "Limpeza de pele", total: 48, receita: "R$ 9.072" },
  { name: "Procedimento", total: 39, receita: "R$ 7.410" },
  { name: "Outros", total: 26, receita: "R$ 1.568" },
];

const hourly = [
  { hour: "08h", ocupacao: 42 },
  { hour: "09h", ocupacao: 76 },
  { hour: "10h", ocupacao: 94 },
  { hour: "11h", ocupacao: 81 },
  { hour: "12h", ocupacao: 34 },
  { hour: "13h", ocupacao: 68 },
  { hour: "14h", ocupacao: 86 },
  { hour: "15h", ocupacao: 97 },
  { hour: "16h", ocupacao: 89 },
  { hour: "17h", ocupacao: 72 },
  { hour: "18h", ocupacao: 48 },
];

const weekMatrix = [
  { day: "Seg", values: [1, 2, 3, 3, 2, 1, 0] },
  { day: "Ter", values: [2, 3, 4, 4, 3, 2, 1] },
  { day: "Qua", values: [1, 3, 4, 3, 4, 2, 1] },
  { day: "Qui", values: [2, 4, 4, 4, 3, 3, 1] },
  { day: "Sex", values: [1, 3, 4, 4, 4, 2, 1] },
  { day: "Sáb", values: [3, 4, 4, 3, 2, 0, 0] },
];

const professionals = [
  {
    name: "Ana Souza",
    initials: "AS",
    appointments: 126,
    presence: "94%",
    occupancy: "86%",
    revenue: "R$ 19.420",
    score: "4,9",
  },
  {
    name: "Clara Mendes",
    initials: "CM",
    appointments: 98,
    presence: "91%",
    occupancy: "79%",
    revenue: "R$ 15.870",
    score: "4,8",
  },
  {
    name: "Paula Freitas",
    initials: "PF",
    appointments: 74,
    presence: "89%",
    occupancy: "72%",
    revenue: "R$ 9.760",
    score: "4,9",
  },
  {
    name: "Bruna Lima",
    initials: "BL",
    appointments: 44,
    presence: "93%",
    occupancy: "64%",
    revenue: "R$ 3.550",
    score: "4,7",
  },
];

const clients = [
  {
    name: "Marina Costa",
    initials: "MC",
    visits: 9,
    spent: "R$ 1.890",
    last: "29 jul",
    status: "Recorrente",
  },
  {
    name: "Beatriz Lima",
    initials: "BL",
    visits: 8,
    spent: "R$ 1.640",
    last: "30 jul",
    status: "Recorrente",
  },
  {
    name: "Camila Rocha",
    initials: "CR",
    visits: 7,
    spent: "R$ 1.420",
    last: "27 jul",
    status: "Recorrente",
  },
  {
    name: "Rafael Alves",
    initials: "RA",
    visits: 6,
    spent: "R$ 1.180",
    last: "31 jul",
    status: "Ativo",
  },
  {
    name: "Lucas Mendes",
    initials: "LM",
    visits: 5,
    spent: "R$ 980",
    last: "24 jul",
    status: "Ativo",
  },
];

function ReportSidebar({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
}) {
  const items = [
    { label: "Início", icon: LayoutDashboard, href: "/dashboard" },
    { label: "Agendamentos", icon: CalendarDays, href: "/agendamentos" },
    { label: "Usuários", icon: UsersRound, href: "/usuarios" },
    {
      label: "Relatórios",
      icon: ChartNoAxesCombined,
      href: "/relatorios",
      active: true,
    },
  ];
  return (
    <>
      {open && (
        <button
          aria-label="Fechar menu"
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[256px] flex-col border-r border-zinc-200 bg-white p-4 transition-transform duration-300 lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-14 items-center justify-between px-2">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-xl bg-black text-white">
              <CalendarDays className="size-[18px]" />
            </span>
            <span className="font-semibold tracking-tight">Atempo</span>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setOpen(false)}
          >
            <X />
          </Button>
        </div>
        <div className="mt-8 px-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-400">
          Menu principal
        </div>
        <nav className="mt-3 space-y-1">
          {items.map(({ label, icon: Icon, href, active }) => (
            <Link
              key={label}
              href={href}
              className={cn(
                "flex h-11 w-full items-center gap-3 rounded-xl px-3 text-sm font-medium transition",
                active
                  ? "bg-zinc-950 text-white shadow-sm"
                  : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950",
              )}
            >
              <span className="flex size-[18px] shrink-0 items-center justify-center">
                <Icon className="size-[18px] stroke-[1.75]" />
              </span>
              <span className="text-[14px] font-medium leading-5">{label}</span>
              {label === "Agendamentos" && (
                <span className="ml-auto rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] text-zinc-500">
                  5
                </span>
              )}
            </Link>
          ))}
        </nav>
        <div className="mt-auto space-y-1">
          <Link
            href="/"
            className="flex h-10 w-full items-center gap-3 rounded-xl px-3 text-sm font-medium text-zinc-500 hover:bg-zinc-100 hover:text-zinc-950"
          >
            <span className="flex size-[18px] shrink-0 items-center justify-center">
              <Settings className="size-[18px] stroke-[1.75]" />
            </span>
            <span className="text-[14px] font-medium leading-5">
              Configurações
            </span>
          </Link>
          <div className="my-3 h-px bg-zinc-100" />
          <div className="flex items-center gap-3 rounded-xl p-2">
            <Avatar
              initials="AS"
              className="size-10 bg-zinc-950 text-white ring-0"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-zinc-900">
                Ana Souza
              </p>
              <p className="text-xs text-zinc-400">Administrador</p>
            </div>
            <Link
              href="/"
              title="Sair"
              className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-950"
            >
              <LogOut className="size-4" />
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color?: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-3 text-xs shadow-xl">
      <p className="mb-2 font-semibold text-zinc-900">{label}</p>
      {payload.map((item) => (
        <div
          key={item.name}
          className="flex min-w-32 items-center justify-between gap-5 py-0.5"
        >
          <span className="flex items-center gap-1.5 text-zinc-500">
            <i
              className="size-2 rounded-full"
              style={{ background: item.color }}
            />
            {item.name}
          </span>
          <strong>{item.value.toLocaleString("pt-BR")}</strong>
        </div>
      ))}
    </div>
  );
}

function MetricCard({
  title,
  value,
  change,
  description,
  icon: Icon,
  positive = true,
}: {
  title: string;
  value: string;
  change: string;
  description: string;
  icon: typeof CalendarDays;
  positive?: boolean;
}) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <span className="flex size-10 items-center justify-center rounded-xl bg-zinc-100 text-zinc-700">
            <Icon className="size-5" />
          </span>
          <Badge variant={positive ? "success" : "secondary"}>
            {positive ? (
              <ArrowUpRight className="mr-1 size-3" />
            ) : (
              <ArrowDownRight className="mr-1 size-3" />
            )}
            {change}
          </Badge>
        </div>
        <p className="mt-5 text-sm font-medium text-zinc-500">{title}</p>
        <p className="mt-1 text-3xl font-semibold tracking-[-0.04em]">
          {value}
        </p>
        <p className="mt-2 text-xs text-zinc-400">{description}</p>
      </CardContent>
    </Card>
  );
}

function SectionHead({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <CardHeader className="flex-row items-start justify-between">
      <div>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </div>
      {action}
    </CardHeader>
  );
}

export function ReportsDashboard() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [period, setPeriod] = useState("Últimos 6 meses");
  const heatColors = [
    "bg-zinc-100",
    "bg-zinc-200",
    "bg-zinc-400",
    "bg-zinc-600",
    "bg-zinc-950",
  ];

  return (
    <div className="min-h-screen bg-[#f4f4f5] text-zinc-950">
      <ReportSidebar open={menuOpen} setOpen={setMenuOpen} />
      <div className="lg:pl-[256px]">
        <header className="sticky top-0 z-30 flex min-h-[84px] items-center gap-4 border-b border-zinc-200 bg-white/90 px-4 backdrop-blur sm:px-6 lg:px-8">
          <Button
            variant="outline"
            size="icon"
            className="lg:hidden"
            onClick={() => setMenuOpen(true)}
          >
            <Menu />
          </Button>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-xl font-semibold tracking-[-0.02em] text-zinc-950 sm:text-2xl">
              Relatórios
            </h1>
            <p className="hidden truncate text-sm text-zinc-500 sm:block">
              Dados consolidados para acompanhar a operação.
            </p>
          </div>
          <button className="relative flex size-10 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50">
            <Bell className="size-[18px]" />
            <span className="absolute right-2 top-2 size-1.5 rounded-full bg-black ring-2 ring-white" />
          </button>
          <div className="hidden h-8 w-px bg-zinc-200 sm:block" />
          <div className="hidden items-center gap-2 sm:flex">
            <Avatar
              initials="AS"
              className="size-9 bg-zinc-950 text-white ring-0"
            />
            <ChevronDown className="size-4 text-zinc-400" />
          </div>
        </header>

        <main className="mx-auto max-w-[1560px] p-4 sm:p-6 lg:p-8">
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
              <Button variant="outline">
                <Download /> Exportar
              </Button>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              title="Total de agendamentos"
              value="342"
              change="12,1%"
              description="37 a mais que no período anterior"
              icon={CalendarDays}
            />
            <MetricCard
              title="Receita estimada"
              value="R$ 48,6 mil"
              change="9,9%"
              description="Ticket médio de R$ 169,90"
              icon={WalletCards}
            />
            <MetricCard
              title="Taxa de comparecimento"
              value="92,1%"
              change="2,4%"
              description="286 atendimentos concluídos"
              icon={UserRoundCheck}
            />
            <MetricCard
              title="Taxa de ocupação"
              value="78,4%"
              change="4,7%"
              description="264 horas reservadas no mês"
              icon={Clock3}
            />
          </div>

          <div className="mt-4 grid gap-4 xl:grid-cols-[1.55fr_1fr]">
            <Card>
              <SectionHead
                title="Evolução dos agendamentos"
                description={`${period} · volume total e cancelamentos`}
                action={
                  <Badge variant="outline">
                    <TrendingUp className="mr-1 size-3" /> Tendência positiva
                  </Badge>
                }
              />
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={monthly}
                      margin={{ left: -22, right: 6, top: 10 }}
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
                        tick={{ fill: "#a1a1aa", fontSize: 11 }}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#a1a1aa", fontSize: 11 }}
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
                </div>
                <div className="mt-2 flex justify-center gap-5 text-[11px] text-zinc-500">
                  <span className="flex items-center gap-1.5">
                    <i className="size-2 rounded-full bg-zinc-950" />{" "}
                    Agendamentos
                  </span>
                  <span className="flex items-center gap-1.5">
                    <i className="size-2 rounded-full bg-zinc-400" />{" "}
                    Cancelamentos
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <SectionHead
                title="Status dos agendamentos"
                description="Distribuição do período"
              />
              <CardContent>
                <div className="relative h-[210px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusData}
                        dataKey="value"
                        innerRadius={66}
                        outerRadius={92}
                        paddingAngle={2}
                        stroke="none"
                      >
                        {statusData.map((item) => (
                          <Cell key={item.name} fill={item.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                    <strong className="text-3xl">342</strong>
                    <span className="text-[11px] text-zinc-400">total</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {statusData.map((item) => (
                    <div
                      key={item.name}
                      className="flex items-center gap-2 text-xs"
                    >
                      <i
                        className="size-2.5 rounded-full"
                        style={{ background: item.color }}
                      />
                      <span className="min-w-0 flex-1 truncate text-zinc-500">
                        {item.name}
                      </span>
                      <strong>{item.value}</strong>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

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
              />
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={services}
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
                        fill="#18181b"
                        radius={[0, 5, 5, 0]}
                        barSize={18}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            <Card>
              <SectionHead
                title="Ocupação por horário"
                description="Percentual médio de horários preenchidos"
                action={<Badge variant="secondary">Pico: 15h</Badge>}
              />
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={hourly}
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
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-4 grid gap-4 xl:grid-cols-[1.15fr_.85fr]">
            <Card>
              <SectionHead
                title="Mapa de ocupação semanal"
                description="Intensidade de procura por dia e período"
              />
              <CardContent>
                <div className="overflow-x-auto">
                  <div className="min-w-[560px]">
                    <div className="mb-2 grid grid-cols-[44px_repeat(7,1fr)] gap-2 text-center text-[10px] font-medium text-zinc-400">
                      <span />
                      <span>08–09</span>
                      <span>09–10</span>
                      <span>10–11</span>
                      <span>13–14</span>
                      <span>14–15</span>
                      <span>15–16</span>
                      <span>16–18</span>
                    </div>
                    {weekMatrix.map((row) => (
                      <div
                        key={row.day}
                        className="mb-2 grid grid-cols-[44px_repeat(7,1fr)] gap-2"
                      >
                        <span className="flex items-center text-xs font-medium text-zinc-500">
                          {row.day}
                        </span>
                        {row.values.map((value, index) => (
                          <div
                            key={index}
                            title={`${row.day}: intensidade ${value}`}
                            className={cn("h-9 rounded-md", heatColors[value])}
                          />
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mt-5 flex items-center justify-end gap-2 text-[10px] text-zinc-400">
                  <span>Menor procura</span>
                  {heatColors.map((color) => (
                    <i key={color} className={cn("size-3 rounded-sm", color)} />
                  ))}
                  <span>Maior procura</span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <SectionHead
                title="Origem dos agendamentos"
                description="Canais usados pelos clientes"
              />
              <CardContent className="space-y-6">
                {appointmentChannels.map((channel) => (
                  <div key={channel.name}>
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className="font-medium text-zinc-700">
                        {channel.name}
                      </span>
                      <span>
                        <strong>{channel.value}</strong>{" "}
                        <small className="text-zinc-400">
                          ({channel.percent}%)
                        </small>
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-zinc-100">
                      <div
                        className="h-full rounded-full bg-zinc-950"
                        style={{ width: `${channel.percent}%` }}
                      />
                    </div>
                  </div>
                ))}
                <div className="rounded-xl bg-zinc-50 p-4 text-xs leading-5 text-zinc-500">
                  <strong className="block text-sm text-zinc-900">
                    {digitalChannelPercent}% chegam por canais digitais
                  </strong>
                  Canais digitais são responsáveis por {digitalChannelTotal}{" "}
                  agendamentos.
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="mt-4 overflow-hidden">
            <SectionHead
              title="Desempenho por profissional"
              description="Produtividade, presença, ocupação e receita"
              action={
                <Button variant="outline" size="sm">
                  Ver equipe <ArrowRight />
                </Button>
              }
            />
            <div className="overflow-x-auto">
              <div className="min-w-[820px]">
                <div className="grid grid-cols-[1.4fr_repeat(5,.8fr)_40px] gap-4 border-y border-zinc-200 bg-zinc-50 px-5 py-3 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                  <span>Profissional</span>
                  <span>Atendimentos</span>
                  <span>Presença</span>
                  <span>Ocupação</span>
                  <span>Receita</span>
                  <span>Avaliação</span>
                  <span />
                </div>
                {professionals.map((person) => (
                  <div
                    key={person.name}
                    className="grid grid-cols-[1.4fr_repeat(5,.8fr)_40px] items-center gap-4 border-b border-zinc-100 px-5 py-4 text-sm last:border-0 hover:bg-zinc-50"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar initials={person.initials} />
                      <strong>{person.name}</strong>
                    </div>
                    <span>{person.appointments}</span>
                    <span>{person.presence}</span>
                    <span>{person.occupancy}</span>
                    <strong>{person.revenue}</strong>
                    <span className="flex items-center gap-1">
                      ★ {person.score}
                    </span>
                    <button className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-100">
                      <MoreHorizontal className="size-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          <div className="mt-4 grid gap-4 xl:grid-cols-[1.25fr_.75fr]">
            <Card className="overflow-hidden">
              <SectionHead
                title="Clientes com maior recorrência"
                description="Frequência e valor acumulado no período"
              />
              <div className="overflow-x-auto">
                <div className="min-w-[620px]">
                  <div className="grid grid-cols-[1.5fr_repeat(4,.7fr)] gap-4 border-y border-zinc-200 bg-zinc-50 px-5 py-3 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                    <span>Cliente</span>
                    <span>Visitas</span>
                    <span>Valor</span>
                    <span>Última visita</span>
                    <span>Perfil</span>
                  </div>
                  {clients.map((client) => (
                    <div
                      key={client.name}
                      className="grid grid-cols-[1.5fr_repeat(4,.7fr)] items-center gap-4 border-b border-zinc-100 px-5 py-3.5 text-sm last:border-0"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar initials={client.initials} />
                        <strong>{client.name}</strong>
                      </div>
                      <span>{client.visits}</span>
                      <strong>{client.spent}</strong>
                      <span className="text-zinc-500">{client.last}</span>
                      <Badge
                        variant={
                          client.status === "Recorrente"
                            ? "default"
                            : "secondary"
                        }
                        className="w-fit"
                      >
                        {client.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
            <Card>
              <SectionHead
                title="Resumo financeiro"
                description="Receita estimada do mês"
              />
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between rounded-xl bg-zinc-950 p-5 text-white">
                    <div>
                      <p className="text-xs text-zinc-400">Receita bruta</p>
                      <strong className="mt-1 block text-2xl">R$ 48.600</strong>
                    </div>
                    <WalletCards className="size-6 text-zinc-500" />
                  </div>
                  {[
                    { label: "Recebido", value: "R$ 42.380", percent: 87 },
                    { label: "A receber", value: "R$ 4.720", percent: 10 },
                    { label: "Cancelado", value: "R$ 1.500", percent: 3 },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center justify-between border-b border-zinc-100 pb-3 text-sm last:border-0"
                    >
                      <span className="text-zinc-500">{item.label}</span>
                      <span>
                        <strong>{item.value}</strong>{" "}
                        <small className="ml-1 text-zinc-400">
                          {item.percent}%
                        </small>
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-5 flex items-center justify-between rounded-xl bg-emerald-50 p-4">
                  <div>
                    <p className="text-xs text-emerald-700">
                      Crescimento mensal
                    </p>
                    <strong className="text-lg text-emerald-900">
                      + R$ 4.400
                    </strong>
                  </div>
                  <ArrowUpRight className="size-5 text-emerald-700" />
                </div>
              </CardContent>
            </Card>
          </div>

          <p className="mt-5 text-center text-[11px] text-zinc-400">
            Todos os dados desta tela são simulados para demonstração do MVP.
          </p>
        </main>
      </div>
    </div>
  );
}
