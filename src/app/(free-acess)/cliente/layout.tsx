import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "Portal do cliente",
    template: "%s | Agendamentos",
  },
  description: "Agende seu atendimento e acompanhe seus horários.",
  robots: { index: false, follow: false },
};

/**
 * Portal do cliente. Isolado do sistema interno: nenhuma sidebar, nenhum
 * provider administrativo, nenhuma ação interna alcançável a partir daqui.
 */
export default function FreeAccessLayout({ children }: { children: React.ReactNode }) {
  return children;
}
