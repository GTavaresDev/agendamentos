import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "Painel do cliente",
    template: "%s | Agendamentos",
  },
  description: "Agende seu atendimento e acompanhe seus horários.",
  robots: { index: false, follow: false },
};

/**
 * Área logada do cliente. Isolada do sistema interno: nenhuma sidebar
 * administrativa, nenhum provider interno, nenhuma ação da equipe alcançável
 * daqui. As telas públicas de acesso ficam em /cliente.
 */
export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return children;
}
