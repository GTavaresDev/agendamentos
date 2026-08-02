"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  CalendarClock,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleUserRound,
  Clock3,
  LayoutDashboard,
  ChartNoAxesCombined,
  LogOut,
  Menu,
  MoreHorizontal,
  Package,
  Plus,
  Search,
  Settings,
  Sparkles,
  UsersRound,
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
import { Input } from "@/app/(agendamentos)/_components/ui/input";
import { BrandLogo } from "@/app/(agendamentos)/_components/brand-logo";
import { useAppData } from "@/app/(agendamentos)/_components/app-data-provider";
import { cn } from "@/lib/utils";
import {
  appointmentChannels,
  services,
  times,
  weekDays,
} from "@/app/mocks/scheduling";

export type View =
  | "dashboard"
  | "agenda"
  | "agendamentos"
  | "usuarios"
  | "produtos";

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="mb-2 block text-sm font-medium text-zinc-800">
      {children}
    </label>
  );
}

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function Login({ onLogin }: { onLogin: () => void }) {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loginNotice, setLoginNotice] = useState("");

  function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    window.setTimeout(onLogin, 500);
  }

  return (
    <main className="grid min-h-screen bg-white lg:grid-cols-[1.02fr_.98fr]">
      <section className="relative hidden overflow-hidden bg-zinc-950 px-12 py-10 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(255,255,255,.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.08)_1px,transparent_1px)] [background-size:48px_48px]" />
        <div className="absolute -right-32 top-36 size-96 rounded-full border border-white/10" />
        <div className="absolute -right-16 top-52 size-64 rounded-full border border-white/10" />
        <BrandLogo inverse large className="relative" />
        <div className="absolute left-12 top-1/2 -mt-20 w-[calc(100%-6rem)] max-w-xl -translate-y-1/2">
          <Badge
            className="mb-6 border-white/15 bg-white/10 text-white"
            variant="outline"
          >
            <Sparkles className="mr-1.5 size-3" /> Seu tempo, bem organizado
          </Badge>
          <h1 className="text-balance text-5xl font-semibold leading-[1.08] tracking-[-0.04em] xl:text-6xl">
            Agendamentos simples. Rotina mais leve.
          </h1>
          <p className="mt-6 max-w-md text-base leading-7 text-zinc-400">
            Centralize sua agenda, seus clientes e o dia a dia do negócio em um
            único lugar.
          </p>
        </div>
        <div className="relative flex items-center gap-3 text-sm text-zinc-500">
          <div className="flex -space-x-2">
            {["MC", "RA", "BL"].map((item) => (
              <Avatar
                key={item}
                initials={item}
                className="size-8 border-2 border-zinc-950 bg-zinc-800 text-[10px] text-white ring-0"
              />
            ))}
          </div>
          <span>Organizando o caos da rotina de agendamentos</span>
        </div>
      </section>

      <section className="flex min-h-screen items-center justify-center bg-zinc-50 px-6 py-10 sm:px-10">
        <div className="w-full max-w-[430px]">
          <BrandLogo large className="mb-10 lg:hidden" />
          <div className="mb-8">
            <p className="mb-3 text-sm font-medium text-zinc-500">
              Bem-vindo de volta
            </p>
            <h2 className="text-3xl font-semibold tracking-[-0.03em] text-zinc-950">
              Acesse sua conta
            </h2>
            <p className="mt-2 text-sm text-zinc-500">
              Entre para acompanhar seus agendamentos.
            </p>
          </div>
          <form onSubmit={submit} className="space-y-5">
            <div>
              <FieldLabel>E-mail</FieldLabel>
              <Input
                type="email"
                defaultValue="admin@cliente.com"
                aria-label="E-mail"
              />
            </div>
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="text-sm font-medium text-zinc-800">
                  Senha
                </label>
                <button
                  type="button"
                  onClick={() =>
                    setLoginNotice(
                      "Enviamos as instruções de recuperação para o e-mail informado.",
                    )
                  }
                  className="text-xs font-medium text-zinc-500 hover:text-black"
                >
                  Esqueceu a senha?
                </button>
              </div>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  defaultValue="agendamentos"
                  className="pr-16"
                  aria-label="Senha"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-zinc-500 hover:text-black"
                >
                  {showPassword ? "Ocultar" : "Mostrar"}
                </button>
              </div>
            </div>
            {loginNotice && (
              <p role="status" className="rounded-lg bg-zinc-100 p-3 text-xs text-zinc-600">
                {loginNotice}
              </p>
            )}
            <label className="flex cursor-pointer items-center gap-2 text-sm text-zinc-600">
              <input
                type="checkbox"
                defaultChecked
                className="size-4 rounded border-zinc-300 accent-black"
              />{" "}
              Lembrar de mim
            </label>
            <Button
              className="w-full"
              size="lg"
              type="submit"
              disabled={loading}
            >
              {loading ? "Entrando..." : "Entrar"} {!loading && <ArrowRight />}
            </Button>
          </form>
          <p className="mt-8 text-center text-sm text-zinc-500">
            Não tem uma conta?{" "}
            <a
              href="mailto:contato@cliente.com"
              className="font-semibold text-zinc-950 hover:underline"
            >
              Fale com a gente
            </a>
          </p>
          <p className="mt-16 text-center text-xs text-zinc-400">
            © 2026 Cliente. Todos os direitos reservados.
          </p>
        </div>
      </section>
    </main>
  );
}

