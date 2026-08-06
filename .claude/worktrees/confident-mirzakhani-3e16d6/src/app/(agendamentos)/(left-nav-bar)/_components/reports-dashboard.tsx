"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
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
  CalendarDays,
  ChartNoAxesCombined,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Download,
  LayoutDashboard,
  LogOut,
  Menu,
  MoreHorizontal,
  Package,
  Search,
  Settings,
  TrendingUp,
  UserCheck,
  UserRound,
  UserRoundCheck,
  UsersRound,
  WalletCards,
  X,
} from "lucide-react";
import { Avatar } from "@/app/(agendamentos)/(left-nav-bar)/_components/ui/avatar";
import { Badge } from "@/app/(agendamentos)/(left-nav-bar)/_components/ui/badge";
import { Button } from "@/app/(agendamentos)/(left-nav-bar)/_components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/(agendamentos)/(left-nav-bar)/_components/ui/card";
import { cn } from "@/lib/utils";
import { useScrollLock } from "@/lib/use-scroll-lock";
import { fetchReportMetricsAction } from "@/app/(agendamentos)/(left-nav-bar)/_actions/report-actions";
import type { ReportMetrics } from "@core/application/reports/GetReportMetrics";
import {
  getCurrentSessionAction,
  logoutAction,
  startImpersonationAction,
  stopImpersonationAction,
  type SessionUser,
} from "@/app/(agendamentos)/(left-nav-bar)/_actions/auth-actions";
import { fetchUsersAction } from "@/app/(agendamentos)/(left-nav-bar)/_actions/user-actions";
import { UserProps } from "@core/domain/users/User";
import { Input } from "@/app/(agendamentos)/(left-nav-bar)/_components/ui/input";
import { DashboardSkeleton, LoadingOverlayCard } from "@/app/(agendamentos)/(left-nav-bar)/_components/ui/page-skeletons";


