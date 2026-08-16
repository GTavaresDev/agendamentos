"use client";

import Link from "next/link";
import { ArrowUpRight, CalendarDays, Globe2, MessageCircle } from "lucide-react";

const links = [
  {
    title: "Acessar Sistema (Login)",
    description: "Painel de gestão, agenda por profissional, caixa e DRE",
    href: "/login",
    icon: CalendarDays,
    highlight: true,
  },
  {
    title: "Conhecer a Plataforma (Site)",
    description: "Recursos completos, fluxo de atendimento e produto real",
    href: "/site",
    icon: Globe2,
  },
  {
    title: "Atendimento no WhatsApp",
    description: "Fale diretamente com nossa equipe de suporte",
    href: "https://wa.me/5511998765432?text=Ol%C3%A1%2C%20gostaria%20de%20saber%20mais%20sobre%20o%20Agendamentos!",
    icon: MessageCircle,
    external: true,
  },
];

export function LinksList() {
  return (
    <div className="flex w-full flex-col gap-4 sm:gap-5">
      {links.map(({ title, description, href, icon: Icon, external, highlight }) => {
        const CardContent = (
          <div
            className={`group flex items-center gap-3.5 rounded-xl border p-4 transition-all hover:-translate-y-0.5 sm:gap-4 sm:p-4.5 ${
              highlight
                ? "border-zinc-950 bg-zinc-950 text-white shadow-xs"
                : "border-zinc-200/90 bg-white text-zinc-950 shadow-xs hover:border-zinc-300 hover:bg-zinc-50"
            }`}
          >
            <span
              className={`flex size-10 shrink-0 items-center justify-center rounded-lg sm:size-11 ${
                highlight
                  ? "bg-white text-zinc-950"
                  : "bg-zinc-100 text-zinc-900 group-hover:bg-zinc-950 group-hover:text-white"
              } transition-colors`}
            >
              <Icon className="size-4.5 stroke-[2]" />
            </span>

            <span className="min-w-0 flex-1">
              <strong
                className={`block text-xs font-bold sm:text-sm ${
                  highlight ? "text-white" : "text-zinc-950"
                }`}
              >
                {title}
              </strong>
              <span
                className={`mt-0.5 block truncate text-[11px] sm:text-xs ${
                  highlight ? "text-zinc-300" : "text-zinc-500"
                }`}
              >
                {description}
              </span>
            </span>

            <span
              className={`flex size-7 shrink-0 items-center justify-center rounded-full transition ${
                highlight
                  ? "text-zinc-300 group-hover:text-white"
                  : "text-zinc-400 group-hover:bg-zinc-100 group-hover:text-zinc-950"
              }`}
            >
              <ArrowUpRight className="size-4" />
            </span>
          </div>
        );

        return external ? (
          <a key={title} href={href} target="_blank" rel="noreferrer" className="block w-full">
            {CardContent}
          </a>
        ) : (
          <Link key={title} href={href} className="block w-full">
            {CardContent}
          </Link>
        );
      })}
    </div>
  );
}
