"use client";

import { useMemo, useState } from "react";
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
  CalendarClock,
  CalendarDays,
  ChartNoAxesCombined,
  ChevronDown,
  Clock3,
  Download,
  LayoutDashboard,
  LogOut,
  Menu,
  MoreHorizontal,
  Package,
  Settings,
  TrendingUp,
  UserRoundCheck,
  UsersRound,
  WalletCards,
  X,
} from "lucide-react";
import { Avatar } from "@/app/(agendamentos)/_components/ui/avatar.component";
import { Badge } from "@/app/(agendamentos)/_components/ui/badge.component";
import { Button } from "@/app/(agendamentos)/_components/ui/button.component";
import { BrandLogo } from "@/app/(agendamentos)/_components/brand-logo.component";
import { useAppData } from "@/app/(agendamentos)/_components/app-data-provider.component";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/(agendamentos)/_components/ui/card.component";
import { cn } from "@/lib/utils";
import { appointmentChannels } from "@/app/mocks/scheduling";

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  });
}

function initials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("");
}

function percentageChange(current: number, previous: number) {
  if (!previous) return current ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

function ReportSidebar({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
}) {
  const items = [
    { label: "Início", icon: LayoutDashboard, href: "/dashboard" },
    { label: "Agenda", icon: CalendarClock, href: "/agenda" },
    { label: "Agendamentos", icon: CalendarDays, href: "/agendamentos" },
    { label: "Usuários", icon: UsersRound, href: "/usuarios" },
    { label: "Produtos", icon: Package, href: "/produtos" },
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
        <div className="relative flex h-20 items-center justify-center px-2">
          <Link href="/dashboard" aria-label="Ir para o início">
            <BrandLogo />
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 lg:hidden"
            onClick={() => setOpen(false)}
          >
            <X />
          </Button>
        </div>
        <div className="mt-3 px-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-400">
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
  const { appointments } = useAppData();
  const [menuOpen, setMenuOpen] = useState(false);
  const [period, setPeriod] = useState("Últimos 6 meses");
  const [toast, setToast] = useState("");
  const heatColors = [
    "bg-zinc-100",
    "bg-zinc-200",
    "bg-zinc-400",
    "bg-zinc-600",
    "bg-zinc-950",
  ];
  const monthsInPeriod =
    period === "Este mês"
      ? 1
      : period === "Últimos 3 meses"
        ? 3
        : period === "Últimos 6 meses"
          ? 6
          : 12;
  const periodStart = new Date(2026, 8 - monthsInPeriod, 1).getTime();
  const previousStart = new Date(2026, 8 - monthsInPeriod * 2, 1).getTime();
  const previousEnd = new Date(periodStart);
  previousEnd.setDate(0);
  const filteredAppointments = useMemo(
    () =>
      appointments.filter((appointment) => {
        const date = new Date(`${appointment.date}T12:00:00`);
        return (
          date.getTime() >= periodStart &&
          date <= new Date("2026-08-31T23:59:59")
        );
      }),
    [appointments, periodStart],
  );
  const previousAppointments = appointments.filter((appointment) => {
    const date = new Date(`${appointment.date}T12:00:00`);
    return date.getTime() >= previousStart && date <= previousEnd;
  });
  const payableAppointments = filteredAppointments.filter(
    (appointment) =>
      appointment.status !== "Cancelado" &&
      appointment.status !== "Não compareceu",
  );
  const previousPayable = previousAppointments.filter(
    (appointment) =>
      appointment.status !== "Cancelado" &&
      appointment.status !== "Não compareceu",
  );
  const totalRevenue = payableAppointments.reduce(
    (total, appointment) => total + appointment.price,
    0,
  );
  const previousRevenue = previousPayable.reduce(
    (total, appointment) => total + appointment.price,
    0,
  );
  const completed = filteredAppointments.filter(
    (appointment) => appointment.status === "Concluído",
  ).length;
  const attendanceBase = filteredAppointments.filter(
    (appointment) =>
      appointment.status !== "Cancelado" && appointment.status !== "Pendente",
  ).length;
  const attendanceRate = attendanceBase ? (completed / attendanceBase) * 100 : 0;
  const occupiedMinutes = payableAppointments.reduce(
    (total, appointment) => total + appointment.durationMinutes,
    0,
  );
  const capacityMinutes = monthsInPeriod * 28 * 10 * 60;
  const occupancyRate = capacityMinutes
    ? Math.min(100, (occupiedMinutes / capacityMinutes) * 100)
    : 0;
  const appointmentChange = percentageChange(
    filteredAppointments.length,
    previousAppointments.length,
  );
  const revenueChange = percentageChange(totalRevenue, previousRevenue);

  const monthly = useMemo(() => {
    const grouped = new Map<
      string,
      { key: string; month: string; agendamentos: number; cancelados: number; receita: number }
    >();
    filteredAppointments.forEach((appointment) => {
      const date = new Date(`${appointment.date}T12:00:00`);
      const key = appointment.date.slice(0, 7);
      const current = grouped.get(key) ?? {
        key,
        month: new Intl.DateTimeFormat("pt-BR", { month: "short" })
          .format(date)
          .replace(".", ""),
        agendamentos: 0,
        cancelados: 0,
        receita: 0,
      };
      current.agendamentos += 1;
      if (appointment.status === "Cancelado") current.cancelados += 1;
      if (
        appointment.status !== "Cancelado" &&
        appointment.status !== "Não compareceu"
      ) {
        current.receita += appointment.price;
      }
      grouped.set(key, current);
    });
    return Array.from(grouped.values()).sort((a, b) => a.key.localeCompare(b.key));
  }, [filteredAppointments]);

  const statusData = [
    { name: "Concluídos", status: "Concluído", color: "#18181b" },
    { name: "Confirmados", status: "Confirmado", color: "#71717a" },
    { name: "Pendentes", status: "Pendente", color: "#a1a1aa" },
    { name: "Cancelados", status: "Cancelado", color: "#d4d4d8" },
    { name: "Não compareceu", status: "Não compareceu", color: "#f4f4f5" },
  ].map((item) => ({
    ...item,
    value: filteredAppointments.filter(
      (appointment) => appointment.status === item.status,
    ).length,
  }));

  const serviceMap = new Map<string, { name: string; total: number; receita: number }>();
  payableAppointments.forEach((appointment) => {
    const current = serviceMap.get(appointment.service) ?? {
      name: appointment.service,
      total: 0,
      receita: 0,
    };
    current.total += 1;
    current.receita += appointment.price;
    serviceMap.set(appointment.service, current);
  });
  const services = Array.from(serviceMap.values()).sort((a, b) => b.total - a.total);

  const hourlyCounts = Array.from(
    new Set(filteredAppointments.map((appointment) => appointment.time.slice(0, 2))),
  )
    .sort()
    .map((hour) => ({
      hour: `${hour}h`,
      total: filteredAppointments.filter((appointment) => appointment.time.startsWith(hour)).length,
    }));
  const peakHourCount = Math.max(...hourlyCounts.map((item) => item.total), 1);
  const hourly = hourlyCounts.map((item) => ({
    hour: item.hour,
    ocupacao: Math.round((item.total / peakHourCount) * 100),
  }));
  const peakHour = hourly.reduce(
    (peak, item) => (item.ocupacao > peak.ocupacao ? item : peak),
    hourly[0] ?? { hour: "—", ocupacao: 0 },
  );

  const buckets = [8, 9, 10, 13, 14, 15, 16];
  const weekCounts = Array.from({ length: 6 }, (_, dayIndex) =>
    buckets.map(
      (hour) =>
        filteredAppointments.filter((appointment) => {
          const date = new Date(`${appointment.date}T12:00:00`);
          const normalizedDay = date.getDay() === 0 ? 6 : date.getDay() - 1;
          return normalizedDay === dayIndex && Number(appointment.time.slice(0, 2)) === hour;
        }).length,
    ),
  );
  const maxHeat = Math.max(...weekCounts.flat(), 1);
  const weekMatrix = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map(
    (day, index) => ({
      day,
      values: weekCounts[index].map((value) => Math.round((value / maxHeat) * 4)),
    }),
  );

  const channelData = appointmentChannels.map((channel) => {
    const value = filteredAppointments.filter(
      (appointment) => appointment.channelId === channel.id,
    ).length;
    return {
      ...channel,
      value,
      percent: filteredAppointments.length
        ? Math.round((value / filteredAppointments.length) * 100)
        : 0,
    };
  });
  const digitalChannelTotal = channelData
    .filter((channel) => channel.digital)
    .reduce((total, channel) => total + channel.value, 0);
  const digitalChannelPercent = filteredAppointments.length
    ? Math.round((digitalChannelTotal / filteredAppointments.length) * 100)
    : 0;

  const professionalNames = Array.from(
    new Set(filteredAppointments.map((appointment) => appointment.professional)),
  );
  const professionalCounts = professionalNames.map((name) => ({
    name,
    records: filteredAppointments.filter(
      (appointment) => appointment.professional === name,
    ),
  }));
  const maxProfessionalCount = Math.max(
    ...professionalCounts.map((item) => item.records.length),
    1,
  );
  const professionals = professionalCounts
    .map(({ name, records }) => {
      const valid = records.filter((item) => item.status !== "Cancelado");
      const attended = records.filter((item) => item.status === "Concluído");
      const presence = valid.length ? (attended.length / valid.length) * 100 : 0;
      const revenue = records
        .filter(
          (item) => item.status !== "Cancelado" && item.status !== "Não compareceu",
        )
        .reduce((total, item) => total + item.price, 0);
      return {
        name,
        initials: initials(name),
        appointments: records.length,
        presence: `${presence.toFixed(1).replace(".", ",")}%`,
        occupancy: `${Math.round((records.length / maxProfessionalCount) * 100)}%`,
        revenue: formatCurrency(revenue),
        score: (4.5 + Math.min(0.4, presence / 250)).toFixed(1).replace(".", ","),
      };
    })
    .sort((a, b) => b.appointments - a.appointments);

  const clientNames = Array.from(
    new Set(filteredAppointments.map((appointment) => appointment.name)),
  );
  const clients = clientNames
    .map((name) => {
      const records = filteredAppointments
        .filter((appointment) => appointment.name === name)
        .sort((a, b) => b.date.localeCompare(a.date));
      const spent = records
        .filter(
          (item) => item.status !== "Cancelado" && item.status !== "Não compareceu",
        )
        .reduce((total, item) => total + item.price, 0);
      return {
        name,
        initials: initials(name),
        visits: records.length,
        spent: formatCurrency(spent),
        last: records[0]?.date
          ? new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" })
              .format(new Date(`${records[0].date}T12:00:00`))
              .replace(".", "")
          : "—",
        status: records.length >= 5 ? "Recorrente" : "Ativo",
      };
    })
    .sort((a, b) => b.visits - a.visits)
    .slice(0, 5);

  const received = filteredAppointments
    .filter((appointment) => appointment.status === "Concluído")
    .reduce((total, appointment) => total + appointment.price, 0);
  const receivable = filteredAppointments
    .filter(
      (appointment) =>
        appointment.status === "Confirmado" || appointment.status === "Pendente",
    )
    .reduce((total, appointment) => total + appointment.price, 0);
  const cancelledRevenue = filteredAppointments
    .filter(
      (appointment) =>
        appointment.status === "Cancelado" ||
        appointment.status === "Não compareceu",
    )
    .reduce((total, appointment) => total + appointment.price, 0);

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 3200);
  }

  function exportReport() {
    const header = [
      "Data",
      "Horário",
      "Cliente",
      "Serviço",
      "Status",
      "Canal",
      "Valor",
    ];
    const rows = filteredAppointments.map((appointment) => [
      appointment.date,
      appointment.time,
      appointment.name,
      appointment.service,
      appointment.status,
      appointmentChannels.find((channel) => channel.id === appointment.channelId)?.name ?? "",
      appointment.price.toFixed(2),
    ]);
    const csv = [header, ...rows]
      .map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(";"))
      .join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `relatorio-${period.toLowerCase().replaceAll(" ", "-")}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    showToast("Relatório exportado em CSV");
  }

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
        </header>

        <main className="mx-auto max-w-[1560px] p-4 sm:p-6 lg:p-8">
          <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <p className="text-sm font-medium">Desempenho do negócio</p>
              <p className="mt-1 text-sm text-zinc-500">
                Dados atualizados em tempo real a partir dos atendimentos.
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
              <Button variant="outline" onClick={exportReport}>
                <Download /> Exportar
              </Button>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              title="Total de agendamentos"
              value={filteredAppointments.length.toLocaleString("pt-BR")}
              change={`${Math.abs(appointmentChange).toFixed(1).replace(".", ",")}%`}
              description={`${filteredAppointments.length - previousAppointments.length} em relação ao período anterior`}
              icon={CalendarDays}
              positive={appointmentChange >= 0}
            />
            <MetricCard
              title="Receita estimada"
              value={formatCurrency(totalRevenue)}
              change={`${Math.abs(revenueChange).toFixed(1).replace(".", ",")}%`}
              description={`Ticket médio de ${formatCurrency(payableAppointments.length ? totalRevenue / payableAppointments.length : 0)}`}
              icon={WalletCards}
              positive={revenueChange >= 0}
            />
            <MetricCard
              title="Taxa de comparecimento"
              value={`${attendanceRate.toFixed(1).replace(".", ",")}%`}
              change={`${completed.toLocaleString("pt-BR")} concluídos`}
              description={`${attendanceBase.toLocaleString("pt-BR")} atendimentos considerados`}
              icon={UserRoundCheck}
            />
            <MetricCard
              title="Taxa de ocupação"
              value={`${occupancyRate.toFixed(1).replace(".", ",")}%`}
              change={`${Math.round(occupiedMinutes / 60)}h`}
              description="Horas reservadas sobre a capacidade do período"
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
                    <TrendingUp className="mr-1 size-3" />{" "}
                    {appointmentChange >= 0 ? "Tendência positiva" : "Tendência de queda"}
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
                    <strong className="text-3xl">
                      {filteredAppointments.length.toLocaleString("pt-BR")}
                    </strong>
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
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      showToast(
                        `${services.length} serviços contabilizados no período`,
                      )
                    }
                  >
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
                action={<Badge variant="secondary">Pico: {peakHour.hour}</Badge>}
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
                {channelData.map((channel) => (
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
              title="Clientes com maior recorrência"
              description="Frequência e valor acumulado no período"
              action={
                <Button asChild variant="outline" size="sm">
                  <Link href="/usuarios">
                    Ver clientes <ArrowRight />
                  </Link>
                </Button>
              }
            />
            <div className="overflow-x-auto">
              <div className="min-w-[720px]">
                <div className="grid grid-cols-[1.6fr_repeat(4,.8fr)] gap-4 border-y border-zinc-200 bg-zinc-50 px-5 py-3 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                  <span>Cliente</span>
                  <span>Visitas</span>
                  <span>Valor acumulado</span>
                  <span>Última visita</span>
                  <span>Perfil</span>
                </div>
                {clients.map((client) => (
                  <div
                    key={client.name}
                    className="grid grid-cols-[1.6fr_repeat(4,.8fr)] items-center gap-4 border-b border-zinc-100 px-5 py-4 text-sm last:border-0 hover:bg-zinc-50"
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

          <div className="mt-4 grid gap-4 xl:grid-cols-[1.25fr_.75fr]">
            <Card className="overflow-hidden">
              <SectionHead
                title="Desempenho por profissional"
                description="Produtividade, presença, ocupação e receita"
                action={
                  <Button asChild variant="outline" size="sm">
                    <Link href="/usuarios">
                      Ver equipe <ArrowRight />
                    </Link>
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
                      className="grid grid-cols-[1.4fr_repeat(5,.8fr)_40px] items-center gap-4 border-b border-zinc-100 px-5 py-3.5 text-sm last:border-0 hover:bg-zinc-50"
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
                      <button
                        title="Ver resumo do profissional"
                        onClick={() =>
                          showToast(
                            `${person.name}: ${person.appointments} atendimentos e ${person.revenue} em receita`,
                          )
                        }
                        className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-100"
                      >
                        <MoreHorizontal className="size-4" />
                      </button>
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
                      <strong className="mt-1 block text-2xl">
                        {formatCurrency(received + receivable + cancelledRevenue)}
                      </strong>
                    </div>
                    <WalletCards className="size-6 text-zinc-500" />
                  </div>
                  {[
                    { label: "Recebido", value: received },
                    { label: "A receber", value: receivable },
                    { label: "Cancelado", value: cancelledRevenue },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center justify-between border-b border-zinc-100 pb-3 text-sm last:border-0"
                    >
                      <span className="text-zinc-500">{item.label}</span>
                      <span>
                        <strong>{formatCurrency(item.value)}</strong>{" "}
                        <small className="ml-1 text-zinc-400">
                          {received + receivable + cancelledRevenue
                            ? Math.round(
                                (item.value /
                                  (received + receivable + cancelledRevenue)) *
                                  100,
                              )
                            : 0}
                          %
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
                      {revenueChange >= 0 ? "+ " : "- "}
                      {formatCurrency(Math.abs(totalRevenue - previousRevenue))}
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
      <div
        role="status"
        className={cn(
          "fixed bottom-5 right-5 z-[80] rounded-xl bg-zinc-950 px-4 py-3 text-sm font-medium text-white shadow-2xl transition-all",
          toast
            ? "translate-y-0 opacity-100"
            : "pointer-events-none translate-y-4 opacity-0",
        )}
      >
        {toast}
      </div>
    </div>
  );
}
