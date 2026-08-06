import type { Metadata } from "next";
import { SchedulingApp } from "@/app/(agendamentos)/(left-nav-bar)/_components/scheduling-app";

export const metadata: Metadata = {
  title: "Produtos — Harmonize",
  description: "Cadastre e gerencie os produtos do seu negócio.",
};

export default function ProductsPage() {
  return <SchedulingApp initialView="produtos" />;
}
