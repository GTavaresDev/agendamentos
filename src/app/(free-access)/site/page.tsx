import type { Metadata } from "next";
import { ClinicLanding } from "@/app/(free-access)/_components/clinic-landing";

export const metadata: Metadata = {
  title: "Agendamentos — Gestão Inteligente",
  description: "Plataforma completa para controle de agendamentos, clientes, produtos e relatórios operacionais em tempo real.",
};

export default function FreeAccessPage() {
  return <ClinicLanding />;
}
