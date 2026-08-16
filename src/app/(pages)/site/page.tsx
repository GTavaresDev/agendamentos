import type { Metadata } from "next";
import { AgendamentosLanding } from "@/app/(pages)/site/_components/agendamentos-landing.component";

export const metadata: Metadata = {
  title: "Agendamentos — Sistema Integrado de Gestão & Agendamentos",
  description: "Solução completa de gestão operacional e financeira para clínicas de estética, consultórios de saúde e estabelecimentos com atendimento agendado.",
  openGraph: {
    title: "Agendamentos — Sistema Integrado de Gestão & Agendamentos",
    description: "Plataforma completa para controle de agendamentos, clientes, produtos e relatórios operacionais em tempo real.",
    locale: "pt_BR",
    type: "website",
  },
};

export default function SitePage() {
  return <AgendamentosLanding />;
}