function Sidebar({
  view,
  setView,
  onLogout,
  mobileOpen,
  setMobileOpen,
  showToast,
}: {
  view: View;
  setView: (view: View) => void;
  onLogout: () => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
  showToast: (message: string) => void;
}) {
  const nav = [
    {
      id: "dashboard" as View,
      label: "Início",
      icon: LayoutDashboard,
      href: "/dashboard",
    },
    {
      id: "agenda" as View,
      label: "Agenda",
      icon: CalendarClock,
      href: "/agenda",
    },
    {
      id: "agendamentos" as View,
      label: "Agendamentos",
      icon: CalendarDays,
      href: "/agendamentos",
    },
    {
      id: "usuarios" as View,
      label: "Usuários",
      icon: UsersRound,
      href: "/usuarios",
    },
    {
      id: "produtos" as View,
      label: "Produtos",
      icon: Package,
      href: "/produtos",
    },
  ];

  return (
    <>
      {mobileOpen && (
        <button
          aria-label="Fechar menu"
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[256px] flex-col border-r border-zinc-200 bg-white p-4 transition-transform duration-300 lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
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
            onClick={() => setMobileOpen(false)}
          >
            <X />
          </Button>
        </div>
        <div className="mt-3 px-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-400">
          Menu principal
        </div>
        <nav className="mt-3 space-y-1">
          {nav.map(({ id, label, icon: Icon, href }) => (
            <Link
              key={id}
              href={href}
              onClick={() => {
                setView(id);
                setMobileOpen(false);
              }}
              className={cn(
                "flex h-11 w-full items-center gap-3 rounded-xl px-3 text-sm font-medium transition",
                view === id
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
        <Link
          href="/relatorios"
          className="mt-1 flex h-11 w-full items-center gap-3 rounded-xl px-3 text-sm font-medium text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-950"
        >
          <span className="flex size-[18px] shrink-0 items-center justify-center">
            <ChartNoAxesCombined className="size-[18px] stroke-[1.75]" />
          </span>
          <span className="text-[14px] font-medium leading-5">Relatórios</span>
        </Link>
        <div className="mt-auto space-y-1">
          <button
            onClick={() => showToast("As configurações serão abertas nesta área.")}
            className="flex h-10 w-full items-center gap-3 rounded-xl px-3 text-sm font-medium text-zinc-500 hover:bg-zinc-100 hover:text-zinc-950"
          >
            <span className="flex size-[18px] shrink-0 items-center justify-center">
              <Settings className="size-[18px] stroke-[1.75]" />
            </span>
            <span className="text-[14px] font-medium leading-5">
              Configurações
            </span>
          </button>
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
              <p className="truncate text-xs text-zinc-400">Administrador</p>
            </div>
            <button
              onClick={onLogout}
              title="Sair"
              className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-950"
            >
              <LogOut className="size-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

function Topbar({
  title,
  subtitle,
  setMobileOpen,
}: {
  title: string;
  subtitle: string;
  setMobileOpen: (open: boolean) => void;
}) {
  return (
    <header className="sticky top-0 z-30 flex min-h-[84px] items-center gap-4 border-b border-zinc-200 bg-white/90 px-4 backdrop-blur sm:px-6 lg:px-8">
      <Button
        variant="outline"
        size="icon"
        className="lg:hidden"
        onClick={() => setMobileOpen(true)}
      >
        <Menu />
      </Button>
      <div className="min-w-0 flex-1">
        <h1 className="truncate text-xl font-semibold tracking-[-0.02em] text-zinc-950 sm:text-2xl">
          {title}
        </h1>
        <p className="hidden truncate text-sm text-zinc-500 sm:block">
          {subtitle}
        </p>
      </div>
    </header>
  );
}

function StatCard({
  label,
  value,
  detail,
  icon: Icon,
  progress,
  trend,
}: {
  label: string;
  value: string;
  detail: string;
  icon: typeof CalendarDays;
  progress?: number;
  trend?: string;
}) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-5">
        <div className="mb-5 flex items-start justify-between">
          <div className="flex size-10 items-center justify-center rounded-xl bg-zinc-100 text-zinc-700">
            <Icon className="size-5" />
          </div>
          {trend && (
            <Badge variant="secondary" className="font-medium">
              {trend}
            </Badge>
          )}
        </div>
        <p className="text-sm font-medium text-zinc-500">{label}</p>
        <div className="mt-1 flex items-end justify-between gap-3">
          <p className="text-3xl font-semibold tracking-[-0.04em] text-zinc-950">
            {value}
          </p>
          <span className="pb-1 text-xs text-zinc-400">{detail}</span>
        </div>
        {progress !== undefined && (
          <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-zinc-100">
            <div
              className="h-full rounded-full bg-zinc-950"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function Dashboard({
  onNew,
  onViewAgenda,
  showToast,
}: {
  onNew: () => void;
  onViewAgenda: () => void;
  showToast: (message: string) => void;
}) {
  const { appointments, users, updateAppointmentStatus } = useAppData();
  const todayAppointments = useMemo(
    () =>
      appointments
        .filter((appointment) => appointment.date === "2026-08-01")
        .sort((a, b) => a.time.localeCompare(b.time)),
    [appointments],
  );
  const activeUsers = users.filter((user) => user.status === "Ativo").length;
  const validAppointments = appointments.filter(
    (appointment) => appointment.status !== "Cancelado",
  );
  const completedAppointments = appointments.filter(
    (appointment) => appointment.status === "Concluído",
  );
  const presenceRate = validAppointments.length
    ? Math.round((completedAppointments.length / validAppointments.length) * 100)
    : 0;
  const occupiedMinutes = todayAppointments
    .filter((appointment) => appointment.status !== "Cancelado")
    .reduce((total, appointment) => total + appointment.durationMinutes, 0);
  const occupiedLabel = `${Math.floor(occupiedMinutes / 60)}h${String(occupiedMinutes % 60).padStart(2, "0")}`;
  const julyTotal = appointments.filter((item) => item.date.startsWith("2026-07")).length;
  const juneTotal = appointments.filter((item) => item.date.startsWith("2026-06")).length;
  const growth = juneTotal
    ? Math.round(((julyTotal - juneTotal) / juneTotal) * 100)
    : 0;
  const weeklyTotals = weekDays.map(
    (day) => appointments.filter((appointment) => appointment.date === day.iso).length,
  );
  const weeklyMax = Math.max(...weeklyTotals, 1);
  const bars = weeklyTotals.map((total) => Math.max(8, (total / weeklyMax) * 100));
  const otherDaysAverage =
    weeklyTotals.filter((_, index) => index !== 5).reduce((sum, value) => sum + value, 0) /
    6;
  const saturdayDifference = otherDaysAverage
    ? Math.round(((weeklyTotals[5] - otherDaysAverage) / otherDaysAverage) * 100)
    : 0;
  return (
    <div className="mx-auto max-w-[1500px] p-4 sm:p-6 lg:p-8">
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-medium text-zinc-950">
            Sábado, 1 de agosto
          </p>
          <p className="mt-1 text-sm text-zinc-500">
            Você tem {todayAppointments.length} compromissos para hoje.
          </p>
        </div>
        <Button onClick={onNew}>
          <Plus /> Novo agendamento
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Agendamentos hoje"
          value={String(todayAppointments.length).padStart(2, "0")}
          detail={`de ${times.length} horários`}
          icon={CalendarDays}
          progress={(todayAppointments.length / times.length) * 100}
          trend={`${growth >= 0 ? "+" : ""}${growth}% vs. mês anterior`}
        />
        <StatCard
          label="Clientes ativos"
          value={String(activeUsers)}
          detail={`${users.length} cadastrados`}
          icon={UsersRound}
          trend="base atual"
        />
        <StatCard
          label="Taxa de presença"
          value={`${presenceRate}%`}
          detail="últimos 30 dias"
          icon={Check}
          progress={presenceRate}
          trend={`${completedAppointments.length} concluídos`}
        />
        <StatCard
          label="Tempo ocupado"
          value={occupiedLabel}
          detail="hoje"
          icon={Clock3}
          progress={(occupiedMinutes / (times.length * 30)) * 100}
          trend={`${todayAppointments.length} atendimentos`}
        />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1.55fr_1fr]">
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <div>
              <CardTitle>Agenda de hoje</CardTitle>
              <CardDescription>
                Próximos atendimentos confirmados
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={onViewAgenda}>
              Ver agenda <ArrowRight />
            </Button>
          </CardHeader>
          <CardContent className="px-0 pb-2">
            <div className="divide-y divide-zinc-100">
              {todayAppointments.slice(0, 4).map((item, index) => (
                <div
                  key={item.time}
                  className="group flex items-center gap-4 px-5 py-3.5 hover:bg-zinc-50"
                >
                  <div className="w-12 text-sm font-semibold text-zinc-950">
                    {item.time}
                  </div>
                  <div
                    className={cn(
                      "h-9 w-0.5 rounded-full",
                      index < 2 ? "bg-zinc-950" : "bg-zinc-200",
                    )}
                  />
                  <Avatar initials={item.initials} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-zinc-900">
                      {item.name}
                    </p>
                    <p className="truncate text-xs text-zinc-400">
                      {item.service} · {item.duration}
                    </p>
                  </div>
                  <Badge
                    variant={
                      item.status === "Confirmado" ? "success" : "warning"
                    }
                    className="hidden sm:inline-flex"
                  >
                    {item.status}
                  </Badge>
                  <button
                    title="Alternar status do atendimento"
                    onClick={() => {
                      const nextStatus =
                        item.status === "Concluído" ? "Confirmado" : "Concluído";
                      updateAppointmentStatus(item.id, nextStatus);
                      showToast(`Atendimento de ${item.name}: ${nextStatus}`);
                    }}
                    className="rounded-lg p-2 text-zinc-400 opacity-0 hover:bg-zinc-100 group-hover:opacity-100"
                  >
                    <MoreHorizontal className="size-4" />
                  </button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-start justify-between">
            <div>
              <CardTitle>Movimento semanal</CardTitle>
              <CardDescription>Agendamentos por dia</CardDescription>
            </div>
            <Badge variant="outline">Esta semana</Badge>
          </CardHeader>
          <CardContent>
            <div className="flex h-[190px] items-end gap-3 border-b border-zinc-200 pt-4 sm:gap-5">
              {bars.map((height, index) => (
                <div key={index} className="group flex h-full flex-1 items-end">
                  <div
                    className={cn(
                      "relative w-full rounded-t-md transition-all group-hover:bg-zinc-700",
                      index === 5 ? "bg-zinc-950" : "bg-zinc-200",
                    )}
                    style={{ height: `${height}%` }}
                  >
                    {index === 5 && (
                      <span className="absolute -top-7 left-1/2 -translate-x-1/2 rounded bg-black px-1.5 py-0.5 text-[9px] font-semibold text-white">
                        {weeklyTotals[index]}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 flex justify-between text-[10px] font-medium text-zinc-400">
              <span>SEG</span>
              <span>TER</span>
              <span>QUA</span>
              <span>QUI</span>
              <span>SEX</span>
              <span className="text-zinc-950">SÁB</span>
              <span>DOM</span>
            </div>
            <div className="mt-6 flex items-center gap-4 rounded-xl bg-zinc-50 p-4">
              <div className="flex size-10 items-center justify-center rounded-full bg-white shadow-sm">
                <Sparkles className="size-4" />
              </div>
              <p className="text-xs leading-5 text-zinc-500">
                <strong className="block text-sm text-zinc-900">
                  Seu sábado está {Math.abs(saturdayDifference)}% {saturdayDifference >= 0 ? "mais cheio" : "mais livre"}
                </strong>
                comparado à média das últimas semanas.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Agenda({ showToast }: { showToast: (message: string) => void }) {
  const { appointments, updateAppointmentStatus } = useAppData();
  const [selectedDay, setSelectedDay] = useState(5);
  const selectedDayInfo = weekDays[selectedDay];
  const dayAppointments = useMemo(
    () =>
      appointments
        .filter((appointment) => appointment.date === selectedDayInfo.iso)
        .sort((a, b) => a.time.localeCompare(b.time)),
    [appointments, selectedDayInfo.iso],
  );
  const confirmedCount = dayAppointments.filter(
    (appointment) => appointment.status === "Confirmado",
  ).length;
  const pendingCount = dayAppointments.filter(
    (appointment) => appointment.status === "Pendente",
  ).length;
  const isToday = selectedDayInfo.iso === "2026-08-01";
  let dayTitle = `Agenda de ${selectedDayInfo.full}`;

  if (isToday) {
    dayTitle = "Agenda de hoje";
  }

  let emptyMessage = "Nenhum atendimento neste dia.";

  if (isToday) {
    emptyMessage = "Nenhum atendimento para hoje.";
  }

  let description = `${dayAppointments.length} atendimento`;

  if (dayAppointments.length !== 1) {
    description = `${dayAppointments.length} atendimentos`;
  }

  return (
    <div className="mx-auto max-w-[1500px] p-4 sm:p-6 lg:p-8">
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-medium text-zinc-950">{dayTitle}</p>
          <p className="mt-1 text-sm text-zinc-500">
            Selecione um dia da semana para ver os horários.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs text-zinc-500">
          <span className="rounded-lg bg-white px-3 py-1.5 ring-1 ring-zinc-200">
            {description}
          </span>
          <span className="rounded-lg bg-emerald-50 px-3 py-1.5 text-emerald-700 ring-1 ring-emerald-600/10">
            {confirmedCount} confirmados
          </span>
          <span className="rounded-lg bg-amber-50 px-3 py-1.5 text-amber-700 ring-1 ring-amber-600/10">
            {pendingCount} pendentes
          </span>
        </div>
      </div>

      <div className="mb-4 grid grid-cols-7 gap-1.5 sm:gap-2">
        {weekDays.map((item, index) => {
          const count = appointments.filter(
            (appointment) => appointment.date === item.iso,
          ).length;
          const isSelected = selectedDay === index;
          let dayButtonClass =
            "flex min-h-16 flex-col items-center justify-center rounded-xl border px-1 transition sm:min-h-20";
          let dayLabelClass = "text-[9px] font-semibold uppercase sm:text-[10px]";
          let countClass = "mt-0.5 text-[10px] font-medium";

          if (isSelected) {
            dayButtonClass = `${dayButtonClass} border-zinc-950 bg-zinc-950 text-white shadow-md`;
            dayLabelClass = `${dayLabelClass} text-zinc-400`;
            countClass = `${countClass} text-zinc-400`;
          } else {
            dayButtonClass = `${dayButtonClass} border-transparent bg-white text-zinc-500 hover:border-zinc-200 hover:bg-zinc-50`;
            dayLabelClass = `${dayLabelClass} text-zinc-400`;
            countClass = `${countClass} text-zinc-400`;
          }

          return (
            <button
              key={item.iso}
              type="button"
              onClick={() => setSelectedDay(index)}
              className={dayButtonClass}
            >
              <span className={dayLabelClass}>{item.day}</span>
              <span className="mt-1 text-lg font-semibold sm:text-xl">
                {item.date}
              </span>
              <span className={countClass}>{count}</span>
            </button>
          );
        })}
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <div>
            <CardTitle>{dayTitle}</CardTitle>
            <CardDescription>
              Todos os atendimentos de {selectedDayInfo.full}
            </CardDescription>
          </div>
          <Badge variant="outline">{description}</Badge>
        </CardHeader>
        <CardContent className="px-0 pb-2">
          {dayAppointments.length === 0 && (
            <div className="px-5 py-12 text-center">
              <p className="text-sm font-medium text-zinc-900">{emptyMessage}</p>
              <p className="mt-1 text-xs text-zinc-400">
                Escolha outro dia ou crie um novo agendamento.
              </p>
            </div>
          )}
          {dayAppointments.length > 0 && (
            <div className="divide-y divide-zinc-100">
              {dayAppointments.map((item, index) => {
                let badgeVariant: "success" | "warning" | "destructive" | "secondary" =
                  "secondary";

                if (item.status === "Confirmado") {
                  badgeVariant = "success";
                } else if (item.status === "Pendente") {
                  badgeVariant = "warning";
                } else if (
                  item.status === "Cancelado" ||
                  item.status === "Não compareceu"
                ) {
                  badgeVariant = "destructive";
                }

                let timelineClass = "h-9 w-0.5 rounded-full bg-zinc-200";

                if (index < 2) {
                  timelineClass = "h-9 w-0.5 rounded-full bg-zinc-950";
                }

                return (
                  <div
                    key={item.id}
                    className="group flex items-center gap-4 px-5 py-3.5 hover:bg-zinc-50"
                  >
                    <div className="w-12 text-sm font-semibold text-zinc-950">
                      {item.time}
                    </div>
                    <div className={timelineClass} />
                    <Avatar initials={item.initials} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-zinc-900">
                        {item.name}
                      </p>
                      <p className="truncate text-xs text-zinc-400">
                        {item.service} · {item.duration} · {item.professional}
                      </p>
                    </div>
                    <Badge
                      variant={badgeVariant}
                      className="hidden sm:inline-flex"
                    >
                      {item.status}
                    </Badge>
                    <button
                      title="Alternar status do atendimento"
                      onClick={() => {
                        let nextStatus: "Confirmado" | "Concluído" = "Concluído";

                        if (item.status === "Concluído") {
                          nextStatus = "Confirmado";
                        }

                        updateAppointmentStatus(item.id, nextStatus);
                        showToast(
                          `Atendimento de ${item.name}: ${nextStatus}`,
                        );
                      }}
                      className="rounded-lg p-2 text-zinc-400 opacity-0 hover:bg-zinc-100 group-hover:opacity-100"
                    >
                      <MoreHorizontal className="size-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Scheduling({ showToast }: { showToast: (message: string) => void }) {
  const { appointments, users, addAppointment } = useAppData();
  const [selectedDay, setSelectedDay] = useState(5);
  const [selectedTime, setSelectedTime] = useState("14:00");
  const [selectedUserId, setSelectedUserId] = useState("user-marina");
  const [selectedService, setSelectedService] = useState<string>(services[0].name);
  const [selectedChannel, setSelectedChannel] = useState("recepcao");
  const [notes, setNotes] = useState("");
  const [weekOffset, setWeekOffset] = useState(0);
  const displayedDays = useMemo(() => {
    const baseDate = new Date(`${weekDays[0].iso}T12:00:00`);
    return weekDays.map((_, index) => {
      const date = new Date(baseDate);
      date.setDate(baseDate.getDate() + index + weekOffset * 7);
      return {
        day: new Intl.DateTimeFormat("pt-BR", { weekday: "short" })
          .format(date)
          .replace(".", ""),
        date: String(date.getDate()).padStart(2, "0"),
        full: new Intl.DateTimeFormat("pt-BR", {
          day: "numeric",
          month: "long",
        }).format(date),
        iso: date.toISOString().slice(0, 10),
      };
    });
  }, [weekOffset]);
  const periodLabel = useMemo(() => {
    const first = new Date(`${displayedDays[0].iso}T12:00:00`);
    const last = new Date(`${displayedDays[6].iso}T12:00:00`);
    const firstMonth = new Intl.DateTimeFormat("pt-BR", { month: "long" }).format(first);
    const lastMonth = new Intl.DateTimeFormat("pt-BR", {
      month: "long",
      year: "numeric",
    }).format(last);
    return first.getMonth() === last.getMonth()
      ? lastMonth
      : `${firstMonth} — ${lastMonth}`;
  }, [displayedDays]);
  const occupiedTimes = useMemo(
    () =>
      appointments
        .filter(
          (appointment) =>
            appointment.date === displayedDays[selectedDay].iso &&
            appointment.status !== "Cancelado",
        )
        .map((appointment) => appointment.time),
    [appointments, displayedDays, selectedDay],
  );

  function confirm() {
    const user = users.find((item) => item.id === selectedUserId);
    const service = services.find((item) => item.name === selectedService);
    const channel = appointmentChannels.find(
      (item) => item.id === selectedChannel,
    );
    if (!user || !service || !selectedTime) return;
    addAppointment({
      date: displayedDays[selectedDay].iso,
      time: selectedTime,
      name: user.name,
      service: service.name,
      duration: `${service.durationMinutes} min`,
      durationMinutes: service.durationMinutes,
      status: "Confirmado",
      initials: user.initials,
      channelId: selectedChannel,
      price: service.price,
      professional: "Ana Souza",
      notes,
    });
    showToast(
      `Agendamento de ${user.name} criado para ${displayedDays[selectedDay].full} às ${selectedTime} via ${channel?.name}`,
    );
    setSelectedTime("");
    setNotes("");
  }

  function changeWeek(change: number) {
    setWeekOffset((current) => current + change);
    setSelectedDay(0);
    setSelectedTime("");
  }

  return (
    <div className="mx-auto max-w-[1500px] p-4 md:p-5 xl:p-8">
      <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-end md:justify-between xl:mb-6">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-zinc-950">
            Escolha uma data e horário
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            Os horários indisponíveis já estão bloqueados.
          </p>
        </div>
        <div className="inline-flex w-fit items-center gap-2 rounded-xl border border-zinc-200 bg-white p-1">
          <Button
            size="icon"
            variant="ghost"
            className="size-8"
            onClick={() => changeWeek(-1)}
            aria-label="Semana anterior"
          >
            <ChevronLeft />
          </Button>
          <span className="min-w-36 text-center text-sm font-semibold">
            {periodLabel}
          </span>
          <Button
            size="icon"
            variant="ghost"
            className="size-8"
            onClick={() => changeWeek(1)}
            aria-label="Próxima semana"
          >
            <ChevronRight />
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_clamp(260px,30%,380px)] xl:gap-5">
        <div className="min-w-0 space-y-4 xl:space-y-5">
          <Card>
            <CardContent className="p-3 md:p-4 xl:p-5">
              <div className="grid grid-cols-7 gap-1.5 xl:gap-2">
                {displayedDays.map((item, index) => (
                  <button
                    key={item.date}
                    onClick={() => setSelectedDay(index)}
                    className={cn(
                      "flex min-h-16 flex-col items-center justify-center rounded-xl border px-1 transition md:min-h-20 xl:min-h-24",
                      selectedDay === index
                        ? "border-zinc-950 bg-zinc-950 text-white shadow-md"
                        : "border-transparent bg-zinc-50 text-zinc-500 hover:border-zinc-200 hover:bg-white",
                    )}
                  >
                    <span
                      className={cn(
                        "text-[9px] font-semibold uppercase md:text-[10px] xl:text-[11px]",
                        selectedDay === index
                          ? "text-zinc-400"
                          : "text-zinc-400",
                      )}
                    >
                      {item.day}
                    </span>
                    <span className="mt-1 text-lg font-semibold xl:text-xl">
                      {item.date}
                    </span>
                    {item.iso === "2026-08-01" && (
                      <span
                        className={cn(
                          "mt-1 size-1 rounded-full",
                          selectedDay === index ? "bg-white" : "bg-black",
                        )}
                      />
                    )}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex-row items-center justify-between p-4 xl:p-5">
              <div>
                <CardTitle>Horários disponíveis</CardTitle>
                <CardDescription>
                  {displayedDays[selectedDay].full} · 30 min por horário
                </CardDescription>
              </div>
              <div className="hidden items-center gap-2 text-[9px] text-zinc-400 md:flex xl:gap-3 xl:text-[10px]">
                <span className="flex items-center gap-1.5">
                  <i className="size-2 rounded-full bg-zinc-950" /> Selecionado
                </span>
                <span className="flex items-center gap-1.5">
                  <i className="size-2 rounded-full bg-zinc-200" /> Ocupado
                </span>
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-0 xl:p-5 xl:pt-0">
              <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                <span className="h-px flex-1 bg-zinc-100" />
                <span>Manhã</span>
                <span className="h-px flex-1 bg-zinc-100" />
              </div>
              <div className="grid grid-cols-3 gap-2 md:grid-cols-6">
                {times.slice(0, 8).map((time) => (
                  <TimeButton
                    key={time}
                    time={time}
                    selected={selectedTime === time}
                    disabled={occupiedTimes.includes(time)}
                    onClick={() => setSelectedTime(time)}
                  />
                ))}
              </div>
              <div className="mb-3 mt-7 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                <span className="h-px flex-1 bg-zinc-100" />
                <span>Tarde</span>
                <span className="h-px flex-1 bg-zinc-100" />
              </div>
              <div className="grid grid-cols-3 gap-2 md:grid-cols-6">
                {times.slice(8).map((time) => (
                  <TimeButton
                    key={time}
                    time={time}
                    selected={selectedTime === time}
                    disabled={occupiedTimes.includes(time)}
                    onClick={() => setSelectedTime(time)}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="h-fit min-w-0 md:sticky md:top-[104px] xl:top-[108px]">
          <CardHeader className="border-b border-zinc-100 p-4 xl:p-5">
            <div className="mb-2 flex size-10 items-center justify-center rounded-xl bg-zinc-950 text-white">
              <CalendarDays className="size-5" />
            </div>
            <CardTitle>Detalhes do agendamento</CardTitle>
            <CardDescription>Preencha os dados do atendimento.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 p-4 pt-4 xl:p-5 xl:pt-5">
            <div>
              <FieldLabel>Cliente</FieldLabel>
              <div className="relative">
                <CircleUserRound className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
                <select
                  value={selectedUserId}
                  onChange={(event) => setSelectedUserId(event.target.value)}
                  className="h-11 w-full appearance-none rounded-lg border border-zinc-200 bg-white pl-9 pr-9 text-sm outline-none focus:border-zinc-400"
                >
                  {users
                    .filter((user) => user.role === "Cliente" && user.status === "Ativo")
                    .map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name}
                      </option>
                    ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
              </div>
            </div>
            <div>
              <FieldLabel>Serviço</FieldLabel>
              <div className="relative">
                <select
                  value={selectedService}
                  onChange={(event) => setSelectedService(event.target.value)}
                  className="h-11 w-full appearance-none rounded-lg border border-zinc-200 bg-white px-3 pr-9 text-sm outline-none focus:border-zinc-400"
                >
                  {services.map((service) => (
                    <option key={service.name} value={service.name}>
                      {service.name} · {service.durationMinutes} min
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
              </div>
            </div>
            <div>
              <FieldLabel>Canal de atendimento</FieldLabel>
              <div className="relative">
                <select
                  value={selectedChannel}
                  onChange={(event) => setSelectedChannel(event.target.value)}
                  className="h-11 w-full appearance-none rounded-lg border border-zinc-200 bg-white px-3 pr-9 text-sm outline-none focus:border-zinc-400"
                >
                  {appointmentChannels.map((channel) => (
                    <option key={channel.id} value={channel.id}>
                      {channel.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
              </div>
              <p className="mt-1.5 text-[11px] leading-4 text-zinc-400">
                Esta origem será contabilizada em Relatórios.
              </p>
            </div>
            <div>
              <FieldLabel>Observações</FieldLabel>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Adicione informações importantes..."
                className="min-h-24 w-full resize-none rounded-lg border border-zinc-200 bg-white p-3 text-sm outline-none placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-4 focus:ring-zinc-950/5"
              />
            </div>
            <div className="rounded-xl bg-zinc-50 p-4">
              <div className="flex items-center justify-between text-xs text-zinc-500">
                <span>Data</span>
                <strong className="text-zinc-900">
                  {displayedDays[selectedDay].full}
                </strong>
              </div>
              <div className="my-2.5 h-px bg-zinc-200" />
              <div className="flex items-center justify-between text-xs text-zinc-500">
                <span>Horário</span>
                <strong className="text-zinc-900">
                  {selectedTime || "Selecione"}
                </strong>
              </div>
            </div>
            <Button
              className="w-full"
              size="lg"
              disabled={!selectedTime}
              onClick={confirm}
            >
              <Check /> Confirmar agendamento
            </Button>
            <p className="text-center text-[11px] text-zinc-400">
              Uma confirmação será enviada ao cliente.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function TimeButton({
  time,
  selected,
  disabled,
  onClick,
}: {
  time: string;
  selected: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "h-11 rounded-lg border text-sm font-medium transition",
        disabled
          ? "cursor-not-allowed border-transparent bg-zinc-100 text-zinc-300 line-through"
          : selected
            ? "border-zinc-950 bg-zinc-950 text-white shadow-sm"
            : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-400 hover:bg-zinc-50",
      )}
    >
      {time}
    </button>
  );
}

function Users({ showToast }: { showToast: (message: string) => void }) {
  const { users, addUser, toggleUserStatus } = useAppData();
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState("Todos");
  const [roleFilter, setRoleFilter] = useState("Todos");
  const [page, setPage] = useState(1);
  const pageSize = 5;
  const filtered = useMemo(
    () =>
      users.filter(
        (user) =>
          (user.name.toLowerCase().includes(search.toLowerCase()) ||
            user.email.toLowerCase().includes(search.toLowerCase())) &&
          (statusFilter === "Todos" || user.status === statusFilter) &&
          (roleFilter === "Todos" || user.role === roleFilter),
      ),
    [roleFilter, search, statusFilter, users],
  );
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const visibleUsers = filtered.slice((page - 1) * pageSize, page * pageSize);

  function submitUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const created = addUser({
      name: String(form.get("name")),
      email: String(form.get("email")),
      phone: String(form.get("phone")),
      role: String(form.get("role")) as "Cliente" | "Administrador",
    });
    event.currentTarget.reset();
    setModal(false);
    setPage(1);
    showToast(`${created.name} foi adicionado com sucesso`);
  }

  return (
    <div className="mx-auto max-w-[1500px] p-4 sm:p-6 lg:p-8">
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-lg font-semibold text-zinc-950">
            Todos os usuários
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            Gerencie clientes e pessoas da sua equipe.
          </p>
        </div>
        <Button onClick={() => setModal(true)}>
          <Plus /> Adicionar usuário
        </Button>
      </div>

      <div className="mb-4 grid gap-3 sm:grid-cols-[1fr_auto]">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Buscar por nome ou e-mail..."
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(event) => {
              setStatusFilter(event.target.value);
              setPage(1);
            }}
            aria-label="Filtrar usuários por status"
            className="h-10 rounded-lg border border-zinc-200 bg-white px-3 text-sm font-medium outline-none"
          >
            <option>Todos</option>
            <option>Ativo</option>
            <option>Inativo</option>
          </select>
          <select
            value={roleFilter}
            onChange={(event) => {
              setRoleFilter(event.target.value);
              setPage(1);
            }}
            aria-label="Filtrar usuários por perfil"
            className="h-10 rounded-lg border border-zinc-200 bg-white px-3 text-sm font-medium outline-none"
          >
            <option>Todos</option>
            <option>Cliente</option>
            <option>Administrador</option>
          </select>
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="hidden grid-cols-[1.5fr_1.15fr_.8fr_.7fr_.7fr_36px] items-center gap-4 border-b border-zinc-200 bg-zinc-50/70 px-5 py-3 text-[10px] font-semibold uppercase tracking-wider text-zinc-400 lg:grid">
          <span>Usuário</span>
          <span>Contato</span>
          <span>Perfil</span>
          <span>Status</span>
          <span>Último agendamento</span>
          <span />
        </div>
        <div className="divide-y divide-zinc-100">
          {visibleUsers.map((user) => (
            <div
              key={user.email}
              className="grid gap-4 p-5 transition hover:bg-zinc-50 lg:grid-cols-[1.5fr_1.15fr_.8fr_.7fr_.7fr_36px] lg:items-center"
            >
              <div className="flex min-w-0 items-center gap-3">
                <Avatar
                  initials={user.initials}
                  className={
                    user.role === "Administrador"
                      ? "bg-zinc-950 text-white ring-0"
                      : ""
                  }
                />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-zinc-900">
                    {user.name}
                  </p>
                  <p className="truncate text-xs text-zinc-400 lg:hidden">
                    {user.email}
                  </p>
                </div>
              </div>
              <div className="hidden lg:block">
                <p className="truncate text-xs font-medium text-zinc-700">
                  {user.email}
                </p>
                <p className="mt-0.5 text-xs text-zinc-400">{user.phone}</p>
              </div>
              <div>
                <Badge
                  variant={
                    user.role === "Administrador" ? "default" : "secondary"
                  }
                >
                  {user.role}
                </Badge>
              </div>
              <div>
                <Badge
                  variant={user.status === "Ativo" ? "success" : "secondary"}
                >
                  <span className="mr-1.5 size-1.5 rounded-full bg-current" />
                  {user.status}
                </Badge>
              </div>
              <div className="text-xs text-zinc-500">{user.last}</div>
              <button
                title={user.status === "Ativo" ? "Desativar usuário" : "Ativar usuário"}
                onClick={() => {
                  toggleUserStatus(user.id);
                  showToast(
                    `${user.name} foi ${user.status === "Ativo" ? "desativado" : "ativado"}`,
                  );
                }}
                className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-100 hover:text-black"
              >
                <MoreHorizontal className="size-4" />
              </button>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between border-t border-zinc-100 px-5 py-4 text-xs text-zinc-500">
          <span>
            Mostrando {visibleUsers.length} de {filtered.length} usuários
          </span>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="icon"
              className="size-8"
              disabled={page === 1}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
            >
              <ChevronLeft />
            </Button>
            {Array.from({ length: pageCount }, (_, index) => index + 1).map(
              (pageNumber) => (
                <Button
                  key={pageNumber}
                  variant={page === pageNumber ? "default" : "ghost"}
                  size="icon"
                  className="size-8"
                  onClick={() => setPage(pageNumber)}
                >
                  {pageNumber}
                </Button>
              ),
            )}
            <Button
              variant="outline"
              size="icon"
              className="size-8"
              disabled={page === pageCount}
              onClick={() =>
                setPage((current) => Math.min(pageCount, current + 1))
              }
            >
              <ChevronRight />
            </Button>
          </div>
        </div>
      </Card>

      {modal && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
          onMouseDown={(e) => e.target === e.currentTarget && setModal(false)}
        >
          <Card className="w-full max-w-md shadow-2xl">
            <CardHeader className="flex-row items-start justify-between">
              <div>
                <CardTitle>Adicionar usuário</CardTitle>
                <CardDescription>
                  Cadastre um novo cliente ou colaborador.
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="-mr-2 -mt-2"
                onClick={() => setModal(false)}
              >
                <X />
              </Button>
            </CardHeader>
            <form onSubmit={submitUser}>
              <CardContent className="space-y-4">
                <div>
                  <FieldLabel>Nome completo</FieldLabel>
                  <Input required name="name" placeholder="Ex.: João da Silva" />
                </div>
                <div>
                  <FieldLabel>E-mail</FieldLabel>
                  <Input required name="email" type="email" placeholder="joao@email.com" />
                </div>
                <div>
                  <FieldLabel>Telefone</FieldLabel>
                  <Input name="phone" placeholder="(11) 99999-9999" />
                </div>
                <div>
                  <FieldLabel>Perfil</FieldLabel>
                  <select name="role" className="h-11 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm outline-none">
                    <option>Cliente</option>
                    <option>Administrador</option>
                  </select>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setModal(false)}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit">Adicionar usuário</Button>
                </div>
              </CardContent>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}

function Products({ showToast }: { showToast: (message: string) => void }) {
  const { products, addProduct, removeProduct } = useAppData();
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState("Todos");
  const [categoryFilter, setCategoryFilter] = useState("Todas");
  const [page, setPage] = useState(1);
  const pageSize = 5;
  const categories = useMemo(
    () => Array.from(new Set(products.map((product) => product.category))).sort(),
    [products],
  );
  const filtered = useMemo(
    () =>
      products.filter((product) => {
        const term = search.toLowerCase();
        return (
          (product.name.toLowerCase().includes(term) ||
            product.category.toLowerCase().includes(term)) &&
          (statusFilter === "Todos" || product.status === statusFilter) &&
          (categoryFilter === "Todas" || product.category === categoryFilter)
        );
      }),
    [categoryFilter, products, search, statusFilter],
  );
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const visibleProducts = filtered.slice((page - 1) * pageSize, page * pageSize);

  function submitProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const quantity = Number(form.get("quantity"));
    const selectedStatus = String(form.get("status"));
    const price = Number(form.get("price"));

    const created = addProduct({
      name: String(form.get("name")),
      category: String(form.get("category")),
      price,
      quantity,
      status: selectedStatus as "Ativo" | "Inativo",
    });
    event.currentTarget.reset();
    setModal(false);
    setPage(1);
    showToast(`${created.name} foi adicionado com sucesso`);
  }

  return (
    <div className="mx-auto max-w-[1500px] p-4 sm:p-6 lg:p-8">
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-lg font-semibold text-zinc-950">
            Todos os produtos
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            Gerencie o catálogo e acompanhe o estoque do seu negócio.
          </p>
        </div>
        <Button onClick={() => setModal(true)}>
          <Plus /> Adicionar produto
        </Button>
      </div>

      <div className="mb-4 grid gap-3 sm:grid-cols-[1fr_auto]">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Buscar por nome ou categoria..."
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(event) => {
              setStatusFilter(event.target.value);
              setPage(1);
            }}
            aria-label="Filtrar produtos por status"
            className="h-10 rounded-lg border border-zinc-200 bg-white px-3 text-sm font-medium outline-none"
          >
            <option>Todos</option>
            <option>Ativo</option>
            <option>Baixo estoque</option>
            <option>Inativo</option>
          </select>
          <select
            value={categoryFilter}
            onChange={(event) => {
              setCategoryFilter(event.target.value);
              setPage(1);
            }}
            aria-label="Filtrar produtos por categoria"
            className="h-10 rounded-lg border border-zinc-200 bg-white px-3 text-sm font-medium outline-none"
          >
            <option>Todas</option>
            {categories.map((category) => (
              <option key={category}>{category}</option>
            ))}
          </select>
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="hidden grid-cols-[1.6fr_1fr_.8fr_.65fr_.7fr_36px] items-center gap-4 border-b border-zinc-200 bg-zinc-50/70 px-5 py-3 text-[10px] font-semibold uppercase tracking-wider text-zinc-400 lg:grid">
          <span>Produto</span>
          <span>Categoria</span>
          <span>Preço</span>
          <span>Quantidade</span>
          <span>Status</span>
          <span />
        </div>
        <div className="divide-y divide-zinc-100">
          {visibleProducts.map((product) => (
            <div
              key={product.id}
              className="grid gap-4 p-5 transition hover:bg-zinc-50 lg:grid-cols-[1.6fr_1fr_.8fr_.65fr_.7fr_36px] lg:items-center"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-zinc-600 ring-1 ring-inset ring-zinc-200">
                  <Package className="size-4" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-zinc-900">
                    {product.name}
                  </p>
                </div>
              </div>
              <div className="text-xs font-medium text-zinc-700">
                {product.category}
              </div>
              <div className="text-sm font-semibold text-zinc-900">
                {formatCurrency(product.price)}
              </div>
              <div className="text-xs text-zinc-500">
                {product.quantity}{" "}
                {product.quantity === 1 ? "unidade" : "unidades"}
              </div>
              <div>
                <Badge
                  variant={
                    product.status === "Ativo"
                      ? "success"
                      : product.status === "Baixo estoque"
                        ? "warning"
                        : "secondary"
                  }
                >
                  <span className="mr-1.5 size-1.5 rounded-full bg-current" />
                  {product.status}
                </Badge>
              </div>
              <button
                type="button"
                aria-label={`Excluir ${product.name}`}
                title="Excluir produto"
                onClick={() => {
                  if (!window.confirm(`Excluir ${product.name}?`)) return;
                  removeProduct(product.id);
                  showToast(`${product.name} foi excluído`);
                }}
                className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-100 hover:text-black"
              >
                <MoreHorizontal className="size-4" />
              </button>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="px-5 py-12 text-center">
              <Package className="mx-auto size-8 text-zinc-300" />
              <p className="mt-3 text-sm font-medium text-zinc-700">
                Nenhum produto encontrado
              </p>
              <p className="mt-1 text-xs text-zinc-400">
                Tente buscar por outro nome ou categoria.
              </p>
            </div>
          )}
        </div>
        <div className="flex items-center justify-between border-t border-zinc-100 px-5 py-4 text-xs text-zinc-500">
          <span>
            Mostrando {visibleProducts.length} de {filtered.length} produtos
          </span>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="icon"
              className="size-8"
              disabled={page === 1}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
            >
              <ChevronLeft />
            </Button>
            {Array.from({ length: pageCount }, (_, index) => index + 1).map(
              (pageNumber) => (
                <Button
                  key={pageNumber}
                  variant={page === pageNumber ? "default" : "ghost"}
                  size="icon"
                  className="size-8"
                  onClick={() => setPage(pageNumber)}
                >
                  {pageNumber}
                </Button>
              ),
            )}
            <Button
              variant="outline"
              size="icon"
              className="size-8"
              disabled={page === pageCount}
              onClick={() =>
                setPage((current) => Math.min(pageCount, current + 1))
              }
            >
              <ChevronRight />
            </Button>
          </div>
        </div>
      </Card>

      {modal && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
          onMouseDown={(e) => e.target === e.currentTarget && setModal(false)}
        >
          <Card className="w-full max-w-lg shadow-2xl">
            <CardHeader className="flex-row items-start justify-between">
              <div>
                <CardTitle>Adicionar produto</CardTitle>
                <CardDescription>
                  Cadastre um novo item no catálogo do negócio.
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="-mr-2 -mt-2"
                onClick={() => setModal(false)}
              >
                <X />
              </Button>
            </CardHeader>
            <form onSubmit={submitProduct}>
              <CardContent className="space-y-4">
                <div>
                  <FieldLabel>Nome do produto</FieldLabel>
                  <Input
                    required
                    name="name"
                    placeholder="Ex.: Sérum facial vitamina C"
                  />
                </div>
                <div>
                  <FieldLabel>Categoria</FieldLabel>
                  <select
                    name="category"
                    className="h-11 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm outline-none"
                  >
                    <option>Skincare</option>
                    <option>Proteção solar</option>
                    <option>Corporal</option>
                    <option>Higiene</option>
                    <option>Kits</option>
                    <option>Outros</option>
                  </select>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <FieldLabel>Preço</FieldLabel>
                    <Input
                      required
                      min="0"
                      step="0.01"
                      type="number"
                      name="price"
                      placeholder="0,00"
                    />
                  </div>
                  <div>
                    <FieldLabel>Quantidade</FieldLabel>
                    <Input
                      required
                      min="0"
                      step="1"
                      type="number"
                      name="quantity"
                      placeholder="0"
                    />
                  </div>
                </div>
                <div>
                  <FieldLabel>Status</FieldLabel>
                  <select
                    name="status"
                    className="h-11 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm outline-none"
                  >
                    <option>Ativo</option>
                    <option>Inativo</option>
                  </select>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setModal(false)}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit">Adicionar produto</Button>
                </div>
              </CardContent>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}

function AppShell({
  onLogout,
  initialView = "dashboard",
}: {
  onLogout: () => void;
  initialView?: View;
}) {
  const router = useRouter();
  const [view, setView] = useState<View>(initialView);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [toast, setToast] = useState("");
  const titles = {
    dashboard: ["Olá, Ana!", "Aqui está o resumo do seu dia."],
    agenda: ["Agenda", "Veja os atendimentos do dia selecionado."],
    agendamentos: ["Agendamentos", "Organize os horários e os atendimentos."],
    usuarios: ["Usuários", "Gerencie sua base de clientes e equipe."],
    produtos: ["Produtos", "Cadastre e gerencie os produtos do seu negócio."],
  };

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 3200);
  }

  return (
    <div className="min-h-screen bg-[#f4f4f5] text-zinc-950">
      <Sidebar
        view={view}
        setView={setView}
        onLogout={onLogout}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        showToast={showToast}
      />
      <div className="lg:pl-[256px]">
        <Topbar
          title={titles[view][0]}
          subtitle={titles[view][1]}
          setMobileOpen={setMobileOpen}
        />
        <main>
          {view === "dashboard" && (
            <Dashboard
              onNew={() => router.push("/agendamentos")}
              onViewAgenda={() => router.push("/agenda")}
              showToast={showToast}
            />
          )}
          {view === "agenda" && <Agenda showToast={showToast} />}
          {view === "agendamentos" && <Scheduling showToast={showToast} />}
          {view === "usuarios" && <Users showToast={showToast} />}
          {view === "produtos" && <Products showToast={showToast} />}
        </main>
      </div>
      <div
        className={cn(
          "fixed bottom-5 right-5 z-[80] flex items-center gap-3 rounded-xl bg-zinc-950 px-4 py-3 text-sm font-medium text-white shadow-2xl transition-all duration-300",
          toast
            ? "translate-y-0 opacity-100"
            : "pointer-events-none translate-y-4 opacity-0",
        )}
      >
        <span className="flex size-5 items-center justify-center rounded-full bg-white text-black">
          <Check className="size-3" />
        </span>
        {toast}
      </div>
    </div>
  );
}

export function LoginScreen({ onLogin }: { onLogin: () => void }) {
  return <Login onLogin={onLogin} />;
}

export function SchedulingApp({
  initialView = "dashboard",
}: {
  initialView?: View;
}) {
  return (
    <AppShell
      initialView={initialView}
      onLogout={() => window.location.assign("/")}
    />
  );
}
