"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { FadeIn } from "@/components/ui/animation/fade-in";

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
    question: "O cliente consegue marcar o próprio horário?",
    answer: "Sim. Cada cliente tem sua própria área em /cliente, com login por e-mail e senha ou pela conta Google. Lá ele escolhe o serviço, o profissional, a data e um horário livre, e acompanha ou cancela os atendimentos futuros. O agendamento entra na sua grade como Pendente, aguardando a confirmação da clínica.",
  },
  {
    question: "Se eu marcar pelo painel, o cliente vê no portal dele?",
    answer: "Vê, na hora. Ao criar o agendamento na recepção você seleciona o cliente na lista, e aquele atendimento passa a aparecer em 'Meus agendamentos' do portal daquela pessoa — com serviço, data, horário e profissional. Não são dois sistemas sincronizando: painel e portal leem o mesmo cadastro e a mesma agenda. Atendimentos criados sem vincular a um cliente cadastrado ficam apenas na agenda interna.",
  },
  {
    question: "O cliente enxerga preços ou dados internos da clínica?",
    answer: "Não. O que chega ao portal é apenas nome, descrição e duração dos serviços — os valores não saem do servidor. O cliente também não alcança dashboard, relatórios, DRE, vendas, estoque, equipe ou dados de outros clientes: o portal tem sessão própria, separada da sessão da equipe, e nenhum login de cliente concede acesso ao sistema interno.",
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
        <FadeIn variant="up">
          <div className="text-center">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Perguntas Frequentes</span>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-zinc-950">
              Dúvidas sobre o sistema
            </h2>
          </div>
        </FadeIn>

        <FadeIn variant="up" delay={0.15}>
          <div className="mt-12 divide-y divide-zinc-200 rounded-2xl border border-zinc-200 bg-white p-6 sm:p-8 shadow-xs">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div key={idx} className="py-5 first:pt-0 last:pb-0">
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="flex w-full items-center justify-between text-left font-semibold text-zinc-900 transition hover:text-zinc-600 focus-visible:outline-none"
                  >
                    <span className="text-base sm:text-lg">{faq.question}</span>
                    <motion.div
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={{ duration: 0.25, ease: "easeInOut" }}
                    >
                      <ChevronDown
                        className={cn("size-5 shrink-0 transition-colors", isOpen ? "text-zinc-950" : "text-zinc-400")}
                      />
                    </motion.div>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3, ease: [0.21, 0.47, 0.32, 0.98] }}
                        className="overflow-hidden"
                      >
                        <p className="mt-3 text-sm leading-relaxed text-zinc-600 pt-1">
                          {faq.answer}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

