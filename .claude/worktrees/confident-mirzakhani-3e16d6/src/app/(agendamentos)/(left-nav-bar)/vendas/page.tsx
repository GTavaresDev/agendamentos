import type { Metadata } from "next";
import { SchedulingApp } from "@/app/(agendamentos)/(left-nav-bar)/_components/scheduling-app";

export const metadata: Metadata = {
  title: "Vendas — Harmonize",
  description: "Registre vendas e gerencie o caixa do seu negócio.",
};

export default function SalesPage() {
  return <SchedulingApp initialView="vendas" />;
}
