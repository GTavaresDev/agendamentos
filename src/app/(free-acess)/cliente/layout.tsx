import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "Portal do cliente",
    template: "%s | Agendamentos",
  },
  description: "Entre para agendar seu atendimento e acompanhar seus horários.",
  robots: { index: false, follow: false },
};

/**
 * Telas públicas de acesso do cliente: login (`/cliente`), cadastro e
 * recuperação de senha. A área logada fica em /cliente/painel.
 */
export default function ClientAuthLayout({ children }: { children: React.ReactNode }) {
  return children;
}
