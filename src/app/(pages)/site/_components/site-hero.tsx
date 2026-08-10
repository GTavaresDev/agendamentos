"use client";

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { FadeIn } from "@/components/ui/animation/fade-in";
import { StaggerContainer, StaggerItem } from "@/components/ui/animation/stagger-container";

export function SiteHero() {
  return (
    <section className="relative overflow-hidden bg-white pt-20 pb-16 lg:pt-28 lg:pb-20">
      {/* Background ambient subtle gradient blur */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 left-1/2 -z-10 h-[400px] w-[800px] -translate-x-1/2 rounded-full bg-gradient-to-tr from-zinc-100 via-zinc-50 to-transparent blur-3xl opacity-70"
      />

      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <StaggerContainer staggerChildren={0.12} className="mx-auto max-w-3xl text-center">
          {/* Badge */}
          <StaggerItem variant="up" className="inline-block">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50/80 px-4 py-1.5 text-xs font-medium text-zinc-700 shadow-xs backdrop-blur-xs">
              <span className="relative flex size-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-zinc-900 opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-zinc-950" />
              </span>
              Plataforma Integrada de Gestão & Agendamentos
            </div>
          </StaggerItem>

          {/* Heading */}
          <StaggerItem variant="up">
            <h1 className="text-4xl font-extrabold tracking-tight text-zinc-950 sm:text-6xl lg:text-6xl leading-[1.1]">
              Sua clínica organizada,<br />
              do atendimento à gestão.
            </h1>
          </StaggerItem>

          {/* Subtitle */}
          <StaggerItem variant="up">
            <p className="mt-6 text-base leading-relaxed text-zinc-600 sm:text-lg">
              Centralize agendamentos, clientes, serviços, produtos, checkout de vendas e relatórios de faturamento em uma única plataforma simples, segura e eficiente.
            </p>
          </StaggerItem>

          {/* CTA Buttons */}
          <StaggerItem variant="up">
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="w-full sm:w-auto">
                <Link
                  href="/login"
                  className="flex h-13 w-full items-center justify-center gap-2 rounded-xl bg-zinc-950 px-8 text-sm font-semibold text-white shadow-xs transition hover:bg-zinc-800"
                >
                  Acessar Sistema <ArrowRight className="size-4" />
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full sm:w-auto">
                <a
                  href="#recursos"
                  className="flex h-13 w-full items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-8 text-sm font-semibold text-zinc-900 transition hover:bg-zinc-50"
                >
                  Conhecer Recursos
                </a>
              </motion.div>
            </div>
          </StaggerItem>
        </StaggerContainer>
      </div>
    </section>
  );
}

