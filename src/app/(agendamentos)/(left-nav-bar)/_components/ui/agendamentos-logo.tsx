"use client";

import { CalendarDays } from "lucide-react";

interface LogoProps {
  className?: string;
  variant?: "dark" | "light";
  size?: "sm" | "md" | "lg";
}

export function AgendamentosLogo({
  className = "",
  variant = "light",
  size = "md",
}: LogoProps) {
  const isDark = variant === "dark";

  const iconContainerSize =
    size === "sm" ? "size-7" : size === "lg" ? "size-10" : "size-8";
  const iconSize =
    size === "sm" ? "size-4" : size === "lg" ? "size-5" : "size-4.5";
  const titleSize =
    size === "sm"
      ? "text-base font-bold"
      : size === "lg"
      ? "text-2xl font-bold"
      : "text-lg font-bold";
  const badgeSize =
    size === "sm"
      ? "text-[9px]"
      : size === "lg"
      ? "text-[10px]"
      : "text-[9.5px]";

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Icon Emblem */}
      <div
        className={`relative flex ${iconContainerSize} shrink-0 items-center justify-center rounded-xl shadow-sm transition-transform ${
          isDark
            ? "bg-gradient-to-br from-zinc-800 to-zinc-950 text-white ring-1 ring-white/20"
            : "bg-gradient-to-br from-zinc-900 to-zinc-950 text-white ring-1 ring-zinc-800"
        }`}
      >
        <CalendarDays className={`${iconSize} stroke-[2.2] text-white`} />
      </div>

      {/* Brand Typography */}
      <div className="flex flex-col">
        <span
          className={`leading-none tracking-tight ${titleSize} ${
            isDark ? "text-white" : "text-zinc-950"
          }`}
        >
          Agendamentos
        </span>
        <span
          className={`mt-1 font-semibold leading-none uppercase tracking-[0.14em] ${badgeSize} ${
            isDark ? "text-zinc-400" : "text-zinc-500"
          }`}
        >
          Gestão & Agenda
        </span>
      </div>
    </div>
  );
}