function ReportSidebar({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
}) {
  const [currentUser, setCurrentUser] = useState<SessionUser | null>(null);
  const [userList, setUserList] = useState<UserProps[]>([]);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [userSearch, setUserSearch] = useState("");
  const [logoutMenuOpen, setLogoutMenuOpen] = useState(false);
  const [impersonatingLoading, setImpersonatingLoading] = useState(false);

  useEffect(() => {
    getCurrentSessionAction().then((session) => {
      if (session) setCurrentUser(session);
    });
    fetchUsersAction().then((users) => {
      if (users) setUserList(users);
    });
  }, []);

  useScrollLock(open || settingsOpen);

  const isAdmin = currentUser?.permissionLevel === 1 || currentUser?.role === "Administrador";

  const allItems = [
    { label: "Início", icon: LayoutDashboard, href: "/dashboard" },
    { label: "Agendamentos", icon: CalendarDays, href: "/agendamentos" },
    { label: "Agenda", icon: Clock3, href: "/agenda" },
    { label: "Clientes", icon: UserCheck, href: "/clientes" },
    { label: "Usuários", icon: UsersRound, href: "/usuarios", restricted: true },
    { label: "Produtos", icon: Package, href: "/produtos" },
    {
      label: "Relatórios",
      icon: ChartNoAxesCombined,
      href: "/relatorios",
      active: true,
    },
  ];

  const isFuncionario =
    currentUser?.permissionLevel === 3 || currentUser?.role === "Funcionario";

  const items = allItems.filter(
    (item) => !(item.restricted && isFuncionario),
  );

  const activeUsers = useMemo(() => {
    if (!currentUser) return [];
    return userList.filter((u) => u.id !== currentUser.id && u.status === "Ativo");
  }, [userList, currentUser]);

  const filteredUsers = useMemo(() => {
    if (!userSearch.trim()) return activeUsers;
    const q = userSearch.toLowerCase();
    return activeUsers.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.role.toLowerCase().includes(q),
    );
  }, [activeUsers, userSearch]);

  async function handleStartImpersonation(targetUserId: string) {
    setImpersonatingLoading(true);
    try {
      const res = await startImpersonationAction(targetUserId);
      if (res.success) {
        window.location.reload();
      } else {
        setImpersonatingLoading(false);
      }
    } catch {
      setImpersonatingLoading(false);
    }
  }

  async function handleStopImpersonation() {
    setImpersonatingLoading(true);
    try {
      const res = await stopImpersonationAction();
      if (res.success) {
        window.location.reload();
      } else {
        setImpersonatingLoading(false);
      }
    } catch {
      setImpersonatingLoading(false);
    }
  }

  async function handleLogout() {
    await logoutAction();
  }

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
            <Image
              src="/harmonize-logo.png"
              alt="Harmonize — Saúde, Bem Estar e Estética"
              width={1501}
              height={763}
              className="h-auto w-32"
            />
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
        {isAdmin && (
          <button
            type="button"
            onClick={() => setSettingsOpen(true)}
            className="mt-1 flex h-11 w-full items-center gap-3 rounded-xl px-3 text-sm font-medium text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-950"
          >
            <span className="flex size-[18px] shrink-0 items-center justify-center">
              <Settings className="size-[18px] stroke-[1.75]" />
            </span>
            <span className="text-[14px] font-medium leading-5">Configurações</span>
          </button>
        )}
        <div className="mt-auto space-y-1 relative">
          {currentUser?.impersonating && (
            <div className="mb-2 rounded-lg bg-amber-50 border border-amber-200 px-3 py-1.5 text-xs text-amber-900 flex items-center justify-between shadow-sm">
              <span className="font-medium truncate">Modo de visualização</span>
              <button
                type="button"
                disabled={impersonatingLoading}
                onClick={(e) => {
                  e.stopPropagation();
                  handleStopImpersonation();
                }}
                title="Sair da conta"
                className="flex items-center gap-1 text-amber-800 hover:text-amber-950 font-semibold p-1 rounded hover:bg-amber-100 transition shrink-0 ml-1"
              >
                <LogOut className="size-3.5" />
              </button>
            </div>
          )}
          <div className="my-2 h-px bg-zinc-100" />
          <div
            onClick={() => {
              if (!isFuncionario) {
                window.location.assign("/usuarios?editSelf=true");
              }
            }}
            className={`relative flex items-center gap-3 rounded-xl p-2 bg-zinc-50/80 border border-zinc-100 ${
              !isFuncionario ? "cursor-pointer hover:bg-zinc-100/90 transition" : ""
            }`}
            title={!isFuncionario ? "Editar meu perfil" : undefined}
          >
            <Avatar
              initials={currentUser?.initials || "AS"}
              className="size-10 bg-zinc-950 text-white ring-0"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-zinc-900">
                {currentUser?.name || "Carregando..."}
              </p>
              <p className="truncate text-xs font-medium text-zinc-500">
                {currentUser?.role || "Administrador"}
              </p>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleLogout();
              }}
              title="Sair do sistema"
              className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-200 hover:text-zinc-950 transition"
            >
              <LogOut className="size-4" />
            </button>
          </div>
        </div>
      </aside>

      {settingsOpen && (
        <div className="fixed inset-0 lg:left-[256px] z-[70] flex justify-end bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="fixed inset-0 lg:left-[256px]"
            onClick={() => setSettingsOpen(false)}
          />
          <div className="relative z-10 flex h-full w-full max-w-md flex-col bg-white shadow-2xl animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-5">
              <div>
                <h3 className="text-lg font-semibold text-zinc-900">Configurações</h3>
                <p className="text-xs text-zinc-500">Gerencie preferências e recursos do sistema</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSettingsOpen(false)}
                className="rounded-full"
              >
                <X className="size-5" />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <Card className="border-zinc-200 shadow-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2 text-zinc-900">
                    <UserRound className="size-5 text-zinc-700" />
                    <CardTitle className="text-base font-semibold">Virar um usuário</CardTitle>
                  </div>
                  <CardDescription className="text-xs text-zinc-500">
                    Acesse o sistema com a visão exata e as permissões de qualquer usuário cadastrado.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-400" />
                    <Input
                      type="text"
                      placeholder="Buscar por nome, e-mail ou cargo..."
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      className="pl-9 h-9 text-xs"
                    />
                  </div>

                  <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
                    {filteredUsers.length === 0 ? (
                      <p className="py-6 text-center text-xs text-zinc-400">
                        Nenhum usuário ativo disponível.
                      </p>
                    ) : (
                      filteredUsers.map((u) => (
                        <div
                          key={u.id}
                          className="flex items-center justify-between rounded-xl border border-zinc-100 bg-zinc-50/50 p-3 hover:bg-zinc-100/60 transition"
                        >
                          <div className="flex items-center gap-3 min-w-0 pr-2">
                            <Avatar
                              initials={u.initials || "US"}
                              className="size-8 bg-zinc-900 text-xs text-white shrink-0"
                            />
                            <div className="min-w-0">
                              <p className="truncate text-xs font-semibold text-zinc-900">
                                {u.name}
                              </p>
                              <p className="truncate text-[11px] text-zinc-500">
                                {u.role} — {u.email}
                              </p>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={impersonatingLoading}
                            onClick={() => handleStartImpersonation(u.id)}
                            className="h-8 shrink-0 text-xs font-medium hover:bg-zinc-950 hover:text-white transition"
                          >
                            Virar usuário
                          </Button>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}
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
  const [period, setPeriod] = useState("Últimos 6 meses");
  const [loading, setLoading] = useState(true);
  const heatColors = [
    "bg-zinc-100",
    "bg-zinc-200",
    "bg-zinc-400",
    "bg-zinc-600",
    "bg-zinc-950",
  ];
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

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              title="Total de agendamentos"
              value={totalAppts.toString()}
              change="—"
              description={`${dbMetrics?.completedAppointments || 0} concluídos`}
              icon={CalendarDays}
            />
            <MetricCard
              title="Receita estimada"
              value={totalRevenue}
              change="—"
              description="Dados não configurados"
              icon={WalletCards}
              positive={false}
            />
            <MetricCard
              title="Taxa de comparecimento"
              value={attendanceRateVal}
              change="—"
              description={`${dbMetrics?.completedAppointments || 0} concluídos / ${totalAppts} total`}
              icon={UserRoundCheck}
            />
            <MetricCard
              title="Taxa de ocupação"
              value={occupancyRateVal}
              change="—"
              description={`${(dbMetrics?.confirmedAppointments || 0) + (dbMetrics?.completedAppointments || 0)} reservados`}
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
                  {dbMetrics?.monthlyData && dbMetrics.monthlyData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={dbMetrics.monthlyData}
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
                  ) : (
                    <div className="flex h-full items-center justify-center text-zinc-400">
                      <p>Nenhum dado disponível para o período selecionado</p>
                    </div>
                  )}
                </div>
                {dbMetrics?.monthlyData && dbMetrics.monthlyData.length > 0 && (
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
                )}
              </CardContent>
            </Card>

            <Card>
              <SectionHead
                title="Status dos agendamentos"
                description="Distribuição do período"
              />
              <CardContent>
                <div className="relative h-[210px]">
                  {dbMetrics?.statusData && dbMetrics.statusData.length > 0 ? (
                    <>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={dbMetrics.statusData}
                            dataKey="value"
                            innerRadius={66}
                            outerRadius={92}
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
                        <strong className="text-3xl">{dbMetrics.statusData.reduce((sum, s) => sum + s.value, 0)}</strong>
                        <span className="text-[11px] text-zinc-400">total</span>
                      </div>
                    </>
                  ) : (
                    <div className="flex h-full items-center justify-center text-zinc-400">
                      <p>Nenhum dado disponível</p>
                    </div>
                  )}
                </div>
                {dbMetrics?.statusData && dbMetrics.statusData.length > 0 && (
                  <div className="grid grid-cols-2 gap-3">
                    {dbMetrics.statusData.map((item) => (
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
                )}
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
                          fill="#18181b"
                          radius={[0, 5, 5, 0]}
                          barSize={18}
                        />
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

          <div className="mt-4 grid gap-4 xl:grid-cols-[1.15fr_.85fr]">
            <Card>
              <SectionHead
                title="Mapa de ocupação semanal"
                description="Intensidade de procura por dia e período"
              />
              <CardContent>
                {dbMetrics?.weeklyData && dbMetrics.weeklyData.length > 0 ? (
                  <>
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
                        {dbMetrics.weeklyData.map((row) => (
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
                  </>
                ) : (
                  <div className="flex h-48 items-center justify-center text-zinc-400">
                    <p>Nenhum dado disponível</p>
                  </div>
                )}
              </CardContent>
            </Card>
            <Card>
              <SectionHead
                title="Origem dos agendamentos"
                description="Canais usados pelos clientes"
              />
              <CardContent className="space-y-6">
                {dbMetrics?.channelsData && dbMetrics.channelsData.length > 0 ? (
                  <>
                    {dbMetrics.channelsData.map((channel) => (
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
                    {dbMetrics?.channelsData && (
                      <div className="rounded-xl bg-zinc-50 p-4 text-xs leading-5 text-zinc-500">
                        {(() => {
                          const digitalTotal = dbMetrics.channelsData.filter((c) => c.digital).reduce((sum, c) => sum + c.value, 0);
                          const digitalPercent = dbMetrics.totalAppointments > 0 ? Math.round((digitalTotal / dbMetrics.totalAppointments) * 100) : 0;
                          return (
                            <>
                              <strong className="block text-sm text-zinc-900">
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

          <Card className="mt-4 overflow-hidden">
            <SectionHead
              title="Clientes com maior recorrência"
              description="Frequência e valor acumulado no período"
              action={
                <Button variant="outline" size="sm">
                  Ver clientes <ArrowRight />
                </Button>
              }
            />
            {dbMetrics?.topClients && dbMetrics.topClients.length > 0 ? (
              <div className="overflow-x-auto">
                <div className="min-w-[720px]">
                  <div className="grid grid-cols-[1.6fr_repeat(4,.8fr)] gap-4 border-y border-zinc-200 bg-zinc-50 px-5 py-3 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                    <span>Cliente</span>
                    <span>Visitas</span>
                    <span>Valor acumulado</span>
                    <span>Última visita</span>
                    <span>Perfil</span>
                  </div>
                  {dbMetrics.topClients.map((client) => (
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
            ) : (
              <div className="flex h-48 items-center justify-center text-zinc-400">
                <p>Nenhum cliente com agendamentos</p>
              </div>
            )}
          </Card>

          <div className="mt-4 grid gap-4 xl:grid-cols-[1.25fr_.75fr]">
            <Card className="flex flex-col overflow-hidden h-[350px]">
              <SectionHead
                title="Desempenho por profissional"
                description="Produtividade, presença, ocupação e receita"
                action={
                  <Button variant="outline" size="sm">
                    Ver equipe <ArrowRight />
                  </Button>
                }
              />
              <div className="flex-1 overflow-x-auto">
                {dbMetrics?.professionals && dbMetrics.professionals.length > 0 ? (
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
                    {dbMetrics.professionals.map((person) => (
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
                        <button className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-100">
                          <MoreHorizontal className="size-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex h-full items-center justify-center text-zinc-400">
                    <p>Nenhum profissional com agendamentos</p>
                  </div>
                )}
              </div>
            </Card>
            <Card className="h-[350px] flex flex-col">
              <SectionHead
                title="Resumo financeiro"
                description="Receita estimada do período"
              />
              <CardContent className="flex-1 overflow-y-auto flex items-center justify-center">
                <div className="text-center space-y-2">
                  <div className="flex justify-center mb-3">
                    <WalletCards className="size-12 text-zinc-300" />
                  </div>
                  <p className="text-sm font-medium text-zinc-900">Dados financeiros não configurados</p>
                  <p className="text-xs text-zinc-500">Para visualizar receita, configure os preços dos serviços</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <p className="mt-5 text-center text-[11px] text-zinc-400">
            Relatório gerado em tempo real com base na base de dados do sistema.
          </p>
    </div>
  );
}
