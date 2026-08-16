"use client";

import { LinksHeader } from "./_components/links-header.component";
import { LinksList } from "./_components/links-list.component";

export default function ClinicLinksPage() {
  return (
    <main className="relative min-h-screen bg-[#f4f4f5] px-4 py-10 sm:py-16 text-zinc-950 selection:bg-zinc-900 selection:text-white">
      <div className="relative mx-auto flex w-full max-w-[440px] flex-col items-center gap-8 sm:gap-10">
        <LinksHeader />
        <LinksList />

        {/* Footer info */}
        <p className="pt-2 text-center text-[9.5px] uppercase tracking-[0.2em] text-zinc-400 font-medium">
          Agendamentos · Sistema de Gestão Operacional & Financeira
        </p>
      </div>
    </main>
  );
}
