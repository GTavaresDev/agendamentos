"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarPlus, House, ListChecks } from "lucide-react";
import { cn } from "@/lib/utils";

const ITEMS = [
  { href: "/cliente/painel", label: "Início", icon: House },
  { href: "/cliente/painel/agendar", label: "Agendar", icon: CalendarPlus },
  { href: "/cliente/painel/meus-agendamentos", label: "Meus agendamentos", icon: ListChecks },
];

export function PortalNav({
  className,
  variant = "inline",
}: {
  className?: string;
  variant?: "inline" | "bar" | "sidebar";
}) {
  const pathname = usePathname();

  return (
    <nav className={cn(variant === "sidebar" ? "flex flex-col gap-1" : "items-center gap-1", className)} aria-label="Navegação do portal">
      {ITEMS.map(({ href, label, icon: Icon }) => {
        const isActive =
          pathname === href || (href !== "/cliente/painel" && pathname.startsWith(`${href}/`));

        if (variant === "sidebar") {
          return (
            <Link
              key={href}
              href={href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex h-11 w-full items-center gap-3 rounded-xl px-3 text-[14px] font-medium transition",
                isActive
                  ? "bg-zinc-950 text-white shadow-sm"
                  : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950",
              )}
            >
              <Icon className="size-[18px] shrink-0 stroke-[1.75]" />
              <span>{label}</span>
            </Link>
          );
        }

        if (variant === "bar") {
          return (
            <Link
              key={href}
              href={href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex flex-col items-center gap-1 rounded-lg py-1.5 text-[11px] font-medium transition",
                isActive ? "text-zinc-950" : "text-zinc-500",
              )}
            >
              <Icon className={cn("size-5", isActive && "stroke-[2.2]")} />
              {label === "Meus agendamentos" ? "Agendamentos" : label}
            </Link>
          );
        }

        return (
          <Link
            key={href}
            href={href}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "rounded-xl px-4 py-2 text-sm font-medium transition-all",
              isActive
                ? "bg-zinc-950 text-white shadow-sm"
                : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950",
            )}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
