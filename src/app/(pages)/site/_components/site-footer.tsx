"use client";

import Link from "next/link";
import { ArrowRight, CalendarDays } from "lucide-react";

export function SiteCtaBanner() {
  return (
    <section className="py-20 bg-zinc-50">
      <div className="mx-auto max-w-5xl px-6 text-center lg:px-8">
        <div className="rounded-2xl border border-zinc-200 bg-white p-10 sm:p-12 shadow-xs">
          <h2 className="text-2xl font-bold tracking-tight text-zinc-950 sm:text-3xl">
            Pronto para começar?
          </h2>
          <p className="mt-2 text-sm text-zinc-600">
            Veja o painel completo de agendamentos e vendas — ou entre pelo portal e
            marque seu horário como cliente.
          </p>
          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/login"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-zinc-950 px-7 text-xs font-semibold text-white shadow-xs transition hover:bg-zinc-800"
            >
              Acessar Painel do Agendamentos <ArrowRight className="size-4" />
            </Link>
            <Link
              href="/cliente"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-7 text-xs font-semibold text-zinc-900 transition hover:bg-zinc-50"
            >
              Sou cliente, quero agendar
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-zinc-200 bg-white px-6 py-10 text-xs text-zinc-500">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 sm:flex-row">
        <div className="flex items-center gap-3">
          <div className="flex size-7 items-center justify-center rounded-lg bg-zinc-950 text-white">
            <CalendarDays className="size-4" />
          </div>
          <span className="font-semibold text-zinc-900">Agendamentos</span>
          <span>· Sistema de Gestão Operacional & Financeira</span>
        </div>

        <div className="flex gap-6 font-medium">
          <Link href="/site" className="hover:text-zinc-950">Site Oficial</Link>
          <Link href="/links" className="hover:text-zinc-950">Central de Links</Link>
          <Link href="/cliente" className="hover:text-zinc-950">Portal do Cliente</Link>
          <Link href="/login" className="hover:text-zinc-950">Login da Equipe</Link>
        </div>
      </div>
    </footer>
  );
}
