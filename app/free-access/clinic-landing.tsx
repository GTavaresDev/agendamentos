"use client";

import { useState } from "react";
import {
  ArrowRight,
  Award,
  CalendarDays,
  Check,
  ChevronDown,
  Clock3,
  Heart,
  Instagram,
  MapPin,
  Menu,
  MessageCircle,
  Phone,
  ShieldCheck,
  Sparkles,
  Star,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const bookingLink = "/?view=agendamentos";

const treatments = [
  { number: "01", name: "Limpeza de pele premium", description: "Renovação profunda, hidratação e viço com protocolo personalizado para sua pele.", duration: "60 min", price: "A partir de R$ 189" },
  { number: "02", name: "Bioestimulador de colágeno", description: "Estímulo gradual da firmeza e sustentação, preservando a naturalidade dos traços.", duration: "50 min", price: "Sob avaliação" },
  { number: "03", name: "Toxina botulínica", description: "Suavização de linhas de expressão com resultado leve, elegante e individualizado.", duration: "40 min", price: "Sob avaliação" },
  { number: "04", name: "Preenchimento facial", description: "Harmonização sutil de contornos, volume e proporções com planejamento cuidadoso.", duration: "60 min", price: "Sob avaliação" },
  { number: "05", name: "Peeling personalizado", description: "Tratamento de manchas, textura e luminosidade conforme as necessidades da pele.", duration: "45 min", price: "A partir de R$ 239" },
  { number: "06", name: "Drenagem linfática", description: "Técnica manual para reduzir inchaço, melhorar a circulação e trazer leveza ao corpo.", duration: "50 min", price: "A partir de R$ 149" },
];

const reviews = [
  { name: "Mariana Lopes", initials: "ML", text: "A clínica é linda e o atendimento foi impecável. Me explicaram cada etapa e o resultado ficou muito natural, exatamente como eu queria.", date: "há 2 semanas" },
  { name: "Camila Ribeiro", initials: "CR", text: "Foi a primeira vez que fiz um procedimento estético e me senti muito segura. A equipe é cuidadosa, pontual e extremamente atenciosa.", date: "há 1 mês" },
  { name: "Juliana Martins", initials: "JM", text: "Minha pele mudou completamente depois do protocolo. Ambiente acolhedor, profissionais excelentes e acompanhamento de verdade.", date: "há 1 mês" },
];

const faqs = [
  { question: "Como funciona a primeira avaliação?", answer: "A primeira avaliação dura cerca de 40 minutos. Conversamos sobre seus objetivos, histórico e rotina, analisamos suas necessidades e montamos um plano de tratamento individualizado. Você não precisa realizar nenhum procedimento no mesmo dia." },
  { question: "Os procedimentos são seguros?", answer: "Sim. Trabalhamos apenas com profissionais habilitados, produtos regularizados e protocolos baseados em boas práticas. Antes de qualquer procedimento, explicamos indicações, contraindicações e cuidados necessários." },
  { question: "Em quanto tempo vejo os resultados?", answer: "O prazo varia conforme o tratamento. Alguns resultados aparecem imediatamente; outros evoluem gradualmente ao longo de semanas. Na avaliação, você recebe uma expectativa realista para o seu caso." },
  { question: "Quais formas de pagamento são aceitas?", answer: "Aceitamos Pix, cartões de débito e crédito. Alguns protocolos podem ser parcelados. As condições completas são apresentadas antes da confirmação do tratamento." },
  { question: "Posso remarcar meu horário?", answer: "Sim. Pedimos que alterações sejam feitas com pelo menos 24 horas de antecedência para disponibilizarmos o horário a outra pessoa." },
];

function Stars({ className }: { className?: string }) {
  return <div className={cn("flex gap-0.5 text-[#c89365]", className)}>{Array.from({ length: 5 }).map((_, index) => <Star key={index} className="size-4 fill-current" />)}</div>;
}

function BookingButton({ light = false, className }: { light?: boolean; className?: string }) {
  return (
    <a href={bookingLink} className={cn("inline-flex h-12 items-center justify-center gap-2 rounded-full px-6 text-sm font-semibold transition-all hover:-translate-y-0.5", light ? "bg-white text-zinc-950 hover:bg-[#f7f2ec]" : "bg-zinc-950 text-white hover:bg-[#352f2b]", className)}>
      Agendar avaliação <ArrowRight className="size-4" />
    </a>
  );
}

export function ClinicLanding() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#fcfaf7] font-sans text-[#25211e]">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-black/[0.06] bg-[#fcfaf7]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-[76px] max-w-[1440px] items-center justify-between px-5 sm:px-8 lg:px-12">
          <a href="#inicio" className="flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-full border border-[#c9ad93] text-[#9a7454]"><Sparkles className="size-4" /></span>
            <span className="font-serif text-2xl tracking-[-0.03em]">VisioNew</span>
            <span className="hidden border-l border-zinc-300 pl-3 text-[9px] font-semibold uppercase leading-3 tracking-[0.18em] text-zinc-400 sm:block">Clínica<br />Estética</span>
          </a>
          <nav className="hidden items-center gap-8 text-sm font-medium text-zinc-600 lg:flex">
            <a className="hover:text-zinc-950" href="#sobre">A clínica</a>
            <a className="hover:text-zinc-950" href="#tratamentos">Tratamentos</a>
            <a className="hover:text-zinc-950" href="#avaliacoes">Avaliações</a>
            <a className="hover:text-zinc-950" href="#faq">Dúvidas</a>
            <a className="hover:text-zinc-950" href="#contato">Contato</a>
          </nav>
          <div className="hidden lg:block"><BookingButton className="h-10 px-5" /></div>
          <button aria-label="Abrir menu" onClick={() => setMenuOpen(true)} className="flex size-10 items-center justify-center rounded-full border border-zinc-200 lg:hidden"><Menu className="size-5" /></button>
        </div>
      </header>

      {menuOpen && (
        <div className="fixed inset-0 z-[60] bg-[#25211e] p-6 text-white lg:hidden">
          <div className="flex items-center justify-between"><span className="font-serif text-2xl">VisioNew</span><button aria-label="Fechar menu" onClick={() => setMenuOpen(false)} className="flex size-10 items-center justify-center rounded-full border border-white/20"><X /></button></div>
          <nav className="mt-20 flex flex-col gap-7 font-serif text-4xl">
            {[['sobre','A clínica'],['tratamentos','Tratamentos'],['avaliacoes','Avaliações'],['faq','Dúvidas'],['contato','Contato']].map(([href, label]) => <a key={href} href={`#${href}`} onClick={() => setMenuOpen(false)}>{label}</a>)}
          </nav>
          <BookingButton light className="mt-14 w-full" />
        </div>
      )}

      <main>
        <section id="inicio" className="relative min-h-[820px] overflow-hidden pt-[76px] lg:min-h-[760px]">
          <div className="absolute -left-32 top-32 size-[520px] rounded-full bg-[#efe4d9]/55 blur-3xl" />
          <div className="mx-auto grid min-h-[744px] max-w-[1440px] items-center gap-14 px-5 py-14 sm:px-8 lg:grid-cols-[.9fr_1.1fr] lg:px-12 lg:py-16">
            <div className="relative z-10 max-w-[650px]">
              <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-[#d9c5b2] bg-white/70 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.13em] text-[#8b684a]"><span className="size-1.5 rounded-full bg-[#b98963]" /> Estética com propósito e naturalidade</div>
              <h1 className="font-serif text-[52px] leading-[0.98] tracking-[-0.045em] text-[#25211e] sm:text-7xl lg:text-[82px]">Sua beleza,<br /><em className="font-normal text-[#a47a5a]">na sua melhor versão.</em></h1>
              <p className="mt-7 max-w-lg text-base leading-7 text-zinc-600 sm:text-lg">Tratamentos estéticos personalizados, conduzidos com ciência, cuidado e um olhar atento para o que faz você ser única.</p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row"><BookingButton /><a href="#tratamentos" className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-zinc-300 px-6 text-sm font-semibold hover:bg-white">Conhecer tratamentos <ChevronDown className="size-4" /></a></div>
              <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4 border-t border-zinc-200 pt-6">
                <div><strong className="block font-serif text-2xl">+2.800</strong><span className="text-xs text-zinc-500">clientes atendidas</span></div>
                <div><strong className="block font-serif text-2xl">8 anos</strong><span className="text-xs text-zinc-500">de experiência</span></div>
                <div><strong className="block font-serif text-2xl">4,9</strong><span className="flex items-center gap-1 text-xs text-zinc-500"><Star className="size-3 fill-[#c89365] text-[#c89365]" /> no Google</span></div>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-[650px] lg:ml-auto">
              <div className="absolute -right-12 -top-10 size-56 rounded-full border border-[#d9c5b2]" />
              <div className="relative ml-auto aspect-[4/4.45] max-h-[620px] overflow-hidden rounded-[220px_220px_32px_32px] bg-[#e6d7c9]">
                <img src="/free-access/clinica-hero.jpg" alt="Profissional realizando tratamento facial em paciente" className="h-full w-full object-cover object-center" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#2d251e]/25 via-transparent to-transparent" />
              </div>
              <div className="absolute -bottom-5 -left-3 max-w-[240px] rounded-2xl border border-white/70 bg-white/90 p-4 shadow-[0_20px_60px_rgba(72,53,38,.15)] backdrop-blur sm:-left-10 sm:p-5">
                <div className="flex items-center gap-3"><span className="flex size-10 items-center justify-center rounded-full bg-[#f3e8de] text-[#9a7454]"><Heart className="size-4 fill-current" /></span><div><strong className="block text-sm">Cuidado que acolhe</strong><span className="text-xs text-zinc-500">Do primeiro contato ao pós</span></div></div>
              </div>
              <div className="absolute -right-3 top-16 rounded-2xl border border-white/60 bg-[#25211e]/90 px-4 py-3 text-white shadow-xl backdrop-blur sm:-right-6"><div className="flex items-center gap-2"><ShieldCheck className="size-4 text-[#e8cdb4]" /><span className="text-xs font-medium">Protocolos seguros</span></div></div>
            </div>
          </div>
        </section>

        <section className="border-y border-black/[0.06] bg-white py-5">
          <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-center gap-x-12 gap-y-4 px-6 text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-400 sm:justify-between">
            <span className="flex items-center gap-2"><ShieldCheck className="size-4" /> Profissionais habilitados</span><span className="flex items-center gap-2"><Sparkles className="size-4" /> Protocolos personalizados</span><span className="flex items-center gap-2"><Award className="size-4" /> Produtos certificados</span><span className="flex items-center gap-2"><Heart className="size-4" /> Atendimento humanizado</span>
          </div>
        </section>

        <section id="sobre" className="mx-auto grid max-w-[1320px] gap-12 px-5 py-24 sm:px-8 lg:grid-cols-[.82fr_1.18fr] lg:px-12 lg:py-32">
          <div><span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#a47a5a]">A clínica</span><h2 className="mt-5 max-w-md font-serif text-5xl leading-[1.05] tracking-[-0.035em] sm:text-6xl">Beleza não é sobre mudar. É sobre <em className="text-[#a47a5a]">revelar.</em></h2></div>
          <div className="lg:pt-10">
            <p className="max-w-2xl text-xl leading-8 text-zinc-700">Na VisioNew, cada tratamento começa pela escuta. Acreditamos em uma estética que respeita seus traços, sua história e o seu tempo.</p>
            <p className="mt-5 max-w-2xl leading-7 text-zinc-500">Nossa equipe combina conhecimento técnico, tecnologias seguras e sensibilidade para criar resultados elegantes e naturais. Sem padrões prontos, sem excessos — apenas escolhas cuidadosas para você se sentir ainda mais confiante.</p>
            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {[{icon:ShieldCheck,title:'Segurança',text:'Protocolos rigorosos e produtos aprovados.'},{icon:Sparkles,title:'Naturalidade',text:'Resultados que valorizam sua identidade.'},{icon:Heart,title:'Acolhimento',text:'Escuta ativa em todas as etapas.'}].map(({icon:Icon,title,text}) => <div key={title} className="rounded-2xl border border-[#e8ded5] bg-white p-5"><Icon className="size-5 text-[#a47a5a]" /><h3 className="mt-4 text-sm font-semibold">{title}</h3><p className="mt-2 text-xs leading-5 text-zinc-500">{text}</p></div>)}
            </div>
          </div>
        </section>

        <section id="tratamentos" className="bg-[#25211e] py-24 text-white lg:py-32">
          <div className="mx-auto max-w-[1320px] px-5 sm:px-8 lg:px-12">
            <div className="flex flex-col justify-between gap-6 border-b border-white/15 pb-10 lg:flex-row lg:items-end"><div><span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#d4ae8f]">Nossos tratamentos</span><h2 className="mt-4 max-w-2xl font-serif text-5xl leading-tight tracking-[-0.035em] sm:text-6xl">Cuidado pensado para cada fase de você.</h2></div><p className="max-w-sm text-sm leading-6 text-zinc-400">Todos os protocolos são definidos após avaliação individual. Seu plano é único, assim como seus objetivos.</p></div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3">
              {treatments.map((item) => (
                <article key={item.number} className="group border-b border-white/10 py-8 transition md:px-6 md:first:pl-0 lg:border-r lg:px-8 lg:[&:nth-child(3n)]:border-r-0 lg:[&:nth-child(3n+1)]:pl-0">
                  <div className="flex items-center justify-between"><span className="font-serif text-sm text-[#d4ae8f]">{item.number}</span><ArrowRight className="size-4 -rotate-45 text-zinc-600 transition group-hover:rotate-0 group-hover:text-white" /></div>
                  <h3 className="mt-8 font-serif text-2xl">{item.name}</h3><p className="mt-3 min-h-20 text-sm leading-6 text-zinc-400">{item.description}</p><div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4 text-xs"><span className="flex items-center gap-1.5 text-zinc-500"><Clock3 className="size-3" /> {item.duration}</span><span className="font-medium text-zinc-300">{item.price}</span></div>
                </article>
              ))}
            </div>
            <div className="mt-12 flex justify-center"><BookingButton light /></div>
          </div>
        </section>

        <section className="mx-auto max-w-[1320px] px-5 py-24 sm:px-8 lg:px-12 lg:py-32">
          <div className="text-center"><span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#a47a5a]">Sua jornada</span><h2 className="mx-auto mt-4 max-w-xl font-serif text-5xl tracking-[-0.035em]">Simples, segura e feita no seu ritmo.</h2></div>
          <div className="relative mt-16 grid gap-8 md:grid-cols-3">
            <div className="absolute left-[16%] right-[16%] top-7 hidden h-px bg-[#ddcbbb] md:block" />
            {[{n:'1',title:'Agende sua avaliação',text:'Escolha o melhor dia e horário pelo nosso agendamento online.'},{n:'2',title:'Receba seu plano',text:'Entendemos seus objetivos e criamos uma proposta personalizada.'},{n:'3',title:'Viva sua experiência',text:'Realize seu tratamento com acompanhamento em cada etapa.'}].map((step) => <div key={step.n} className="relative text-center"><span className="relative z-10 mx-auto flex size-14 items-center justify-center rounded-full border border-[#c9ad93] bg-[#fcfaf7] font-serif text-xl text-[#9a7454]">{step.n}</span><h3 className="mt-6 font-serif text-2xl">{step.title}</h3><p className="mx-auto mt-3 max-w-xs text-sm leading-6 text-zinc-500">{step.text}</p></div>)}
          </div>
        </section>

        <section id="avaliacoes" className="border-y border-[#e6ddd5] bg-[#f3ede7] py-24 lg:py-32">
          <div className="mx-auto max-w-[1320px] px-5 sm:px-8 lg:px-12">
            <div className="flex flex-col justify-between gap-7 md:flex-row md:items-end"><div><span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#a47a5a]">Quem viveu, conta</span><h2 className="mt-4 font-serif text-5xl tracking-[-0.035em]">Experiências que<br />falam por nós.</h2></div><div className="rounded-2xl bg-white p-5 shadow-sm"><div className="flex items-center gap-4"><span className="flex size-11 items-center justify-center rounded-full bg-zinc-950 text-xl font-bold text-white">G</span><div><div className="flex items-center gap-2"><strong className="text-2xl">4,9</strong><Stars /></div><p className="text-xs text-zinc-500">Baseado em 187 avaliações</p></div></div></div></div>
            <div className="mt-12 grid gap-4 lg:grid-cols-3">
              {reviews.map((review) => <article key={review.name} className="rounded-2xl border border-[#e3d7cc] bg-white p-6 sm:p-8"><div className="flex items-center justify-between"><Stars /><span className="flex size-7 items-center justify-center rounded-full bg-zinc-100 text-xs font-bold">G</span></div><p className="mt-6 min-h-28 text-sm leading-7 text-zinc-600">“{review.text}”</p><div className="mt-7 flex items-center gap-3 border-t border-zinc-100 pt-5"><span className="flex size-10 items-center justify-center rounded-full bg-[#eee2d7] text-xs font-semibold text-[#8b684a]">{review.initials}</span><div><strong className="block text-sm">{review.name}</strong><span className="text-xs text-zinc-400">{review.date}</span></div><Check className="ml-auto size-4 rounded-full bg-[#1a73e8] p-0.5 text-white" /></div></article>)}
            </div>
            <p className="mt-5 text-center text-[11px] text-zinc-400">Avaliações e nomes simulados para fins de demonstração deste MVP.</p>
          </div>
        </section>

        <section id="faq" className="mx-auto grid max-w-[1200px] gap-12 px-5 py-24 sm:px-8 lg:grid-cols-[.8fr_1.2fr] lg:px-12 lg:py-32">
          <div><span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#a47a5a]">Dúvidas frequentes</span><h2 className="mt-4 font-serif text-5xl tracking-[-0.035em]">Antes de agendar, você pode querer saber.</h2><p className="mt-6 max-w-sm text-sm leading-6 text-zinc-500">Não encontrou sua dúvida? Nossa equipe está pronta para conversar com você.</p><a href="#contato" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold underline underline-offset-4">Falar com a equipe <ArrowRight className="size-4" /></a></div>
          <div className="divide-y divide-[#dfd6ce] border-y border-[#dfd6ce]">
            {faqs.map((item, index) => <div key={item.question}><button onClick={() => setOpenFaq(openFaq === index ? -1 : index)} className="flex w-full items-center justify-between gap-4 py-6 text-left"><span className="font-serif text-xl sm:text-2xl">{item.question}</span><span className={cn("flex size-8 shrink-0 items-center justify-center rounded-full border border-zinc-300 transition", openFaq === index && "rotate-180 bg-zinc-950 text-white")}><ChevronDown className="size-4" /></span></button><div className={cn("grid transition-all duration-300", openFaq === index ? "grid-rows-[1fr] pb-6" : "grid-rows-[0fr]")}><div className="overflow-hidden"><p className="max-w-xl pr-10 text-sm leading-7 text-zinc-500">{item.answer}</p></div></div></div>)}
          </div>
        </section>

        <section className="mx-4 overflow-hidden rounded-[28px] bg-[#b98865] text-white sm:mx-6 lg:mx-10">
          <div className="relative mx-auto flex max-w-[1200px] flex-col items-center px-5 py-20 text-center lg:py-24"><div className="absolute left-10 top-10 size-32 rounded-full border border-white/20" /><Sparkles className="size-6" /><h2 className="relative mt-6 max-w-3xl font-serif text-5xl leading-[1.05] tracking-[-0.04em] sm:text-6xl">Seu momento de cuidado pode começar agora.</h2><p className="relative mt-5 max-w-xl text-sm leading-6 text-white/75">Agende sua avaliação e descubra um plano pensado exclusivamente para você.</p><BookingButton light className="relative mt-8" /></div>
        </section>
      </main>

      <footer id="contato" className="bg-[#25211e] px-5 pb-8 pt-20 text-white sm:px-8 lg:px-12">
        <div className="mx-auto grid max-w-[1320px] gap-12 border-b border-white/10 pb-14 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div><div className="flex items-center gap-3"><span className="flex size-9 items-center justify-center rounded-full border border-[#d4ae8f] text-[#d4ae8f]"><Sparkles className="size-4" /></span><span className="font-serif text-3xl">VisioNew</span></div><p className="mt-5 max-w-xs text-sm leading-6 text-zinc-400">Estética com propósito, ciência e naturalidade. Um espaço para cuidar de você por inteiro.</p><a href="#" className="mt-6 inline-flex size-10 items-center justify-center rounded-full border border-white/15 hover:bg-white hover:text-zinc-950"><Instagram className="size-4" /></a></div>
          <div><h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-[#d4ae8f]">Navegue</h3><div className="mt-5 space-y-3 text-sm text-zinc-400"><a className="block hover:text-white" href="#sobre">A clínica</a><a className="block hover:text-white" href="#tratamentos">Tratamentos</a><a className="block hover:text-white" href="#avaliacoes">Avaliações</a><a className="block hover:text-white" href="#faq">Dúvidas</a></div></div>
          <div><h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-[#d4ae8f]">Atendimento</h3><div className="mt-5 space-y-4 text-sm text-zinc-400"><p className="flex items-start gap-2"><Clock3 className="mt-0.5 size-4 shrink-0" /> Seg–Sex, 9h às 19h<br />Sábado, 9h às 14h</p><p className="flex items-center gap-2"><Phone className="size-4" /> (11) 3456-7890</p><p className="flex items-center gap-2"><MessageCircle className="size-4" /> (11) 99876-5432</p></div></div>
          <div><h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-[#d4ae8f]">Onde estamos</h3><p className="mt-5 flex items-start gap-2 text-sm leading-6 text-zinc-400"><MapPin className="mt-1 size-4 shrink-0" /> Rua das Magnólias, 248<br />Jardins — São Paulo, SP</p><a href="#" className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-white underline underline-offset-4">Como chegar <ArrowRight className="size-3" /></a></div>
        </div>
        <div className="mx-auto flex max-w-[1320px] flex-col justify-between gap-3 pt-6 text-[11px] text-zinc-500 sm:flex-row"><span>© 2026 VisioNew Clínica. MVP demonstrativo.</span><span>Foto de Gustavo Fring via Pexels.</span><div className="flex gap-5"><a href="#">Privacidade</a><a href="#">Termos</a></div></div>
      </footer>

      <a href="#contato" aria-label="Falar pelo WhatsApp" className="fixed bottom-5 right-5 z-40 flex size-12 items-center justify-center rounded-full bg-[#25211e] text-white shadow-2xl transition hover:-translate-y-1"><MessageCircle className="size-5" /></a>
    </div>
  );
}
