"use client";

import Image from "next/image";

export function ProductMockup() {
  return (
    <div id="produto" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-16">
      {/* Outer Browser Shell */}
      <div className="relative overflow-hidden rounded-2xl border border-zinc-200/90 bg-white p-2 sm:p-3 shadow-xl">
        {/* Top Browser Bar */}
        <div className="flex items-center justify-between border-b border-zinc-100 px-3 pb-2.5 pt-1 mb-2">
          <div className="flex items-center gap-1.5">
            <div className="size-2.5 sm:size-3 rounded-full bg-zinc-300" />
            <div className="size-2.5 sm:size-3 rounded-full bg-zinc-300" />
            <div className="size-2.5 sm:size-3 rounded-full bg-zinc-300" />
          </div>
          <div className="rounded-lg bg-zinc-100 px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs font-medium text-zinc-500">
            app.agendamentos.com.br/dashboard
          </div>
          <div className="w-10" />
        </div>

        {/* Dashboard Real Screenshot Image */}
        <div className="overflow-hidden rounded-xl bg-zinc-100">
          <Image
            src="/dashboard.jpeg"
            alt="Painel de Gestão Agendamentos"
            width={1600}
            height={959}
            className="w-full h-auto object-cover rounded-xl"
            priority
          />
        </div>
      </div>
    </div>
  );
}
