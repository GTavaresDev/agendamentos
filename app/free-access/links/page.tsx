import type { Metadata } from "next";
import { ArrowUpRight, CalendarDays, Globe2, Instagram, MapPin, MessageCircle, Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "Links — Lumière Clínica",
  description: "Agendamento, WhatsApp, localização e site oficial da Lumière Clínica.",
};

const links = [
  { title: "Agende seu horário", description: "Escolha o melhor dia para cuidar de você", href: "/?view=agendamentos", icon: CalendarDays },
  { title: "Fale pelo WhatsApp", description: "Tire dúvidas com a nossa equipe", href: "https://wa.me/5511998765432?text=Olá%2C%20vim%20pelo%20link%20da%20Lumière", icon: MessageCircle, external: true },
  { title: "Como chegar", description: "Rua das Magnólias, 248 — Jardins", href: "https://maps.google.com/?q=Rua+das+Magnolias+248+Jardins+Sao+Paulo", icon: MapPin, external: true },
  { title: "Conheça a Lumière", description: "Veja tratamentos, avaliações e nossa história", href: "/free-access", icon: Globe2 },
];

export default function ClinicLinksPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f4f4f5] px-5 py-12 text-zinc-950 sm:py-16">
      <div className="pointer-events-none absolute -left-24 top-24 size-80 rounded-full bg-white/80 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-10 size-96 rounded-full bg-zinc-200/50 blur-3xl" />
      <div className="relative mx-auto flex w-full max-w-[680px] flex-col items-center">
        <div className="relative">
          <div className="size-32 overflow-hidden rounded-full border-[5px] border-white bg-zinc-200 shadow-[0_18px_45px_rgba(0,0,0,.14)] sm:size-36">
            <img src="/free-access/clinica-perfil.jpg" alt="Lumière Clínica de Estética" className="h-full w-full object-cover object-[center_38%]" />
          </div>
          <span className="absolute -bottom-1 -right-2 flex size-11 items-center justify-center rounded-full border-4 border-[#f4f4f5] bg-zinc-950 text-white"><Sparkles className="size-4" /></span>
        </div>

        <div className="mt-8 text-center">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-500">Clínica de estética</p>
          <h1 className="mt-2 font-serif text-5xl font-medium tracking-[-0.04em] sm:text-6xl">Lumière</h1>
          <p className="mt-2 text-sm text-zinc-500 sm:text-base">Estética, ciência e naturalidade</p>
          <div className="mx-auto mt-6 h-px w-20 bg-zinc-300" />
        </div>

        <div className="mt-10 w-full space-y-3.5 sm:mt-12">
          {links.map(({ title, description, href, icon: Icon, external }) => (
            <a
              key={title}
              href={href}
              target={external ? "_blank" : undefined}
              rel={external ? "noreferrer" : undefined}
              className="group flex min-h-[92px] items-center gap-4 rounded-2xl border border-zinc-200 bg-white p-4 shadow-[0_6px_20px_rgba(0,0,0,.06)] transition-all hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-[0_14px_34px_rgba(0,0,0,.10)] sm:gap-5 sm:p-5"
            >
              <span className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-zinc-950 text-white sm:size-16"><Icon className="size-6" /></span>
              <span className="min-w-0 flex-1"><strong className="block font-serif text-xl sm:text-2xl">{title}</strong><span className="mt-1 block truncate text-xs text-zinc-500 sm:text-sm">{description}</span></span>
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full text-zinc-500 transition group-hover:bg-zinc-950 group-hover:text-white"><ArrowUpRight className="size-5" /></span>
            </a>
          ))}
        </div>

        <div className="mt-9 flex items-center gap-3">
          <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram" className="flex size-10 items-center justify-center rounded-full border border-zinc-300 bg-white text-zinc-600 transition hover:border-zinc-950 hover:bg-zinc-950 hover:text-white"><Instagram className="size-4" /></a>
          <span className="text-xs text-zinc-500">@lumiereclinica</span>
        </div>
        <p className="mt-10 text-center text-[10px] uppercase tracking-[0.15em] text-zinc-400">Lumière Clínica · MVP demonstrativo</p>
      </div>
    </main>
  );
}
