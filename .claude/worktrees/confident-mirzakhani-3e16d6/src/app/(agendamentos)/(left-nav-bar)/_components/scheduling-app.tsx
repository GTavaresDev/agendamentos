"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useScrollLock } from "@/lib/use-scroll-lock";
import {
  ArrowRight,
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
  MoreVertical,
  Package,
  Pencil,
  Plus,
  Power,
  Search,
  Settings,
  ShoppingCart,
  Sparkles,
  Trash2,
  UserCheck,
  UserRound,
  UsersRound,
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
import { Input } from "@/app/(agendamentos)/(left-nav-bar)/_components/ui/input";
import { ListPagination } from "@/app/(agendamentos)/(left-nav-bar)/_components/ui/list-pagination";
import { ViewLoadingSkeleton, LoadingOverlayCard } from "@/app/(agendamentos)/(left-nav-bar)/_components/ui/page-skeletons";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { appointmentAttendantLabel } from "@/lib/appointment-attendant";
import { formatCpf, formatPhoneBR } from "@/lib/input-masks";
import { isBookingTimeExpired } from "@/lib/appointment-time";
import { paginateItems, STAT_CARD_MIN_HEIGHT_CLASS, TABLE_BODY_MIN_HEIGHT_CLASS, TABLE_ROW_MIN_HEIGHT_CLASS } from "@/lib/pagination";
import {
  formatAppointmentRelativeLabel,
  getLastAppointmentForClient,
} from "@/lib/client-appointments";
import {
  appointmentChannels,
  times,
} from "@/app/(agendamentos)/mocks/scheduling";
import { generateWeek, getCurrentWeekIndex, getTodayIsoString, dateToIsoString, type WeekDay } from "@/lib/week-generator";

import {
  createUserAction,
  deleteUserAction,
  fetchUsersAction,
  updateUserAction,
} from "@/app/(agendamentos)/(left-nav-bar)/_actions/user-actions";
import {
  getAvailablePermissionsForUserAction,
  updateUserPermissionsAction,
} from "@/app/(agendamentos)/(left-nav-bar)/_actions/permission-actions";
import type { SystemPermissionProps } from "@core/domain/users/SystemPermission";
import { UserProps } from "@core/domain/users/User";
import type { StaffRole } from "@core/domain/users/User";
import { roleFromPermissionLevel } from "@core/domain/users/resolvePermissionLevel";

import {
  createClientAction,
  deleteClientAction,
  fetchClientsAction,
  updateClientAction,
} from "@/app/(agendamentos)/(left-nav-bar)/_actions/client-actions";
import { ClientProps } from "@core/domain/clients/Client";

import {
  createProductAction,
  deleteProductAction,
  fetchProductsAction,
  updateProductAction,
} from "@/app/(agendamentos)/(left-nav-bar)/_actions/product-actions";
import { ProductProps } from "@core/domain/products/Product";

import {
  createServiceAction,
  deleteServiceAction,
  fetchServicesAction,
  updateServiceAction,
} from "@/app/(agendamentos)/(left-nav-bar)/_actions/service-actions";
import { ServiceProps } from "@core/domain/services/Service";

import {
  createAppointmentAction,
  deleteAppointmentAction,
  fetchAppointmentsAction,
  updateAppointmentStatusAction,
} from "@/app/(agendamentos)/(left-nav-bar)/_actions/appointment-actions";
import { Appointment, AppointmentProps } from "@core/domain/appointments/Appointment";
import {
  ClientScheduleConflictError,
  hasClientScheduleConflict,
} from "@core/domain/appointments/clientScheduleConflict";
import { AgendaView } from "@/app/(agendamentos)/(left-nav-bar)/_components/agenda-view";
import {
  getCurrentSessionAction,
  loginAction,
  logoutAction,
  startImpersonationAction,
  stopImpersonationAction,
  type SessionUser,
} from "@/app/(agendamentos)/(left-nav-bar)/_actions/auth-actions";
import { ReportsDashboard } from "@/app/(agendamentos)/(left-nav-bar)/_components/reports-dashboard";
import { Services } from "@/app/(agendamentos)/(left-nav-bar)/_components/services";
import { SettingsView } from "@/app/(agendamentos)/(left-nav-bar)/_components/settings-view";
import { Sales } from "@/app/(agendamentos)/(left-nav-bar)/_components/sales";
import { useScheduling } from "@/app/(agendamentos)/(left-nav-bar)/_components/scheduling-provider";

export type View = "dashboard" | "agendamentos" | "agenda" | "clientes" | "usuarios" | "produtos" | "vendas" | "servicos" | "relatorios" | "configuracoes";

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="mb-2 block text-sm font-medium text-zinc-800">
      {children}
    </label>
  );
}

