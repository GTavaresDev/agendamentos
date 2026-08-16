"use client";

import Image from "next/image";
import { FadeIn } from "@/components/ui/animation/fade-in.component";
import { TiltCard } from "@/components/ui/animation/tilt-card.component";

export function ProductMockup() {
  return (
    <div id="produto" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-16">
      <FadeIn variant="blur" duration={0.7} delay={0.2}>
        <TiltCard maxTilt={5}>
          {/* Outer Browser Shell */}
          <div className="group relative overflow-hidden rounded-2xl border border-zinc-200/90 bg-white p-2 sm:p-3 shadow-xl transition-shadow duration-500 hover:shadow-2xl">
            {/* Top Browser Bar */}
            <div className="flex items-center justify-between border-b border-zinc-100 px-3 pb-2.5 pt-1 mb-2">
              <div className="flex items-center gap-1.5">
                <div className="size-2.5 sm:size-3 rounded-full bg-red-400/80" />
                <div className="size-2.5 sm:size-3 rounded-full bg-amber-400/80" />
                <div className="size-2.5 sm:size-3 rounded-full bg-emerald-400/80" />
              </div>
              <div className="rounded-lg bg-zinc-100 px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs font-medium text-zinc-500 transition-colors group-hover:text-zinc-900">
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
                className="w-full h-auto object-cover rounded-xl transition-transform duration-700 ease-out group-hover:scale-[1.01]"
                priority
              />
            </div>
          </div>
        </TiltCard>
      </FadeIn>
    </div>
  );
}

