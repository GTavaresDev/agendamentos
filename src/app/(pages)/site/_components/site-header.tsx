"use client";

import { useState } from "react";
import Link from "next/link";
import { CalendarDays, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function SiteHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.21, 0.47, 0.32, 0.98] }}
      className="sticky top-0 z-50 border-b border-zinc-200/80 bg-white/90 backdrop-blur-md transition-shadow"
    >
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">
        <Link href="/site" className="group flex items-center gap-3">
          <motion.div
            whileHover={{ scale: 1.05, rotate: 2 }}
            whileTap={{ scale: 0.95 }}
            className="flex size-10 items-center justify-center rounded-xl bg-zinc-950 text-white shadow-xs"
          >
            <CalendarDays className="size-5 stroke-[2.2]" />
          </motion.div>
          <div className="flex flex-col">
            <span className="text-lg font-bold leading-none tracking-tight text-zinc-950 transition-colors group-hover:text-zinc-700">
              Agendamentos
            </span>
            <span className="mt-1 text-[9.5px] font-semibold leading-none uppercase tracking-[0.14em] text-zinc-500">
              Gestão & Agenda
            </span>
          </div>
        </Link>

        <nav className="hidden items-center gap-9 text-sm font-medium text-zinc-600 md:flex">
          {[
            { href: "#produto", label: "O Sistema" },
            { href: "#recursos", label: "Recursos" },
            { href: "#portal-do-cliente", label: "Portal do Cliente" },
            { href: "#faq", label: "Dúvidas" },
          ].map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="relative py-1 transition-colors hover:text-zinc-950 group"
            >
              {item.label}
              <span className="absolute inset-x-0 bottom-0 h-0.5 scale-x-0 bg-zinc-950 transition-transform duration-200 group-hover:scale-x-100" />
            </a>
          ))}
          <Link
            href="/links"
            className="relative py-1 transition-colors hover:text-zinc-950 group"
          >
            Central de Links
            <span className="absolute inset-x-0 bottom-0 h-0.5 scale-x-0 bg-zinc-950 transition-transform duration-200 group-hover:scale-x-100" />
          </Link>
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Link
              href="/cliente"
              className="inline-flex h-11 items-center justify-center rounded-xl border border-zinc-200 bg-white px-5 text-sm font-semibold text-zinc-900 transition hover:bg-zinc-50 shadow-xs"
            >
              Sou Cliente
            </Link>
          </motion.div>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Link
              href="/login"
              className="inline-flex h-11 items-center justify-center rounded-xl bg-zinc-950 px-6 text-sm font-semibold text-white shadow-xs transition hover:bg-zinc-800"
            >
              Acessar Sistema
            </Link>
          </motion.div>
        </div>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="flex size-10 items-center justify-center rounded-xl border border-zinc-200 text-zinc-700 md:hidden transition active:scale-95"
          aria-label="Menu"
        >
          {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden border-b border-zinc-200 bg-white p-6 shadow-xl md:hidden"
          >
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
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}

