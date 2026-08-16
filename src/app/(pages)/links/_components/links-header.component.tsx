"use client";

import { CalendarDays } from "lucide-react";

export function LinksHeader() {
  return (
    <div className="flex flex-col items-center text-center">
      {/* Brand Icon */}
      <div className="flex size-14 items-center justify-center rounded-2xl bg-zinc-950 text-white shadow-xs sm:size-16">
        <CalendarDays className="size-7 stroke-[2.2]" />
      </div>

      <div className="mt-4">
        <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-500">
          Sistema Integrado de Gestão
        </span>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-zinc-950 sm:text-3xl">
          Agendamentos
        </h1>
        <p className="mt-1 text-xs leading-relaxed text-zinc-500 max-w-xs sm:max-w-sm">
          Gestão operacional, recepção, vendas de balcão & DRE em tempo real
        </p>
      </div>
    </div>
  );
}