function Login({ onLogin }: { onLogin: () => void }) {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await loginAction({ email, password });
      if (!result.success) {
        setError(result.error || "Credenciais inválidas");
        setLoading(false);
        return;
      }
      onLogin();
    } catch {
      setError("Credenciais inválidas");
      setLoading(false);
    }
  }

  return (
    <main className="grid min-h-screen bg-white lg:grid-cols-[1.02fr_.98fr]">
      <section className="relative hidden overflow-hidden bg-zinc-950 px-12 py-10 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(255,255,255,.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.08)_1px,transparent_1px)] [background-size:48px_48px]" />
        <div className="absolute -right-32 top-36 size-96 rounded-full border border-white/10" />
        <div className="absolute -right-16 top-52 size-64 rounded-full border border-white/10" />
        <Image
          src="/harmonize-logo.png"
          alt="Harmonize — Saúde, Bem Estar e Estética"
          width={1501}
          height={763}
          priority
          className="absolute left-12 top-10 z-20 h-auto w-44"
        />
        <div className="relative z-10 w-full max-w-xl pt-36">
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
          <span>Organizando o caos da rotina de agendamentos</span>
        </div>
      </section>

      <section className="flex min-h-screen items-start justify-center bg-zinc-50 px-6 py-10 sm:px-10 pt-36">
        <div className="w-full max-w-[430px]">
          <Image
            src="/harmonize-logo.png"
            alt="Harmonize — Saúde, Bem Estar e Estética"
            width={1501}
            height={763}
            priority
            className="mb-10 h-auto w-40 lg:hidden"
          />
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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seuemail@exemplo.com"
                aria-label="E-mail"
                autoComplete="email"
                required
              />
            </div>
            <div>
              <FieldLabel>Senha</FieldLabel>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Digite sua senha"
                  className="pr-16"
                  aria-label="Senha"
                  autoComplete="current-password"
                  required
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
            {error ? (
              <p className="text-sm font-medium text-red-600" role="alert">
                {error}
              </p>
            ) : null}
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
            <span>Não tem uma conta? </span>
            <button type="button" className="font-semibold text-zinc-950 hover:underline">
              Fale com a gente
            </button>
          </p>
          <p className="mt-20 text-center text-xs text-zinc-400">
            <span>&copy; 2026 Harmonize. Todos os direitos reservados.</span>
            <span className="mt-1 block text-zinc-400">
              Desenvolvido por: Gabriel Tavares dos Santos
            </span>
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
  currentUser,
  userList,
  showToast,
  onOpenSelfEdit,
}: {
  view: View;
  setView: (view: View) => void;
  onLogout: () => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
  currentUser: SessionUser;
  userList: UserProps[];
  showToast: (msg: string) => void;
  onOpenSelfEdit?: () => void;
}) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [userSearch, setUserSearch] = useState("");
  const [impersonatingLoading, setImpersonatingLoading] = useState(false);

  useScrollLock(settingsOpen || mobileOpen);

  const isAdmin = currentUser.permissionLevel === 1 || currentUser.role === "Administrador";

  const allNav = [
    {
      id: "dashboard" as View,
      label: "Início",
      icon: LayoutDashboard,
      href: "/dashboard",
    },
    {
      id: "agendamentos" as View,
      label: "Agendamentos",
      icon: CalendarDays,
      href: "/agendamentos",
    },
    {
      id: "agenda" as View,
      label: "Agenda",
      icon: Clock3,
      href: "/agenda",
    },
    {
      id: "clientes" as View,
      label: "Clientes",
      icon: UserCheck,
      href: "/clientes",
    },
    {
      id: "usuarios" as View,
      label: "Usuários",
      icon: UsersRound,
      href: "/usuarios",
      restricted: true,
    },
    {
      id: "produtos" as View,
      label: "Produtos",
      icon: Package,
      href: "/produtos",
    },
    {
      id: "vendas" as View,
      label: "Vendas",
      icon: ShoppingCart,
      href: "/vendas",
    },
    {
      id: "relatorios" as View,
      label: "Relatórios",
      icon: ChartNoAxesCombined,
      href: "/relatorios",
      restricted: true,
    },
    {
      id: "configuracoes" as View,
      label: "Configurações",
      icon: Settings,
      href: "/configuracoes",
      adminOnly: true,
    },
  ];

  const isFuncionario =
    currentUser.permissionLevel === 3 || currentUser.role === "Funcionario";

  const nav = allNav.filter((item) => {
    if (item.adminOnly && !isAdmin) return false;
    if (item.restricted && isFuncionario) return false;
    return true;
  });

  const activeUsers = useMemo(() => {
    return userList.filter((u) => u.id !== currentUser.id && u.status === "Ativo");
  }, [userList, currentUser.id]);

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
        showToast(res.error || "Erro ao assumir usuário.");
        setImpersonatingLoading(false);
      }
    } catch {
      showToast("Erro ao assumir usuário.");
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
        showToast(res.error || "Erro ao sair da conta.");
        setImpersonatingLoading(false);
      }
    } catch {
      showToast("Erro ao sair da conta.");
      setImpersonatingLoading(false);
    }
  }

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
          {currentUser.impersonating && (
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
                onOpenSelfEdit?.();
              }
            }}
            className={`relative flex items-center gap-3 rounded-xl p-2 bg-zinc-50/80 border border-zinc-100 ${
              !isFuncionario ? "cursor-pointer hover:bg-zinc-100/90 transition" : ""
            }`}
            title={!isFuncionario ? "Editar meu perfil" : undefined}
          >
            <Avatar
              initials={currentUser.initials || "US"}
              className="size-10 bg-zinc-950 text-white ring-0"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-zinc-900">
                {currentUser.name}
              </p>
              <p className="truncate text-xs font-medium text-zinc-500">
                {currentUser.role}
              </p>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onLogout();
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
        <div className="fixed inset-0 z-[70] flex justify-end bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="fixed inset-0"
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
                            Ver
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
}: {
  label: string;
  value: string;
  detail: string;
  icon: typeof CalendarDays;
  progress?: number;
}) {
  return (
    <Card className={cn("overflow-hidden", STAT_CARD_MIN_HEIGHT_CLASS)}>
      <CardContent className="p-5">
        <div className="mb-5 flex items-start justify-between">
          <div className="flex size-10 items-center justify-center rounded-xl bg-zinc-100 text-zinc-700">
            <Icon className="size-5" />
          </div>
          <Badge variant="secondary" className="font-medium">
            +12% <span className="ml-1 text-zinc-400">este mês</span>
          </Badge>
        </div>
        <p className="text-sm font-medium text-zinc-500">{label}</p>
        <div className="mt-1 flex items-end justify-between gap-3">
          <p className="text-3xl font-semibold tracking-[-0.04em] text-zinc-950 tabular-nums">
            {value}
          </p>
          <span className="pb-1 text-xs text-zinc-400">{detail}</span>
        </div>
        {progress !== undefined && (
          <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-zinc-100">
            <div
              className="h-full rounded-full bg-zinc-950 transition-[width] duration-300"
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
  onVerAgenda,
  appointments,
  usersCount,
  clientsCount = 0,
  onStatusChange,
  onDeleteAppointment,
  showToast,
}: {
  onNew: () => void;
  onVerAgenda: () => void;
  appointments: AppointmentProps[];
  usersCount: number;
  clientsCount?: number;
  onStatusChange: (id: string, status: "Confirmado" | "Cancelado" | "Concluído") => Promise<void>;
  onDeleteAppointment: (id: string) => Promise<void>;
  showToast: (message: string) => void;
}) {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // Calculate attendance rate from database
  const completedCount = appointments.filter((a) => a.status === "Concluído").length;
  const attendanceRate = appointments.length > 0
    ? Math.round((completedCount / appointments.length) * 100)
    : 0;

  // Calculate weekly movement from database
  const bars = useMemo(() => {
    const dayMap = new Map<number, number>();
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());

    for (let i = 0; i < 7; i++) {
      const dayDate = new Date(startOfWeek);
      dayDate.setDate(startOfWeek.getDate() + i);
      const dateStr = dateToIsoString(dayDate);

      const dayAppointments = appointments.filter((a) => a.date === dateStr);
      dayMap.set(i, dayAppointments.length);
    }

    const maxCount = Math.max(...Array.from(dayMap.values()), 1);
    return Array.from({ length: 7 }, (_, i) => {
      const count = dayMap.get(i) || 0;
      return Math.round((count / maxCount) * 100);
    });
  }, [appointments]);

  const todayIso = getTodayIsoString();

  const todayAppointments = useMemo(() => {
    return appointments
      .filter((a) => a.date === todayIso)
      .sort((a, b) => a.time.localeCompare(b.time))
      .slice(0, 5);
  }, [appointments, todayIso]);

  const todayCount = todayAppointments.length;
  const todayCompletedCount = todayAppointments.filter((a) => a.status === "Concluído").length;
  const todayAttendanceRate = todayCount > 0
    ? Math.round((todayCompletedCount / todayCount) * 100)
    : 0;

  return (
    <div className="mx-auto max-w-[1500px] p-4 sm:p-6 lg:p-8">
      {/* Top Banner / Welcome */}
      <div className="mb-6 flex flex-col justify-between gap-4 rounded-2xl bg-zinc-950 p-6 text-white sm:flex-row sm:items-center">
        <div>
          <Badge
            className="mb-2 border-white/15 bg-white/10 text-white"
            variant="outline"
          >
            <Sparkles className="mr-1.5 size-3" /> Resumo diário
          </Badge>
          <h2 className="text-xl font-semibold tracking-tight">
            Visão Geral dos Agendamentos
          </h2>
          <p className="mt-1 text-xs text-zinc-400">
            Acompanhe o ritmo dos atendimentos e os indicadores principais do seu estabelecimento.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="border-white/20 bg-white/10 text-white hover:bg-white/20" onClick={onVerAgenda}>
            Ver agenda completa
          </Button>
          <Button className="bg-white text-zinc-950 hover:bg-zinc-100" onClick={onNew}>
            <Plus /> Novo agendamento
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Agendamentos hoje"
          value={todayCount.toString().padStart(2, "0")}
          detail="de 8 horários"
          icon={CalendarDays}
          progress={Math.round((todayCount / 8) * 100)}
        />
        <StatCard
          label="Base de clientes"
          value={clientsCount.toString()}
          detail="clientes cadastrados"
          icon={UserCheck}
        />
        <StatCard
          label="Equipe do sistema"
          value={usersCount.toString()}
          detail="membros com acesso"
          icon={UsersRound}
        />
        <StatCard
          label="Taxa de presença"
          value={`${todayAttendanceRate}%`}
          detail={todayCount > 0 ? `${todayCompletedCount} de ${todayCount} agendamentos` : "sem agendamentos"}
          icon={Check}
          progress={todayAttendanceRate}
        />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1.55fr_1fr]">
        <Card className="min-h-[420px]">
          <CardHeader className="flex-row items-center justify-between">
            <div>
              <CardTitle>Agenda de hoje</CardTitle>
              <CardDescription>
                Próximos atendimentos do banco de dados
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={onVerAgenda || onNew}>
              Ver agenda <ArrowRight />
            </Button>
          </CardHeader>
          <CardContent className="px-0 pb-2">
            <div className="min-h-[340px] divide-y divide-zinc-100">
              {todayAppointments.map((item, index) => {
                const attendantLabel = appointmentAttendantLabel(item);

                return (
                  <div
                    key={item.id}
                    className="group relative flex h-[68px] items-center gap-4 px-5 hover:bg-zinc-50"
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
                        {item.service} · {item.duration} · Atendente:{" "}
                        {attendantLabel}
                      </p>
                    </div>
                    <Badge
                      variant={
                        item.status === "Confirmado"
                          ? "success"
                          : item.status === "Concluído"
                            ? "default"
                            : "warning"
                      }
                      className="hidden sm:inline-flex"
                    >
                      {item.status}
                    </Badge>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() =>
                          setOpenMenuId(openMenuId === item.id ? null : item.id)
                        }
                        className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-100 hover:text-black"
                      >
                        <MoreVertical className="size-4" />
                      </button>
                      {openMenuId === item.id && (
                        <div className="absolute right-0 top-10 z-50 w-48 rounded-xl border border-zinc-200 bg-white p-1.5 shadow-xl">
                          <button
                            type="button"
                            onClick={() => {
                              showToast(`Editar agendamento de ${item.name}`);
                              setOpenMenuId(null);
                            }}
                            className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-100"
                          >
                            <Pencil className="size-4 shrink-0 text-zinc-500" /> Editar
                          </button>
                          <button
                            type="button"
                            onClick={async () => {
                              let nextStatus: "Confirmado" | "Concluído" =
                                "Confirmado";
                              if (item.status === "Confirmado") {
                                nextStatus = "Concluído";
                              }
                              await onStatusChange(item.id, nextStatus);
                              setOpenMenuId(null);
                            }}
                            className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-100"
                          >
                            <Power className="size-4 shrink-0 text-zinc-500" /> Status
                          </button>
                          <div className="my-1 h-px bg-zinc-100" />
                          <button
                            type="button"
                            onClick={async () => {
                              await onDeleteAppointment(item.id);
                              showToast(
                                `Agendamento de ${item.name} excluído do banco`,
                              );
                              setOpenMenuId(null);
                            }}
                            className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-red-600 transition-colors hover:bg-red-50"
                          >
                            <Trash2 className="size-4 shrink-0 text-red-500" /> Excluir
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              {appointments.length === 0 && (
                <div className="p-8 text-center text-sm text-zinc-400">
                  Nenhum agendamento cadastrado no banco de dados.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="min-h-[420px]">
          <CardHeader className="flex-row items-start justify-between">
            <div>
              <CardTitle>Movimento semanal</CardTitle>
              <CardDescription>Agendamentos por dia</CardDescription>
            </div>
            <Badge variant="outline">Esta semana</Badge>
          </CardHeader>
          <CardContent>
            {appointments.length > 0 ? (
              <>
                <div className="flex h-[190px] items-end gap-3 border-b border-zinc-200 pt-4 sm:gap-5">
                  {bars.map((height, index) => {
                    const today = new Date();
                    const startOfWeek = new Date(today);
                    startOfWeek.setDate(today.getDate() - today.getDay());
                    const dayDate = new Date(startOfWeek);
                    dayDate.setDate(startOfWeek.getDate() + index);
                    const dateStr = dateToIsoString(dayDate);

                    const dayAppointments = appointments.filter((a) => a.date === dateStr).length;
                    const isToday = index === today.getDay();

                    return (
                      <div key={index} className="group flex h-full flex-1 flex-col items-center justify-end">
                        <div
                          className={cn(
                            "relative w-full rounded-t-md transition-all group-hover:bg-zinc-700",
                            isToday ? "bg-zinc-950" : "bg-zinc-200",
                          )}
                          style={{ height: `${height}%`, minHeight: height > 0 ? "8px" : "0px" }}
                        >
                          {dayAppointments > 0 && (
                            <span className="absolute -top-7 left-1/2 -translate-x-1/2 rounded bg-black px-1.5 py-0.5 text-[9px] font-semibold text-white">
                              {dayAppointments}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-3 flex justify-between text-[10px] font-medium text-zinc-400">
                  <span>SEG</span>
                  <span>TER</span>
                  <span>QUA</span>
                  <span>QUI</span>
                  <span>SEX</span>
                  <span className={new Date().getDay() === 6 ? "text-zinc-950" : ""}>SÁB</span>
                  <span>DOM</span>
                </div>
                {(() => {
                  const today = new Date();
                  const startOfWeek = new Date(today);
                  startOfWeek.setDate(today.getDate() - today.getDay());
                  const dayDate = new Date(startOfWeek);
                  dayDate.setDate(startOfWeek.getDate() + today.getDay());
                  const todayDateStr = dateToIsoString(dayDate);

                  const todayCount = appointments.filter((a) => a.date === todayDateStr).length;
                  const weekAvg = appointments.length / 7;
                  const diff = ((todayCount - weekAvg) / Math.max(weekAvg, 1)) * 100;

                  return (
                    <div className="mt-6 flex items-center gap-4 rounded-xl bg-zinc-50 p-4">
                      <div className="flex size-10 items-center justify-center rounded-full bg-white shadow-sm">
                        <Sparkles className="size-4" />
                      </div>
                      <p className="text-xs leading-5 text-zinc-500">
                        <strong className="block text-sm text-zinc-900">
                          {todayCount > 0
                            ? `Hoje com ${Math.abs(Math.round(diff))}% ${diff >= 0 ? "mais" : "menos"} agendamentos`
                            : "Nenhum agendamento hoje"}
                        </strong>
                        {todayCount > 0
                          ? `comparado à média da semana (${Math.round(weekAvg)} por dia).`
                          : "Agenda vazia para hoje."}
                      </p>
                    </div>
                  );
                })()}
              </>
            ) : (
              <div className="flex h-[300px] items-center justify-center text-center text-zinc-400">
                <p>Nenhum agendamento na semana</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Scheduling({
  showToast,
  appointments,
  onAddAppointment,
  clientList = [],
  serviceList = [],
}: {
  showToast: (message: string) => void;
  appointments: AppointmentProps[];
  onAddAppointment: (appt: {
    date: string;
    time: string;
    name: string;
    service: string;
    duration: string;
    channelId: string;
    notes?: string;
    clientId?: string;
  }) => Promise<void>;
  clientList?: ClientProps[];
  serviceList?: ServiceProps[];
}) {
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedDay, setSelectedDay] = useState(getCurrentWeekIndex());
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedDuration, setSelectedDuration] = useState("30 min");
  const [selectedChannel, setSelectedChannel] = useState("recepcao");
  const [selectedClientId, setSelectedClientId] = useState("");
  const [selectedService, setSelectedService] = useState("Consulta inicial");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [now, setNow] = useState(() => new Date());

  const weekDays = useMemo(() => {
    const baseDate = new Date();
    baseDate.setDate(baseDate.getDate() + weekOffset * 7);
    return generateWeek(baseDate);
  }, [weekOffset]);

  const selectedClient =
    clientList.find((client) => client.id === selectedClientId) ||
    clientList[0];
  const currentUserName = selectedClient?.name || "";
  const currentClientId = selectedClient?.id;

  const { allowPastBooking } = useScheduling();

  const targetDateStr = weekDays[selectedDay]?.iso || "";

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setNow(new Date());
    }, 30_000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    if (!selectedTime) {
      return;
    }

    if (!allowPastBooking && isBookingTimeExpired(targetDateStr, selectedTime, now)) {
      setSelectedTime("");
    }
  }, [now, selectedTime, targetDateStr, allowPastBooking]);

  // Calculate all occupied 30-min slots for the selected date from DB appointments
  const occupiedSlots = useMemo(() => {
    const set = new Set<string>();
    const dayAppointments = appointments.filter(
      (a) => a.date === targetDateStr,
    );
    dayAppointments.forEach((a) => {
      const slots = Appointment.getOccupiedSlots(a.time, a.duration);
      slots.forEach((s) => set.add(s));
    });
    return Array.from(set);
  }, [appointments, targetDateStr]);

  // Check if a time slot is disabled for selection with current selectedDuration
  function isTimeDisabled(time: string): boolean {
    if (!allowPastBooking && isBookingTimeExpired(targetDateStr, time, now)) {
      return true;
    }

    const requiredSlots = Appointment.getOccupiedSlots(time, selectedDuration);
    if (requiredSlots.length === 0) return true;

    // Check if any required consecutive slot is already occupied
    for (const slot of requiredSlots) {
      if (occupiedSlots.includes(slot)) return true;
    }

    if (
      hasClientScheduleConflict(appointments, {
        date: targetDateStr,
        time,
        duration: selectedDuration,
        name: currentUserName || "Cliente",
        clientId: currentClientId || null,
      })
    ) {
      return true;
    }

    return false;
  }

  async function confirm() {
    if (!selectedTime) return;
    if (isTimeDisabled(selectedTime)) {
      showToast(
        "Horário indisponível: já passou da tolerância de 5 minutos ou está reservado.",
      );
      return;
    }

    if (
      hasClientScheduleConflict(appointments, {
        date: targetDateStr,
        time: selectedTime,
        duration: selectedDuration,
        name: currentUserName || "Cliente",
        clientId: currentClientId || null,
      })
    ) {
      showToast(new ClientScheduleConflictError().message);
      return;
    }

    setSubmitting(true);
    try {
      const channel = appointmentChannels.find((item) => item.id === selectedChannel);
      await onAddAppointment({
        date: targetDateStr,
        time: selectedTime,
        name: currentUserName || "Cliente",
        service: selectedService,
        duration: selectedDuration,
        channelId: selectedChannel,
        notes,
        clientId: currentClientId,
      });
      showToast(
        `Agendamento de ${selectedDuration} criado e salvo no banco para às ${selectedTime} via ${channel?.name || "Sistema"}`,
      );
      setSelectedTime("");
      setNotes("");
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Erro ao agendar.";
      showToast(msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-[1500px] p-4 md:p-5 xl:p-8">
      <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-end md:justify-between xl:mb-6">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-zinc-950">
            Escolha uma data, duração e horário
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            Horários passados (com tolerância de 5 min) e ocupados ficam riscados.
          </p>
        </div>
        <div className="inline-flex w-fit items-center gap-2 rounded-xl border border-zinc-200 bg-white p-1">
          <Button
            size="icon"
            variant="ghost"
            className="size-8"
            onClick={() => setWeekOffset((prev) => prev - 1)}
          >
            <ChevronLeft />
          </Button>
          <span className="min-w-36 text-center text-sm font-semibold">
            {(() => {
              const monthNames = [
                "Janeiro",
                "Fevereiro",
                "Março",
                "Abril",
                "Maio",
                "Junho",
                "Julho",
                "Agosto",
                "Setembro",
                "Outubro",
                "Novembro",
                "Dezembro",
              ];
              if (weekDays.length === 0) return "Carregando...";
              const firstMonth = new Date(weekDays[0].iso).getMonth();
              const lastMonth = new Date(weekDays[6].iso).getMonth();
              const firstYear = new Date(weekDays[0].iso).getFullYear();
              const lastYear = new Date(weekDays[6].iso).getFullYear();
              if (firstMonth === lastMonth && firstYear === lastYear) {
                return `${monthNames[firstMonth]} ${firstYear}`;
              }
              if (firstYear === lastYear) {
                return `${monthNames[firstMonth]} — ${monthNames[lastMonth]} ${firstYear}`;
              }
              return `${monthNames[firstMonth]} ${firstYear} — ${monthNames[lastMonth]} ${lastYear}`;
            })()}
          </span>
          <Button
            size="icon"
            variant="ghost"
            className="size-8"
            onClick={() => setWeekOffset((prev) => prev + 1)}
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
                {weekDays.map((item, index) => {
                  const isToday = item.iso === getTodayIsoString();
                  const isSelected = selectedDay === index;

                  return (
                    <button
                      key={item.date}
                      onClick={() => {
                        setSelectedDay(index);
                        setSelectedTime("");
                      }}
                      className={cn(
                        "flex min-h-16 flex-col items-center justify-center rounded-xl border px-1 transition md:min-h-20 xl:min-h-24",
                        isSelected
                          ? "border-zinc-950 bg-zinc-950 text-white shadow-md"
                          : isToday
                            ? "border-zinc-950 bg-white text-zinc-950 shadow-md"
                            : "border-transparent bg-zinc-50 text-zinc-500 hover:border-zinc-200 hover:bg-white",
                      )}
                    >
                      <span className={cn("text-[9px] font-semibold uppercase md:text-[10px] xl:text-[11px]", isSelected ? "text-zinc-300" : isToday ? "text-zinc-950" : "text-zinc-400")}>
                        {item.day}
                      </span>
                      <span className="mt-1 text-lg font-semibold xl:text-xl">
                        {item.date}
                      </span>
                      {isToday && (
                        <span
                          className={cn(
                            "mt-1 size-1 rounded-full",
                            isSelected ? "bg-white" : "bg-zinc-950",
                          )}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card className="min-h-[420px]">
            <CardHeader className="flex-row items-center justify-between p-4 xl:p-5">
              <div>
                <CardTitle>Horários disponíveis</CardTitle>
                <CardDescription>
                  {weekDays[selectedDay].full} · Duração selecionada: {selectedDuration}
                </CardDescription>
              </div>
              <div className="hidden items-center gap-2 text-[9px] text-zinc-400 md:flex xl:gap-3 xl:text-[10px]">
                <span className="flex items-center gap-1.5">
                  <i className="size-2 rounded-full bg-zinc-950" /> Selecionado
                </span>
                <span className="flex items-center gap-1.5">
                  <i className="size-2 rounded-full bg-zinc-200" /> Indisponível
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
                    disabled={isTimeDisabled(time)}
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
                    disabled={isTimeDisabled(time)}
                    onClick={() => setSelectedTime(time)}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="h-fit min-h-[560px] min-w-0 md:sticky md:top-[104px] xl:top-[108px]">
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
                  value={selectedClient?.id || ""}
                  onChange={(e) => setSelectedClientId(e.target.value)}
                  className="h-11 w-full appearance-none rounded-lg border border-zinc-200 bg-white pl-9 pr-9 text-sm outline-none focus:border-zinc-400"
                >
                  {clientList.map((c) => (
                    <option key={c.id || c.email} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                  {clientList.length === 0 && <option value="">Nenhum cliente cadastrado no banco</option>}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
              </div>
            </div>
            <div>
              <FieldLabel>Duração do atendimento</FieldLabel>
              <div className="relative">
                <select
                  value={selectedDuration}
                  onChange={(e) => {
                    setSelectedDuration(e.target.value);
                    setSelectedTime("");
                  }}
                  className="h-11 w-full appearance-none rounded-lg border border-zinc-200 bg-white px-3 pr-9 text-sm font-semibold outline-none focus:border-zinc-400"
                >
                  <option value="30 min">30 min (1 horário)</option>
                  <option value="60 min (1h)">60 min / 1h (2 horários consecutivos)</option>
                  <option value="90 min (1h30)">90 min / 1h30 (3 horários consecutivos)</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
              </div>
            </div>
            <div>
              <FieldLabel>Serviço</FieldLabel>
              <div className="relative">
                <select
                  value={selectedService}
                  onChange={(e) => setSelectedService(e.target.value)}
                  className="h-11 w-full appearance-none rounded-lg border border-zinc-200 bg-white px-3 pr-9 text-sm outline-none focus:border-zinc-400"
                >
                  {serviceList && serviceList.length > 0 ? (
                    serviceList.map((service) => (
                      <option key={service.id} value={service.name}>
                        {service.name}
                      </option>
                    ))
                  ) : (
                    <option>Consulta inicial</option>
                  )}
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
                  {weekDays[selectedDay].full}
                </strong>
              </div>
              <div className="my-2 h-px bg-zinc-200" />
              <div className="flex items-center justify-between text-xs text-zinc-500">
                <span>Duração</span>
                <strong className="text-zinc-900">{selectedDuration}</strong>
              </div>
              <div className="my-2 h-px bg-zinc-200" />
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
              disabled={!selectedTime || submitting}
              onClick={confirm}
            >
              <Check /> {submitting ? "Salvando no banco..." : "Confirmar agendamento"}
            </Button>
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
  let className =
    "h-11 rounded-lg border border-zinc-200 bg-white text-sm font-medium text-zinc-700 transition hover:border-zinc-400 hover:bg-zinc-50";

  if (disabled) {
    className =
      "h-11 cursor-not-allowed rounded-lg border border-transparent bg-zinc-100 text-sm font-medium text-zinc-300 line-through transition";
  } else if (selected) {
    className =
      "h-11 rounded-lg border border-zinc-950 bg-zinc-950 text-sm font-medium text-white shadow-sm transition";
  }

  return (
    <button disabled={disabled} onClick={onClick} className={className}>
      {time}
    </button>
  );
}

function Users({
  showToast,
  userList,
  onAddUser,
  onUpdateUser,
  onDeleteUser,
  currentUserRole = "Administrador",
  initialEditUserId,
  onClearInitialEditUserId,
}: {
  showToast: (message: string) => void;
  userList: UserProps[];
  onAddUser: (user: {
    name: string;
    email: string;
    phone?: string;
    password?: string;
    permissionLevel?: 1 | 2 | 3;
  }) => Promise<void>;
  onUpdateUser: (id: string, status: "Ativo" | "Inativo") => Promise<void>;
  onDeleteUser: (id: string) => Promise<void>;
  currentUserRole?: StaffRole;
  initialEditUserId?: string | null;
  onClearInitialEditUserId?: () => void;
}) {
  const canEditUser = (targetUser: UserProps): boolean => {
    if (currentUserRole === "Administrador") return true;
    if (currentUserRole === "Gestor") {
      return targetUser.role === "Funcionario";
    }
    return false;
  };

    const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Todos");
  const [roleFilter, setRoleFilter] = useState("Todos");
  const [modal, setModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProps | null>(null);
  const [userError, setUserError] = useState("");
  const editModalRef = useRef<HTMLDivElement | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [systemPermissions, setSystemPermissions] = useState<SystemPermissionProps[]>([]);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [loadingPermissions, setLoadingPermissions] = useState(false);
  const [grantablePermissions, setGrantablePermissions] = useState<string[]>([]);
  const [phoneValue, setPhoneValue] = useState("");
  const [page, setPage] = useState(1);

  useScrollLock(modal || !!editingUser);

  useEffect(() => {
    if (initialEditUserId) {
      const target = userList.find((u) => u.id === initialEditUserId);
      if (target) {
        if (!canEditUser(target)) {
          showToast("Você não possui permissão para editar este usuário.");
          onClearInitialEditUserId?.();
          return;
        }
        setEditingUser(target);
        setUserError("");
        setPhoneValue(target.phone || "");
      }
    }
  }, [initialEditUserId, userList]);

  useEffect(() => {
    if (modal || editingUser) {
      const loadPermissions = async () => {
        try {
          setLoadingPermissions(true);
          const result = await getAvailablePermissionsForUserAction();
          if (result.success && result.data) {
            setSystemPermissions(result.data);
            setGrantablePermissions(result.grantablePermissions || []);
            if (editingUser && editingUser.permissions) {
              setSelectedPermissions(editingUser.permissions.map(p => p.name));
            } else {
              setSelectedPermissions([]);
            }
          }
        } catch (error) {
          console.error("Error loading permissions:", error);
        } finally {
          setLoadingPermissions(false);
        }
      };
      loadPermissions();
    }
  }, [modal, editingUser]);

  const filtered = useMemo(() => {
    return userList.filter((user) => {
      const matchSearch =
        user.name.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "Todos" || user.status === statusFilter;
      const matchRole = roleFilter === "Todos" || user.role === roleFilter;
      return matchSearch && matchStatus && matchRole;
    });
  }, [userList, search, statusFilter, roleFilter]);

  const pagedUsers = useMemo(
    () => paginateItems(filtered, page),
    [filtered, page],
  );

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, roleFilter]);

  async function addUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name"));
    const email = String(form.get("email"));
    const phone = String(form.get("phone") || "");
    const password = String(form.get("password") || "");
    const permissionLevel = Number(form.get("permissionLevel") || 3) as 1 | 2 | 3;

    try {
      await onAddUser({ name, email, phone, password, permissionLevel });
      
      // Find the newly created user and save permissions
      const newUser = userList.find(u => u.email === email);
      if (newUser && currentUserRole === "Administrador" && selectedPermissions.length > 0) {
        const permResult = await updateUserPermissionsAction({
          userId: newUser.id,
          permissionNames: selectedPermissions,
        });
        if (!permResult.success) {
          showToast(`Usuário criado, mas erro ao salvar permissões: ${permResult.error}`);
        }
      }
      
      setModal(false);
      setPhoneValue("");
      setSelectedPermissions([]);
      showToast("Novo usuário adicionado com sucesso");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Erro ao adicionar usuário";
      showToast(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-[1500px] p-4 sm:p-6 lg:p-8">
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-lg font-semibold text-zinc-950">
            Todos os usuários
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            Gerencie clientes e pessoas da sua equipe salvos no banco.
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
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome ou e-mail..."
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 rounded-lg border border-zinc-200 bg-white px-3 text-xs font-medium text-zinc-700 outline-none"
          >
            <option value="Todos">Status: Todos</option>
            <option value="Ativo">Ativo</option>
            <option value="Inativo">Inativo</option>
          </select>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="h-10 rounded-lg border border-zinc-200 bg-white px-3 text-xs font-medium text-zinc-700 outline-none"
          >
            <option value="Todos">Perfil: Todos</option>
            <option value="Administrador">Administrador</option>
            <option value="Gestor">Gestor</option>
            <option value="Funcionario">Funcionário</option>
          </select>
        </div>
      </div>

      <Card className="overflow-visible">
        <div className="hidden h-11 grid-cols-[1.5fr_1.25fr_1fr_.8fr_36px] items-center gap-4 border-b border-zinc-200 bg-zinc-50/70 px-5 text-[10px] font-semibold uppercase tracking-wider text-zinc-400 lg:grid">
          <span>Usuário</span>
          <span>Contato</span>
          <span>Perfil / Permissão</span>
          <span>Status</span>
          <span />
        </div>
        <div className={cn("divide-y divide-zinc-100", TABLE_BODY_MIN_HEIGHT_CLASS)}>
          {pagedUsers.map((user) => {
            const isTargetAdmin = user.role === "Administrador";
            const isTargetManager = user.role === "Gestor";
            const canModify =
              currentUserRole === "Administrador" ||
              (currentUserRole === "Gestor" && !isTargetAdmin && !isTargetManager);

            return (
              <div
                key={user.id || user.email}
                className={cn(
                  "grid gap-4 p-5 transition hover:bg-zinc-50 lg:grid-cols-[1.5fr_1.25fr_1fr_.8fr_36px] lg:items-center",
                  TABLE_ROW_MIN_HEIGHT_CLASS,
                )}
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
                <div className="relative">
                  {canModify ? (
                    <>
                      <button
                        type="button"
                        onClick={() =>
                          setOpenMenuId(openMenuId === user.id ? null : user.id)
                        }
                        className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-100 hover:text-black"
                      >
                        <MoreVertical className="size-4" />
                      </button>
                      {openMenuId === user.id && (
                        <div className="absolute right-0 top-10 z-[60] w-48 rounded-xl border border-zinc-200 bg-white p-1.5 shadow-xl">
                          {canEditUser(user) ? (
                            <button
                              type="button"
                              onClick={() => {
                                setEditingUser(user);
                                setUserError("");
                                setPhoneValue(user.phone || "");
                                setOpenMenuId(null);
                              }}
                              className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-100 transition-colors"
                            >
                              <Pencil className="size-4 shrink-0 text-zinc-500" /> Editar
                            </button>
                          ) : (
                            <button
                              type="button"
                              disabled
                              className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-zinc-400 cursor-not-allowed"
                            >
                              <Pencil className="size-4 shrink-0 text-zinc-300" /> Editar
                            </button>
                          )}
                          {canEditUser(user) && (
                            <button
                              type="button"
                              onClick={async () => {
                                const newStatus = user.status === "Ativo" ? "Inativo" : "Ativo";
                                await onUpdateUser(user.id, newStatus);
                                showToast(`Status de ${user.name} alterado no banco para ${newStatus}`);
                                setOpenMenuId(null);
                              }}
                              className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-100 transition-colors"
                            >
                              <Power className="size-4 shrink-0 text-zinc-500" /> Status
                            </button>
                          )}
                          {currentUserRole === "Administrador" && (
                            <>
                              <div className="my-1 h-px bg-zinc-100" />
                              <button
                                type="button"
                                onClick={async () => {
                                  await onDeleteUser(user.id);
                                  showToast(`Usuário ${user.name} excluído do banco`);
                                  setOpenMenuId(null);
                                }}
                                className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
                              >
                                <Trash2 className="size-4 shrink-0 text-red-500" /> Excluir
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </>
                  ) : (
                    <span className="text-[10px] font-medium text-zinc-400">Restrito</span>
                  )}
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div className="p-8 text-center text-sm text-zinc-400">
              Nenhum usuário cadastrado no banco de dados.
            </div>
          )}
        </div>
        <ListPagination
          page={page}
          totalItems={filtered.length}
          onPageChange={setPage}
          label="usuários"
        />
      </Card>

      {modal && (
        <div
          className="fixed inset-0 lg:left-[256px] z-[70] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
          onMouseDown={(e) => e.target === e.currentTarget && setModal(false)}
        >
          <Card className="max-h-[90vh] w-full max-w-md overflow-y-auto shadow-2xl">
            <CardHeader className="flex-row items-start justify-between">
              <div>
                <CardTitle>Adicionar usuário</CardTitle>
                <CardDescription>
                  Cadastre um novo usuário com senha no PostgreSQL.
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="-mr-2 -mt-2"
                onClick={() => {
                  setModal(false);
                  setPhoneValue("");
                }}
              >
                <X />
              </Button>
            </CardHeader>
            <form onSubmit={addUser}>
              <CardContent className="space-y-4">
                <div>
                  <FieldLabel>Nome completo</FieldLabel>
                  <Input name="name" required placeholder="Ex.: João da Silva" />
                </div>
                <div>
                  <FieldLabel>E-mail</FieldLabel>
                  <Input name="email" required type="email" placeholder="joao@email.com" />
                </div>
                <div>
                  <FieldLabel>Senha de Acesso</FieldLabel>
                  <Input
                    name="password"
                    type="password"
                    required
                    placeholder="Digite uma senha segura..."
                  />
                </div>
                <div>
                  <FieldLabel>Telefone</FieldLabel>
                  <Input
                    name="phone"
                    value={phoneValue}
                    onChange={(event) => {
                      setPhoneValue(formatPhoneBR(event.target.value));
                    }}
                    inputMode="numeric"
                    autoComplete="tel"
                    placeholder="(62) 99427-9139"
                    maxLength={15}
                  />
                </div>
                <div>
                  <FieldLabel>Perfil</FieldLabel>
                  <select
                    name="permissionLevel"
                    defaultValue={currentUserRole === "Gestor" ? "2" : "1"}
                    className="h-11 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-800 outline-none"
                  >
                    {currentUserRole === "Administrador" && (
                      <option value="1">Nível 1 — Administrador (Total)</option>
                    )}
                    <option value="2">Nível 2 — Gestor (Intermediário)</option>
                    <option value="3">Nível 3 — Funcionário (Operacional)</option>
                  </select>
                </div>
                {currentUserRole === "Administrador" && (
                  <div>
                    <FieldLabel>Permissões</FieldLabel>
                    {loadingPermissions ? (
                      <div className="text-xs text-zinc-500 py-2">Carregando permissões...</div>
                    ) : (
                      <div className="space-y-2 max-h-48 overflow-y-auto border border-zinc-200 rounded-lg p-3 bg-zinc-50">
                        {systemPermissions.map((perm) => {
                          const isGrantable = grantablePermissions.includes(perm.name);
                          const isChecked = selectedPermissions.includes(perm.name);
                          return (
                            <label key={perm.id} className="flex items-start gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                disabled={!isGrantable}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedPermissions([...selectedPermissions, perm.name]);
                                  } else {
                                    setSelectedPermissions(selectedPermissions.filter(p => p !== perm.name));
                                  }
                                }}
                                className="mt-1 rounded border-zinc-300 disabled:opacity-50"
                              />
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium text-zinc-900">{perm.name}</div>
                                {perm.description && (
                                  <div className="text-xs text-zinc-500">{perm.description}</div>
                                )}
                                {!isGrantable && (
                                  <div className="text-xs text-zinc-400 italic">Restrito</div>
                                )}
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setModal(false);
                      setPhoneValue("");
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? "Salvando no banco..." : "Adicionar usuário"}
                  </Button>
                </div>
              </CardContent>
            </form>
          </Card>
        </div>
      )}
      {editingUser && (
        <div
          className="fixed inset-0 lg:left-[256px] z-[70] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
          onMouseDown={(e) => e.target === e.currentTarget && setEditingUser(null)}
        >
          <Card ref={editModalRef} className="max-h-[90vh] w-full max-w-md overflow-y-auto shadow-2xl">
            <CardHeader className="flex-row items-start justify-between">
              <div>
                <CardTitle>Editar usuário</CardTitle>
                <CardDescription>
                  Atualize as informações do usuário conforme suas permissões.
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="-mr-2 -mt-2"
                onClick={() => {
                  setEditingUser(null);
                  setPhoneValue("");
                  onClearInitialEditUserId?.();
                }}
              >
                <X />
              </Button>
            </CardHeader>
            <form
              onSubmit={async (event) => {
                event.preventDefault();
                setLoading(true);
                const form = new FormData(event.currentTarget);
                const name = String(form.get("name"));
                const email = String(form.get("email"));
                const phone = String(form.get("phone") || "");
                const currentPassword = String(form.get("currentPassword") || "");
                const password = String(form.get("password") || "");
                const confirmPassword = String(form.get("confirmPassword") || "");
                const status = String(form.get("status")) as "Ativo" | "Inativo";
                const levelVal = form.get("permissionLevel");
                const permissionLevel = levelVal ? (Number(levelVal) as 1 | 2 | 3) : undefined;
                const role = permissionLevel ? roleFromPermissionLevel(permissionLevel) : undefined;

                try {
                  setUserError("");
                  const res = await updateUserAction({
                    id: editingUser.id,
                    name,
                    email,
                    phone,
                    currentPassword: currentPassword || undefined,
                    password: password || undefined,
                    confirmPassword: confirmPassword || undefined,
                    role,
                    status,
                  });

                  if (res.success && res.data) {
                    // Update permissions if admin
                    if (currentUserRole === "Administrador") {
                      const permResult = await updateUserPermissionsAction({
                        userId: editingUser.id,
                        permissionNames: selectedPermissions,
                      });
                      if (!permResult.success) {
                        showToast(`Usuário atualizado, mas erro ao salvar permissões: ${permResult.error}`);
                      }
                    }
                    
                    onUpdateUser(editingUser.id, status);
                    showToast(`Usuário ${name} atualizado com sucesso no banco!`);
                    setEditingUser(null);
                    setPhoneValue("");
                    setSelectedPermissions([]);
                    onClearInitialEditUserId?.();
                  } else {
                    const err = res.error || "Erro ao atualizar usuário.";
                    setUserError(err);
                    editModalRef.current?.scrollTo({ top: 0, behavior: "smooth" });
                  }
                } catch (error: unknown) {
                  const message = error instanceof Error ? error.message : "Erro ao atualizar usuário.";
                  setUserError(message);
                  editModalRef.current?.scrollTo({ top: 0, behavior: "smooth" });
                } finally {
                  setLoading(false);
                }
              }}
            >
              <CardContent className="space-y-4">
                {userError && (
                  <div className="flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-center text-xs font-semibold text-red-600 shadow-sm animate-in fade-in zoom-in duration-200">
                    <span className="flex size-4 shrink-0 items-center justify-center rounded-full bg-red-600 text-white font-bold text-[10px]">
                      !
                    </span>
                    <span>{userError}</span>
                  </div>
                )}
                <div>
                  <FieldLabel>Nome completo</FieldLabel>
                  <Input name="name" required defaultValue={editingUser.name} />
                </div>
                <div>
                  <FieldLabel>E-mail</FieldLabel>
                  <Input name="email" required type="email" defaultValue={editingUser.email} />
                </div>
                <div className="rounded-xl border border-zinc-200 bg-zinc-50/70 p-3.5 space-y-3">
                  <p className="text-xs font-semibold text-zinc-900">Alteração de Senha (Opcional)</p>
                  <div>
                    <FieldLabel>Senha atual (obrigatória para alterar)</FieldLabel>
                    <Input
                      name="currentPassword"
                      type="password"
                      placeholder="Sua senha em uso..."
                    />
                  </div>
                  <div>
                    <FieldLabel>Nova senha</FieldLabel>
                    <Input
                      name="password"
                      type="password"
                      placeholder="Digite a nova senha..."
                    />
                  </div>
                  <div>
                    <FieldLabel>Confirme a nova senha</FieldLabel>
                    <Input
                      name="confirmPassword"
                      type="password"
                      placeholder="Repita a nova senha..."
                    />
                  </div>
                </div>
                <div>
                  <FieldLabel>Telefone</FieldLabel>
                  <Input
                    name="phone"
                    value={phoneValue}
                    onChange={(event) => {
                      setPhoneValue(formatPhoneBR(event.target.value));
                    }}
                    inputMode="numeric"
                    autoComplete="tel"
                    placeholder="(62) 99427-9139"
                    maxLength={15}
                  />
                </div>
                <div>
                  <FieldLabel>Status</FieldLabel>
                  <select
                    name="status"
                    defaultValue={editingUser.status}
                    className="h-11 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-800 outline-none"
                  >
                    <option value="Ativo">Ativo</option>
                    <option value="Inativo">Inativo</option>
                  </select>
                </div>
                {currentUserRole === "Administrador" && (
                  <div>
                    <FieldLabel>Perfil</FieldLabel>
                    <select
                      name="permissionLevel"
                      defaultValue={
                        editingUser.role === "Administrador"
                          ? "1"
                          : editingUser.role === "Gestor"
                          ? "2"
                          : "3"
                      }
                      className="h-11 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-800 outline-none"
                    >
                      <option value="1">Nível 1 — Administrador (Total)</option>
                      <option value="2">Nível 2 — Gestor (Intermediário)</option>
                      <option value="3">Nível 3 — Funcionário (Operacional)</option>
                    </select>
                  </div>
                )}
                {currentUserRole === "Administrador" && (
                  <div>
                    <FieldLabel>Permissões</FieldLabel>
                    {loadingPermissions ? (
                      <div className="text-xs text-zinc-500 py-2">Carregando permissões...</div>
                    ) : (
                      <div className="space-y-2 max-h-48 overflow-y-auto border border-zinc-200 rounded-lg p-3 bg-zinc-50">
                        {systemPermissions.map((perm) => {
                          const isGrantable = grantablePermissions.includes(perm.name);
                          const isChecked = selectedPermissions.includes(perm.name);
                          return (
                            <label key={perm.id} className="flex items-start gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                disabled={!isGrantable}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedPermissions([...selectedPermissions, perm.name]);
                                  } else {
                                    setSelectedPermissions(selectedPermissions.filter(p => p !== perm.name));
                                  }
                                }}
                                className="mt-1 rounded border-zinc-300 disabled:opacity-50"
                              />
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium text-zinc-900">{perm.name}</div>
                                {perm.description && (
                                  <div className="text-xs text-zinc-500">{perm.description}</div>
                                )}
                                {!isGrantable && (
                                  <div className="text-xs text-zinc-400 italic">Restrito</div>
                                )}
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setEditingUser(null);
                      setPhoneValue("");
                      onClearInitialEditUserId?.();
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? "Salvando..." : "Salvar alterações"}
                  </Button>
                </div>
              </CardContent>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}

function CustomDatePicker({
  name,
  value,
  onChange,
}: {
  name: string;
  value: string;
  onChange: (val: string) => void;
}) {
  const [open, setOpen] = useState(false);

  const parsed = useMemo(() => {
    if (value && value.includes("-")) {
      const [y, m, d] = value.split("-").map(Number);
      if (!isNaN(y) && !isNaN(m) && !isNaN(d)) {
        return { year: y, month: m - 1, day: d };
      }
    }
    return { year: 1995, month: 0, day: 15 };
  }, [value]);

  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);

  const currentYear = selectedYear ?? parsed.year;
  const currentMonth = selectedMonth ?? parsed.month;

  const months = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ];

  const years = useMemo(() => {
    const currentYearNum = new Date().getFullYear();
    const list = [];
    for (let y = currentYearNum; y >= 1920; y--) {
      list.push(y);
    }
    return list;
  }, []);

  const daysInMonth = useMemo(() => {
    return new Date(currentYear, currentMonth + 1, 0).getDate();
  }, [currentYear, currentMonth]);

  const formattedDisplay = useMemo(() => {
    if (!value || !value.includes("-")) return "";
    const [y, m, d] = value.split("-");
    if (!y || !m || !d) return "";
    return `${d.padStart(2, "0")}/${m.padStart(2, "0")}/${y}`;
  }, [value]);

  function selectDay(d: number) {
    const mStr = String(currentMonth + 1).padStart(2, "0");
    const dStr = String(d).padStart(2, "0");
    onChange(`${currentYear}-${mStr}-${dStr}`);
    setOpen(false);
  }

  return (
    <div className="relative">
      <input type="hidden" name={name} value={value} />
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex h-11 w-full items-center gap-3 rounded-xl border border-zinc-200 bg-white px-3.5 text-sm font-medium text-zinc-900 shadow-sm transition hover:border-zinc-300 focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950"
      >
        <CalendarDays className="size-4 shrink-0 text-zinc-400" />
        <span
          className={
            formattedDisplay
              ? "font-medium text-zinc-900"
              : "font-normal text-zinc-400"
          }
        >
          {formattedDisplay || "Selecione a data de nascimento"}
        </span>
        <ChevronDown className="ml-auto size-4 text-zinc-400" />
      </button>

      {open && (
        <div
          className="fixed inset-0 lg:left-[256px] z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
          onMouseDown={(e) => e.target === e.currentTarget && setOpen(false)}
        >
          <div className="w-full max-w-[310px] rounded-2xl border border-zinc-200 bg-white p-3.5 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="mb-2.5 flex items-center justify-between border-b border-zinc-100 pb-2">
              <span className="text-xs font-semibold text-zinc-900">
                Selecione a data
              </span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-950"
              >
                <X className="size-4" />
              </button>
            </div>
            <div className="mb-2.5 flex items-center gap-1.5">
              <select
                value={currentMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="h-8 flex-1 rounded-lg border border-zinc-200 bg-zinc-50 px-2 text-xs font-semibold text-zinc-800 outline-none hover:bg-zinc-100"
              >
                {months.map((m, idx) => (
                  <option key={m} value={idx}>
                    {m}
                  </option>
                ))}
              </select>
              <select
                value={currentYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="h-8 w-20 rounded-lg border border-zinc-200 bg-zinc-50 px-2 text-xs font-semibold text-zinc-800 outline-none hover:bg-zinc-100"
              >
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-1 grid grid-cols-7 text-center text-[10px] font-semibold uppercase text-zinc-400">
              <span>D</span>
              <span>S</span>
              <span>T</span>
              <span>Q</span>
              <span>Q</span>
              <span>S</span>
              <span>S</span>
            </div>

            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const dayNum = i + 1;
                const isSelected =
                  parsed.year === currentYear &&
                  parsed.month === currentMonth &&
                  parsed.day === dayNum &&
                  Boolean(value);

                return (
                  <button
                    key={dayNum}
                    type="button"
                    onClick={() => selectDay(dayNum)}
                    className={cn(
                      "flex size-7 items-center justify-center rounded-lg text-xs font-medium transition",
                      isSelected
                        ? "bg-zinc-950 font-bold text-white shadow-sm"
                        : "text-zinc-700 hover:bg-zinc-100 hover:text-zinc-950",
                    )}
                  >
                    {dayNum}
                  </button>
                );
              })}
            </div>

            <div className="mt-2.5 flex items-center justify-between border-t border-zinc-100 pt-2">
              <button
                type="button"
                onClick={() => {
                  onChange("");
                  setOpen(false);
                }}
                className="text-xs font-medium text-zinc-400 hover:text-zinc-600"
              >
                Limpar
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-xs font-semibold text-zinc-950 hover:underline"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Clients({
  showToast,
  clientList,
  appointments,
  onAddClient,
  onUpdateClient,
  onDeleteClient,
}: {
  showToast: (message: string) => void;
  clientList: ClientProps[];
  appointments: AppointmentProps[];
  onAddClient: (client: {
    name: string;
    email: string;
    phone: string;
    cpf?: string;
    birthDate?: string;
  }) => Promise<void>;
  onUpdateClient: (id: string, status: "Ativo" | "Inativo") => Promise<void>;
  onDeleteClient: (id: string) => Promise<void>;
}) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Todos");
  const [modal, setModal] = useState(false);
  const [editingClient, setEditingClient] = useState<ClientProps | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [phoneValue, setPhoneValue] = useState("");
  const [cpfValue, setCpfValue] = useState("");
  const [birthDateValue, setBirthDateValue] = useState("");
  const [page, setPage] = useState(1);

  useScrollLock(modal || !!editingClient);

  const filtered = useMemo(() => {
    return clientList.filter((c) => {
      const matchSearch =
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.email.toLowerCase().includes(search.toLowerCase()) ||
        (c.cpf && c.cpf.includes(search));
      const matchStatus = statusFilter === "Todos" || c.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [clientList, search, statusFilter]);

  const pagedClients = useMemo(
    () => paginateItems(filtered, page),
    [filtered, page],
  );

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter]);

  async function addClient(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name"));
    const email = String(form.get("email"));
    const phone = String(form.get("phone"));
    const cpf = String(form.get("cpf") || "");
    const birthDate = String(form.get("birthDate") || "");

    try {
      await onAddClient({ name, email, phone, cpf, birthDate });
      setModal(false);
      setPhoneValue("");
      setCpfValue("");
      setBirthDateValue("");
      showToast("Novo cliente cadastrado com sucesso no PostgreSQL");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Erro ao cadastrar cliente";
      showToast(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-[1500px] p-4 sm:p-6 lg:p-8">
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-lg font-semibold text-zinc-950">
            Base de Clientes
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            Gerencie os clientes cadastrados no banco de dados para agendamentos.
          </p>
        </div>
        <Button onClick={() => setModal(true)}>
          <Plus /> Adicionar cliente
        </Button>
      </div>

      <div className="mb-4 grid gap-3 sm:grid-cols-[1fr_auto]">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome, e-mail ou CPF..."
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 rounded-lg border border-zinc-200 bg-white px-3 text-xs font-medium text-zinc-700 outline-none"
          >
            <option value="Todos">Status: Todos</option>
            <option value="Ativo">Ativo</option>
            <option value="Inativo">Inativo</option>
          </select>
        </div>
      </div>

      <Card className="overflow-visible">
        <div className="hidden h-11 grid-cols-[1.4fr_1.1fr_1fr_.7fr_.9fr_36px] items-center gap-4 border-b border-zinc-200 bg-zinc-50/70 px-5 text-[10px] font-semibold uppercase tracking-wider text-zinc-400 lg:grid">
          <span>Cliente</span>
          <span>Contato</span>
          <span>CPF / Data Nasc.</span>
          <span>Status</span>
          <span>Último agendamento</span>
          <span />
        </div>
        <div className={cn("divide-y divide-zinc-100", TABLE_BODY_MIN_HEIGHT_CLASS)}>
          {pagedClients.map((client) => {
            const lastAppointment = getLastAppointmentForClient(
              appointments,
              client,
            );
            let lastAppointmentLabel = "Sem registro";
            if (lastAppointment) {
              lastAppointmentLabel =
                formatAppointmentRelativeLabel(lastAppointment);
            }

            return (
              <div
                key={client.id || client.email}
                className={cn(
                  "grid gap-4 p-5 transition hover:bg-zinc-50 lg:grid-cols-[1.4fr_1.1fr_1fr_.7fr_.9fr_36px] lg:items-center",
                  TABLE_ROW_MIN_HEIGHT_CLASS,
                )}
              >
                <div className="flex min-w-0 items-center gap-3">
                  <Avatar
                    initials={client.initials || "CL"}
                    className="bg-zinc-900 text-white ring-0"
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-zinc-900">
                      {client.name}
                    </p>
                    <p className="truncate text-xs text-zinc-400 lg:hidden">
                      {client.email}
                    </p>
                  </div>
                </div>
                <div className="hidden lg:block">
                  <p className="truncate text-xs font-medium text-zinc-700">
                    {client.email}
                  </p>
                  <p className="mt-0.5 text-xs text-zinc-400">{client.phone}</p>
                </div>
                <div className="text-xs text-zinc-600">
                  <p className="font-medium text-zinc-800">{client.cpf || "Sem CPF"}</p>
                  <p className="text-[11px] text-zinc-400">{client.birthDate || "Sem data nasc."}</p>
                </div>
                <div>
                  <Badge
                    variant={client.status === "Ativo" ? "success" : "secondary"}
                  >
                    <span className="mr-1.5 size-1.5 rounded-full bg-current" />
                    {client.status}
                  </Badge>
                </div>
                <div className="text-xs font-medium text-zinc-500">
                  {lastAppointmentLabel}
                </div>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() =>
                      setOpenMenuId(openMenuId === client.id ? null : client.id || null)
                    }
                    className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-100 hover:text-black"
                  >
                    <MoreVertical className="size-4" />
                  </button>
                  {openMenuId === client.id && (
                    <div className="absolute right-0 top-10 z-[60] w-48 rounded-xl border border-zinc-200 bg-white p-1.5 shadow-xl">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingClient(client);
                          setPhoneValue(client.phone || "");
                          setCpfValue(client.cpf || "");
                          setBirthDateValue(client.birthDate || "");
                          setOpenMenuId(null);
                        }}
                        className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-100 transition-colors"
                      >
                        <Pencil className="size-4 shrink-0 text-zinc-500" /> Editar
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          const newStatus = client.status === "Ativo" ? "Inativo" : "Ativo";
                          await onUpdateClient(client.id || "", newStatus);
                          showToast(`Status de ${client.name} alterado no banco para ${newStatus}`);
                          setOpenMenuId(null);
                        }}
                        className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-100 transition-colors"
                      >
                        <Power className="size-4 shrink-0 text-zinc-500" /> Status
                      </button>
                      <div className="my-1 h-px bg-zinc-100" />
                      <button
                        type="button"
                        onClick={async () => {
                          await onDeleteClient(client.id || "");
                          showToast(`Cliente ${client.name} excluído do banco`);
                          setOpenMenuId(null);
                        }}
                        className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="size-4 shrink-0 text-red-500" /> Excluir
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div className="p-8 text-center text-sm text-zinc-400">
              Nenhum cliente cadastrado no banco de dados.
            </div>
          )}
        </div>
        <ListPagination
          page={page}
          totalItems={filtered.length}
          onPageChange={setPage}
          label="clientes"
        />
      </Card>

      {modal && (
        <div
          className="fixed inset-0 lg:left-[256px] z-[70] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
          onMouseDown={(e) => e.target === e.currentTarget && setModal(false)}
        >
          <Card className="max-h-[90vh] w-full max-w-md overflow-y-auto shadow-2xl">
            <CardHeader className="flex-row items-start justify-between">
              <div>
                <CardTitle>Adicionar cliente</CardTitle>
                <CardDescription>
                  Cadastre um novo cliente no PostgreSQL.
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="-mr-2 -mt-2"
                onClick={() => {
                  setModal(false);
                  setPhoneValue("");
                  setCpfValue("");
                  setBirthDateValue("");
                }}
              >
                <X />
              </Button>
            </CardHeader>
            <form onSubmit={addClient}>
              <CardContent className="space-y-4">
                <div>
                  <FieldLabel>Nome completo</FieldLabel>
                  <Input name="name" required placeholder="Ex.: Maria de Oliveira" />
                </div>
                <div>
                  <FieldLabel>E-mail</FieldLabel>
                  <Input name="email" required type="email" placeholder="maria@email.com" />
                </div>
                <div>
                  <FieldLabel>Telefone / Contato</FieldLabel>
                  <Input
                    name="phone"
                    required
                    value={phoneValue}
                    onChange={(event) => {
                      setPhoneValue(formatPhoneBR(event.target.value));
                    }}
                    inputMode="numeric"
                    autoComplete="tel"
                    placeholder="(62) 99427-9139"
                    maxLength={15}
                  />
                </div>
                <div>
                  <FieldLabel>CPF</FieldLabel>
                  <Input
                    name="cpf"
                    value={cpfValue}
                    onChange={(event) => {
                      setCpfValue(formatCpf(event.target.value));
                    }}
                    inputMode="numeric"
                    autoComplete="off"
                    placeholder="000.000.000-00"
                    maxLength={14}
                  />
                </div>
                <div>
                  <FieldLabel>Data de Nascimento</FieldLabel>
                  <CustomDatePicker
                    name="birthDate"
                    value={birthDateValue}
                    onChange={setBirthDateValue}
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setModal(false);
                      setPhoneValue("");
                      setCpfValue("");
                      setBirthDateValue("");
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? "Salvando no banco..." : "Adicionar cliente"}
                  </Button>
                </div>
              </CardContent>
            </form>
          </Card>
        </div>
      )}
      {editingClient && (
        <div
          className="fixed inset-0 lg:left-[256px] z-[70] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
          onMouseDown={(e) => e.target === e.currentTarget && setEditingClient(null)}
        >
          <Card className="max-h-[90vh] w-full max-w-md overflow-y-auto shadow-2xl">
            <CardHeader className="flex-row items-start justify-between">
              <div>
                <CardTitle>Editar cliente</CardTitle>
                <CardDescription>
                  Atualize as informações do cliente cadastrado no banco.
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="-mr-2 -mt-2"
                onClick={() => {
                  setEditingClient(null);
                  setPhoneValue("");
                  setCpfValue("");
                  setBirthDateValue("");
                }}
              >
                <X />
              </Button>
            </CardHeader>
            <form
              onSubmit={async (event) => {
                event.preventDefault();
                setLoading(true);
                const form = new FormData(event.currentTarget);
                const name = String(form.get("name"));
                const email = String(form.get("email"));
                const phone = String(form.get("phone") || "");
                const cpf = String(form.get("cpf") || "");
                const status = String(form.get("status")) as "Ativo" | "Inativo";

                try {
                  const res = await updateClientAction({
                    id: editingClient.id || "",
                    name,
                    email,
                    phone,
                    cpf,
                    birthDate: birthDateValue || undefined,
                    status,
                  });

                  if (res.success && res.data) {
                    onUpdateClient(editingClient.id || "", status);
                    showToast(`Cliente ${name} atualizado com sucesso no banco!`);
                    setEditingClient(null);
                    setPhoneValue("");
                    setCpfValue("");
                    setBirthDateValue("");
                  } else {
                    showToast(res.error || "Erro ao atualizar cliente.");
                  }
                } catch (error: unknown) {
                  const message = error instanceof Error ? error.message : "Erro ao atualizar cliente.";
                  showToast(message);
                } finally {
                  setLoading(false);
                }
              }}
            >
              <CardContent className="space-y-4">
                <div>
                  <FieldLabel>Nome completo</FieldLabel>
                  <Input name="name" required defaultValue={editingClient.name} />
                </div>
                <div>
                  <FieldLabel>E-mail</FieldLabel>
                  <Input name="email" required type="email" defaultValue={editingClient.email} />
                </div>
                <div>
                  <FieldLabel>Telefone</FieldLabel>
                  <Input
                    name="phone"
                    value={phoneValue}
                    onChange={(event) => {
                      setPhoneValue(formatPhoneBR(event.target.value));
                    }}
                    inputMode="numeric"
                    autoComplete="tel"
                    placeholder="(62) 99427-9139"
                    maxLength={15}
                  />
                </div>
                <div>
                  <FieldLabel>CPF</FieldLabel>
                  <Input
                    name="cpf"
                    value={cpfValue}
                    onChange={(event) => {
                      setCpfValue(formatCpf(event.target.value));
                    }}
                    inputMode="numeric"
                    autoComplete="off"
                    placeholder="000.000.000-00"
                    maxLength={14}
                  />
                </div>
                <div>
                  <FieldLabel>Data de Nascimento</FieldLabel>
                  <CustomDatePicker
                    name="birthDate"
                    value={birthDateValue}
                    onChange={setBirthDateValue}
                  />
                </div>
                <div>
                  <FieldLabel>Status</FieldLabel>
                  <select
                    name="status"
                    defaultValue={editingClient.status}
                    className="h-11 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-800 outline-none"
                  >
                    <option value="Ativo">Ativo</option>
                    <option value="Inativo">Inativo</option>
                  </select>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setEditingClient(null);
                      setPhoneValue("");
                      setCpfValue("");
                      setBirthDateValue("");
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? "Salvando..." : "Salvar alterações"}
                  </Button>
                </div>
              </CardContent>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}

function Products({
  showToast,
  productList,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
}: {
  showToast: (message: string) => void;
  productList: (ProductProps & { formattedPrice?: string })[];
  onAddProduct: (prod: { name: string; category: string; price: number; quantity: number; status?: "Ativo" | "Inativo" | "Baixo estoque" }) => Promise<void>;
  onUpdateProduct: (id: string, status: "Ativo" | "Inativo" | "Baixo estoque") => Promise<void>;
  onDeleteProduct: (id: string) => Promise<void>;
}) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Todos");
  const [categoryFilter, setCategoryFilter] = useState("Todas");
  const [modal, setModal] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);

  useScrollLock(modal);

  const filtered = useMemo(() => {
    return productList.filter((product) => {
      const term = search.toLowerCase();
      const matchSearch =
        product.name.toLowerCase().includes(term) ||
        product.category.toLowerCase().includes(term);
      const matchStatus = statusFilter === "Todos" || product.status === statusFilter;
      const matchCategory = categoryFilter === "Todas" || product.category === categoryFilter;
      return matchSearch && matchStatus && matchCategory;
    });
  }, [productList, search, statusFilter, categoryFilter]);

  const pagedProducts = useMemo(
    () => paginateItems(filtered, page),
    [filtered, page],
  );

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, categoryFilter]);

  async function addProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name"));
    const category = String(form.get("category"));
    const quantity = Number(form.get("quantity"));
    const price = Number(form.get("price"));
    const selectedStatus = String(form.get("status")) as "Ativo" | "Inativo" | "Baixo estoque";

    try {
      await onAddProduct({ name, category, price, quantity, status: selectedStatus });
      setModal(false);
      showToast("Novo produto adicionado com sucesso e salvo no banco");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Erro ao adicionar produto";
      showToast(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-[1500px] p-4 sm:p-6 lg:p-8">
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-lg font-semibold text-zinc-950">
            Todos os produtos
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            Gerencie o catálogo e acompanhe o estoque salvo no banco.
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
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome ou categoria..."
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 rounded-lg border border-zinc-200 bg-white px-3 text-xs font-medium text-zinc-700 outline-none"
          >
            <option value="Todos">Status: Todos</option>
            <option value="Ativo">Ativo</option>
            <option value="Baixo estoque">Baixo estoque</option>
            <option value="Inativo">Inativo</option>
          </select>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="h-10 rounded-lg border border-zinc-200 bg-white px-3 text-xs font-medium text-zinc-700 outline-none"
          >
            <option value="Todas">Categoria: Todas</option>
            <option value="Skincare">Skincare</option>
            <option value="Proteção solar">Proteção solar</option>
            <option value="Corporal">Corporal</option>
            <option value="Higiene">Higiene</option>
            <option value="Kits">Kits</option>
          </select>
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="hidden h-11 grid-cols-[1.6fr_1fr_.8fr_.65fr_.7fr_36px] items-center gap-4 border-b border-zinc-200 bg-zinc-50/70 px-5 text-[10px] font-semibold uppercase tracking-wider text-zinc-400 lg:grid">
          <span>Produto</span>
          <span>Categoria</span>
          <span>Preço</span>
          <span>Quantidade</span>
          <span>Status</span>
          <span />
        </div>
        <div className={cn("divide-y divide-zinc-100", TABLE_BODY_MIN_HEIGHT_CLASS)}>
          {pagedProducts.map((product) => (
            <div
              key={product.id || product.name}
              className={cn(
                "grid gap-4 p-5 transition hover:bg-zinc-50 lg:grid-cols-[1.6fr_1fr_.8fr_.65fr_.7fr_36px] lg:items-center",
                TABLE_ROW_MIN_HEIGHT_CLASS,
              )}
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
                {product.formattedPrice ||
                  (typeof product.price === "number"
                    ? product.price.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })
                    : product.price)}
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
              <div className="relative">
                <button
                  type="button"
                  onClick={() =>
                    setOpenMenuId(openMenuId === product.id ? null : product.id)
                  }
                  className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-100 hover:text-black"
                >
                  <MoreVertical className="size-4" />
                </button>
                {openMenuId === product.id && (
                  <div className="absolute right-0 top-10 z-50 w-48 rounded-xl border border-zinc-200 bg-white p-1.5 shadow-xl">
                    <button
                      type="button"
                      onClick={() => {
                        showToast(`Abrindo edição de ${product.name}`);
                        setOpenMenuId(null);
                      }}
                      className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-100 transition-colors"
                    >
                      <Pencil className="size-4 shrink-0 text-zinc-500" /> Editar
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        const newStatus = product.status === "Ativo" ? "Inativo" : "Ativo";
                        await onUpdateProduct(product.id, newStatus);
                        showToast(`Status de ${product.name} alterado no banco`);
                        setOpenMenuId(null);
                      }}
                      className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-100 transition-colors"
                    >
                      <Power className="size-4 shrink-0 text-zinc-500" /> Status
                    </button>
                    <div className="my-1 h-px bg-zinc-100" />
                    <button
                      type="button"
                      onClick={async () => {
                        await onDeleteProduct(product.id);
                        showToast(`Produto ${product.name} excluído do banco`);
                        setOpenMenuId(null);
                      }}
                      className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="size-4 shrink-0 text-red-500" /> Excluir
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="px-5 py-12 text-center">
              <Package className="mx-auto size-8 text-zinc-300" />
              <p className="mt-3 text-sm font-medium text-zinc-700">
                Nenhum produto cadastrado no banco de dados
              </p>
            </div>
          )}
        </div>
        <ListPagination
          page={page}
          totalItems={filtered.length}
          onPageChange={setPage}
          label="produtos"
        />
      </Card>

      {modal && (
        <div
          className="fixed inset-0 lg:left-[256px] z-[70] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
          onMouseDown={(e) => e.target === e.currentTarget && setModal(false)}
        >
          <Card className="max-h-[90vh] w-full max-w-lg overflow-y-auto shadow-2xl">
            <CardHeader className="flex-row items-start justify-between">
              <div>
                <CardTitle>Adicionar produto</CardTitle>
                <CardDescription>
                  Cadastre um novo item no PostgreSQL.
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
            <form onSubmit={addProduct}>
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
                    <FieldLabel>Preço (R$)</FieldLabel>
                    <Input
                      required
                      min="0"
                      step="0.01"
                      type="number"
                      name="price"
                      placeholder="129.90"
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
                      placeholder="10"
                    />
                  </div>
                </div>
                <div>
                  <FieldLabel>Status</FieldLabel>
                  <select
                    name="status"
                    className="h-11 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm outline-none"
                  >
                    <option value="Ativo">Ativo</option>
                    <option value="Inativo">Inativo</option>
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
                  <Button type="submit" disabled={loading}>
                    {loading ? "Salvando..." : "Adicionar produto"}
                  </Button>
                </div>
              </CardContent>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}

export function SchedulingViewWrapper({ view }: { view: View }) {
  const router = useRouter();
  const {
    currentUser,
    isBootstrapping,
    userList,
    clientList,
    productList,
    serviceList,
    appointmentList,
    showToast,
    initialEditUserId,
    setInitialEditUserId,
    handleAddUser,
    handleUpdateUser,
    handleDeleteUser,
    handleAddClient,
    handleUpdateClient,
    handleDeleteClient,
    handleAddProduct,
    handleUpdateProduct,
    handleDeleteProduct,
    handleAddService,
    handleUpdateService,
    handleDeleteService,
    handleAddAppointment,
    handleAppointmentStatusChange,
    handleDeleteAppointment,
    saleList,
    handleAddSale,
    handleUpdateSale,
    handleDeleteSale,
  } = useScheduling();

  useEffect(() => {
    if (!currentUser) return;
    const isFuncionario =
      currentUser.permissionLevel === 3 || currentUser.role === "Funcionario";
    if (view === "usuarios" && isFuncionario) {
      showToast("Acesso Negado: Apenas Administradores e Gestores têm acesso a /usuarios");
      router.push("/dashboard");
    }
  }, [view, currentUser, router, showToast]);

  if (isBootstrapping) {
    return (
      <div className="relative min-h-[calc(100vh-84px)]">
        <ViewLoadingSkeleton view={view} />
        <LoadingOverlayCard label="Carregando dados..." />
      </div>
    );
  }

  if (!currentUser) return null;

  if (view === "dashboard") {
    return (
      <Dashboard
        onNew={() => router.push("/agendamentos")}
        onVerAgenda={() => router.push("/agenda")}
        appointments={appointmentList}
        usersCount={userList.length}
        clientsCount={clientList.length}
        onStatusChange={handleAppointmentStatusChange}
        onDeleteAppointment={handleDeleteAppointment}
        showToast={showToast}
      />
    );
  }

  if (view === "agendamentos") {
    return (
      <Scheduling
        showToast={showToast}
        appointments={appointmentList}
        onAddAppointment={handleAddAppointment}
        clientList={clientList}
        serviceList={serviceList}
      />
    );
  }

  if (view === "agenda") {
    return (
      <AgendaView
        appointments={appointmentList}
        onStatusChange={handleAppointmentStatusChange}
        onDeleteAppointment={handleDeleteAppointment}
        onNew={() => router.push("/agendamentos")}
        showToast={showToast}
        currentUserRole={currentUser.role}
        currentUserName={currentUser.name}
        currentUserId={currentUser.id}
        userList={userList}
      />
    );
  }

  if (view === "clientes") {
    return (
      <Clients
        showToast={showToast}
        clientList={clientList}
        appointments={appointmentList}
        onAddClient={handleAddClient}
        onUpdateClient={handleUpdateClient}
        onDeleteClient={handleDeleteClient}
      />
    );
  }

  if (
    view === "usuarios" &&
    currentUser.permissionLevel !== 3 &&
    currentUser.role !== "Funcionario"
  ) {
    return (
      <Users
        showToast={showToast}
        userList={userList}
        onAddUser={handleAddUser}
        onUpdateUser={handleUpdateUser}
        onDeleteUser={handleDeleteUser}
        currentUserRole={currentUser.role}
        initialEditUserId={initialEditUserId}
        onClearInitialEditUserId={() => setInitialEditUserId(null)}
      />
    );
  }

  if (view === "produtos") {
    return (
      <Products
        showToast={showToast}
        productList={productList}
        onAddProduct={handleAddProduct}
        onUpdateProduct={handleUpdateProduct}
        onDeleteProduct={handleDeleteProduct}
      />
    );
  }

  if (view === "vendas") {
    return (
      <Sales
        showToast={showToast}
        saleList={saleList}
        productList={productList}
        onAddSale={handleAddSale}
        onUpdateSale={handleUpdateSale}
        onDeleteSale={handleDeleteSale}
      />
    );
  }

  if (view === "servicos") {
    return (
      <Services
        showToast={showToast}
        serviceList={serviceList}
        onAddService={handleAddService}
        onUpdateService={handleUpdateService}
        onDeleteService={handleDeleteService}
      />
    );
  }

  if (
    view === "relatorios" &&
    currentUser.permissionLevel !== 3 &&
    currentUser.role !== "Funcionario"
  ) {
    return <ReportsDashboard />;
  }

  if (
    view === "configuracoes" &&
    (currentUser.permissionLevel === 1 || currentUser.role === "Administrador")
  ) {
    return <SettingsView />;
  }

  return null;
}

export function LoginScreen({ onLogin }: { onLogin: () => void }) {
  return <Login onLogin={onLogin} />;
}

export function SchedulingApp({
  initialView = "dashboard",
}: {
  initialView?: View;
}) {
  return <SchedulingViewWrapper view={initialView} />;
}

