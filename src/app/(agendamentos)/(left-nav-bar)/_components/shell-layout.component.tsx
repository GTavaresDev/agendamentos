"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useScrollLock } from "@/lib/use-scroll-lock";
import {
  CalendarDays,
  ChartNoAxesCombined,
  Check,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Settings,
  Lock,
  ShoppingCart,
  Sparkles,
  UserCheck,
  UsersRound,
  X,
} from "lucide-react";
import { Avatar } from "@/app/(agendamentos)/(left-nav-bar)/_components/ui/avatar.component";
import { Button } from "@/app/(agendamentos)/(left-nav-bar)/_components/ui/button.component";
import { AgendamentosLogo } from "@/app/(agendamentos)/(left-nav-bar)/_components/ui/agendamentos-logo.component";
import { cn } from "@/lib/utils";
import { canAccessReports, canAccessUsers } from "@/lib/permissions";
import { useAppShell } from "@/app/(agendamentos)/(left-nav-bar)/_providers/use-app-shell";

export function ShellLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const {
    currentUser,
    mobileOpen,
    setMobileOpen,
    toast,
    handleStopImpersonation,
    handleLogout,
    setInitialEditUserId,
    pageHeader,
  } = useAppShell();

  const [impersonatingLoading, setImpersonatingLoading] = useState(false);

  useScrollLock(mobileOpen);

  const isAdmin =
    currentUser?.permissionLevel === 1 || currentUser?.role === "Administrador";

  const isFuncionario =
    currentUser?.permissionLevel === 3 || currentUser?.role === "Funcionario";

  const allNav = [
    {
      id: "dashboard",
      label: "Início",
      icon: LayoutDashboard,
      href: "/dashboard",
    },
    {
      id: "agenda",
      label: "Agenda",
      icon: CalendarDays,
      href: "/agenda",
    },
    {
      id: "servicos",
      label: "Serviços",
      icon: Sparkles,
      href: "/servicos",
    },
    {
      id: "clientes",
      label: "Clientes",
      icon: UserCheck,
      href: "/clientes",
    },
    {
      id: "usuarios",
      label: "Usuários",
      icon: UsersRound,
      href: "/usuarios",
      restricted: true,
    },
    {
      id: "vendas",
      label: "Vendas",
      icon: ShoppingCart,
      href: "/vendas",
    },
    {
      id: "produtos",
      label: "Produtos",
      icon: Package,
      href: "/produtos",
    },
    {
      id: "relatorios",
      label: "Relatórios",
      icon: ChartNoAxesCombined,
      href: "/relatorios",
      restricted: true,
    },
    {
      id: "configuracoes",
      label: "Configurações",
      icon: Settings,
      href: "/configuracoes",
      adminOnly: true,
    },
  ];

  const hasReportsPermission = canAccessReports(currentUser);
  const hasUsersPermission = canAccessUsers(currentUser);

  const nav = allNav.filter((item) => {
    if (item.adminOnly && !isAdmin) return false;
    if (item.id === "usuarios" && !hasUsersPermission) return false;
    if (item.id === "relatorios" && !hasReportsPermission) return false;
    return true;
  });

  async function onStopImpersonation() {
    setImpersonatingLoading(true);
    try {
      await handleStopImpersonation();
    } finally {
      setImpersonatingLoading(false);
    }
  }

  const firstName = currentUser?.name?.split(" ")[0] || "usuário";

  const getPageHeader = () => {
    if (pathname.includes("/agenda")) {
      return { title: "Agenda Completa", subtitle: "Acompanhe e gerencie todos os compromissos do dia." };
    }
    if (pathname.includes("/servicos")) {
      return { title: "Serviços", subtitle: "Gerencie os serviços cadastrados no banco de dados para agendamentos." };
    }
    if (pathname.includes("/clientes")) {
      return { title: "Clientes", subtitle: "Gerencie a base de clientes cadastrados." };
    }
    if (pathname.includes("/usuarios")) {
      return { title: "Usuários", subtitle: "Gerencie sua base de usuários e equipe." };
    }
    if (pathname.includes("/vendas")) {
      return { title: "Caixa (Vendas)", subtitle: "Registre vendas e gerencie o estoque em tempo real." };
    }
    if (pathname.includes("/produtos")) {
      return { title: "Produtos", subtitle: "Cadastre e gerencie os produtos do seu negócio." };
    }
    if (pathname.includes("/relatorios")) {
      return { title: "Relatórios", subtitle: "Dados consolidados para acompanhar a operação." };
    }
    if (pathname.includes("/configuracoes")) {
      return { title: "Configurações", subtitle: "Gerencie preferências e recursos do sistema." };
    }
    return {
      title: `Olá, ${firstName}!`,
      subtitle:
        "Visão Geral dos Agendamentos — Acompanhe o ritmo dos atendimentos e os indicadores principais do seu estabelecimento.",
    };
  };

  const { title, subtitle } = pathname.includes("/agenda") && pageHeader
    ? pageHeader
    : getPageHeader();

  function handleOpenSelfEdit() {
    if (!isFuncionario && currentUser) {
      setInitialEditUserId(currentUser.id);
      router.push("/usuarios");
    }
  }

  return (
    <div className="min-h-screen max-w-full overflow-x-hidden bg-[#f4f4f5] text-zinc-950">
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <button
          aria-label="Fechar menu"
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Persistent Sidebar */}
      {currentUser && (
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-50 flex w-[256px] flex-col border-r border-zinc-200 bg-white p-4 transition-transform duration-300 lg:translate-x-0",
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <div className="relative flex h-20 items-center justify-between px-3 border-b border-zinc-100">
            <Link href="/dashboard" aria-label="Ir para o início">
              <AgendamentosLogo variant="light" size="md" />
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setMobileOpen(false)}
            >
              <X />
            </Button>
          </div>
          <div className="mt-3 px-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-400">
            Menu principal
          </div>
          <nav className="mt-3 space-y-1">
            {nav.map(({ id, label, icon: Icon, href }) => {
              const isActive =
                pathname === href ||
                (href !== "/dashboard" && (pathname + "/").startsWith(href + "/"));
              return (
                <Link
                  key={id}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex h-11 w-full items-center gap-3 rounded-xl px-3 text-sm font-medium transition",
                    isActive
                      ? "bg-zinc-950 text-white shadow-sm"
                      : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950"
                  )}
                >
                  <span className="flex size-[18px] shrink-0 items-center justify-center">
                    <Icon className="size-[18px] stroke-[1.75]" />
                  </span>
                  <span className="text-[14px] font-medium leading-5">{label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto space-y-1 relative">
            {currentUser.impersonating && (
              <div className="mb-2 rounded-lg bg-amber-50 border border-amber-200 px-3 py-1.5 text-xs text-amber-900 flex items-center justify-between shadow-sm">
                <span className="font-medium truncate">Modo de visualização</span>
                <button
                  type="button"
                  disabled={impersonatingLoading}
                  onClick={(e) => {
                    e.stopPropagation();
                    onStopImpersonation();
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
              onClick={handleOpenSelfEdit}
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
      )}

      {/* Main Content Area */}
      <div className="min-w-0 max-w-full lg:pl-[256px]">
        {/* Topbar */}
        <header className="sticky top-0 z-30 flex min-h-[72px] sm:min-h-[84px] items-center gap-3 sm:gap-4 border-b border-zinc-200 bg-white/90 px-3.5 backdrop-blur sm:px-6 lg:px-8">
          <Button
            variant="outline"
            size="icon"
            className="lg:hidden shrink-0"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="size-5" />
          </Button>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-lg font-semibold tracking-[-0.02em] text-zinc-950 sm:text-2xl">
              {title}
            </h1>
            <p className="truncate text-xs text-zinc-500 sm:text-sm">
              {subtitle}
            </p>
          </div>
        </header>

        {/* Page Content */}
        <main className="min-w-0 max-w-full overflow-x-hidden">{children}</main>
      </div>

      {/* Toast Notification */}
      <div
        className={cn(
          "fixed bottom-5 right-5 z-[80] flex items-center gap-3 rounded-xl bg-zinc-950 px-4 py-3 text-sm font-medium text-white shadow-2xl transition-all duration-300",
          toast
            ? "translate-y-0 opacity-100"
            : "pointer-events-none translate-y-4 opacity-0"
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
