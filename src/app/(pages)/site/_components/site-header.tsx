"use client";

import { useState } from "react";
import Link from "next/link";
import { CalendarDays, Menu, X } from "lucide-react";

export function SiteHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">
        <Link href="/site" className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-zinc-950 text-white shadow-xs">
            <CalendarDays className="size-5 stroke-[2.2]" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold leading-none tracking-tight text-zinc-950">
              Agendamentos
            </span>
            <span className="mt-1 text-[9.5px] font-semibold leading-none uppercase tracking-[0.14em] text-zinc-500">
              Gestão & Agenda
            </span>
          </div>
        </Link>

        <nav className="hidden items-center gap-9 text-sm font-medium text-zinc-600 md:flex">
          <a href="#produto" className="transition hover:text-zinc-950">O Sistema</a>
          <a href="#recursos" className="transition hover:text-zinc-950">Recursos</a>
          <a href="#portal-do-cliente" className="transition hover:text-zinc-950">Portal do Cliente</a>
          <a href="#faq" className="transition hover:text-zinc-950">Dúvidas</a>
          <Link href="/links" className="transition hover:text-zinc-950">Central de Links</Link>
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/cliente"
            className="inline-flex h-11 items-center justify-center rounded-xl border border-zinc-200 bg-white px-5 text-sm font-semibold text-zinc-900 transition hover:bg-zinc-50 active:scale-[0.98]"
          >
            Sou Cliente
          </Link>
          <Link
            href="/login"
            className="inline-flex h-11 items-center justify-center rounded-xl bg-zinc-950 px-6 text-sm font-semibold text-white shadow-xs transition hover:bg-zinc-800 active:scale-[0.98]"
          >
            Acessar Sistema
          </Link>
        </div>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="flex size-10 items-center justify-center rounded-xl border border-zinc-200 text-zinc-700 md:hidden"
          aria-label="Menu"
        >
          {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="fixed inset-x-0 top-20 z-40 border-b border-zinc-200 bg-white p-6 shadow-xl md:hidden">
          <nav className="flex flex-col gap-4 text-base font-medium text-zinc-800">
            <a href="#produto" onClick={() => setMobileMenuOpen(false)}>O Sistema</a>
            <a href="#recursos" onClick={() => setMobileMenuOpen(false)}>Recursos</a>
            <a href="#portal-do-cliente" onClick={() => setMobileMenuOpen(false)}>Portal do Cliente</a>
            <a href="#faq" onClick={() => setMobileMenuOpen(false)}>Dúvidas</a>
            <Link href="/links" onClick={() => setMobileMenuOpen(false)}>Central de Links</Link>
            <Link
              href="/cliente"
              onClick={() => setMobileMenuOpen(false)}
              className="mt-2 flex h-12 items-center justify-center rounded-xl border border-zinc-200 bg-white text-sm font-semibold text-zinc-900"
            >
              Sou Cliente
            </Link>
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="flex h-12 items-center justify-center rounded-xl bg-zinc-950 text-sm font-semibold text-white"
            >
              Acessar Sistema
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
