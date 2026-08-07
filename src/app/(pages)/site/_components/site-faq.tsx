"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const faqs = [
  {
    question: "O que vem incluído no ambiente de demonstração?",
    answer: "O sistema vem pré-carregado com 3 meses de histórico operacional fictício porém realista: 50 clientes cadastrados, mais de 250 agendamentos com horários reais, 260+ vendas de produtos registradas (Pix/Cartão/Dinheiro) e catálogo completo com serviços e produtos.",
  },
  {
    question: "Como funcionam os perfis de acesso?",
    answer: "O Agendamentos possui perfis granulares: Administradores gerenciam configurações e DRE; Gestores acompanham relatórios operacionais; Profissionais visualizam sua agenda de atendimentos; e a Recepção realiza agendamentos, cadastros e vendas de balcão.",
  },
  {
    question: "Como funciona a venda cruzada no checkout?",
    answer: "Após a conclusão do atendimento na recepção, o operador pode adicionar produtos de manutenção pós-procedimento (como séruns e protetores) ao caixa, realizando a baixa automática em estoque e incluindo o valor no faturamento.",
  },
  {
    question: "Como funciona a proteção contra alterações de horários passados?",
    answer: "Administradores podem ativar a trava de bloqueio retroativo, impedindo que consultas antigas sejam editadas ou remarcadas sem autorização, preservando a integridade do histórico financeiro.",
  },
];

export function SiteFaq() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <section id="faq" className="py-20 lg:py-28 bg-white border-b border-zinc-200">
      <div className="mx-auto max-w-4xl px-6 lg:px-8">
        <div className="text-center">
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Perguntas Frequentes</span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-zinc-950">
            Dúvidas sobre o sistema
          </h2>
        </div>

        <div className="mt-12 divide-y divide-zinc-200 rounded-2xl border border-zinc-200 bg-white p-6 sm:p-8 shadow-xs">
          {faqs.map((faq, idx) => (
            <div key={idx} className="py-5 first:pt-0 last:pb-0">
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="flex w-full items-center justify-between text-left font-semibold text-zinc-900 transition hover:text-zinc-600"
              >
                <span className="text-base sm:text-lg">{faq.question}</span>
                <ChevronDown
                  className={cn("size-5 shrink-0 text-zinc-400 transition-transform duration-200", openFaq === idx && "rotate-180 text-zinc-950")}
                />
              </button>
              {openFaq === idx && (
                <p className="mt-3 text-sm leading-relaxed text-zinc-600">
                  {faq.answer}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
