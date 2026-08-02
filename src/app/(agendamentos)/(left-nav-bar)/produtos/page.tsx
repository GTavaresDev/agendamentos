import type { Metadata } from "next";
import { SchedulingApp } from "@/app/(agendamentos)/_components/scheduling-app";

export const metadata: Metadata = {
  title: "Produtos — Cliente",
  description: "Cadastre e gerencie os produtos do seu negócio.",
};

export default function ProductsPage() {
  return <SchedulingApp initialView="produtos" />;
}
