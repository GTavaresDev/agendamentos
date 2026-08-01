import type { Metadata } from "next";
import { ClinicLanding } from "./clinic-landing";

export const metadata: Metadata = {
  title: "Lumière Clínica — Estética com naturalidade",
  description: "Tratamentos estéticos personalizados para revelar sua melhor versão com leveza, segurança e naturalidade.",
};

export default function FreeAccessPage() {
  return <ClinicLanding />;
}
