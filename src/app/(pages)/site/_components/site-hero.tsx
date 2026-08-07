"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function SiteHero() {
  return (
    <section className="bg-white pt-20 pb-16 lg:pt-28 lg:pb-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 px-4 py-1.5 text-xs font-medium text-zinc-700">
            <span className="size-1.5 rounded-full bg-zinc-950" />
            Plataforma Integrada de Gestão & Agendamentos
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight text-zinc-950 sm:text-6xl lg:text-6xl leading-[1.1]">
            Sua clínica organizada,<br />
            do atendimento à gestão.
          </h1>

          <p className="mt-6 text-base leading-relaxed text-zinc-600 sm:text-lg">
            Centralize agendamentos, clientes, serviços, produtos, checkout de vendas e relatórios de faturamento em uma única plataforma simples, segura e eficiente.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/login"
              className="flex h-13 w-full items-center justify-center gap-2 rounded-xl bg-zinc-950 px-8 text-sm font-semibold text-white shadow-xs transition hover:bg-zinc-800 sm:w-auto"
            >
              Acessar Sistema <ArrowRight className="size-4" />
            </Link>
            <a
              href="#recursos"
              className="flex h-13 w-full items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-8 text-sm font-semibold text-zinc-900 transition hover:bg-zinc-50 sm:w-auto"
            >
              Conhecer Recursos
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
