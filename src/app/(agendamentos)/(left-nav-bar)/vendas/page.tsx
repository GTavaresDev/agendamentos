import type { Metadata } from "next";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { SalesView } from "./components/sales-view.component";

export const metadata: Metadata = {
  title: "Vendas — Agendamentos",
  description: "Registre vendas e gerencie o caixa do seu negócio.",
};

export default async function SalesPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  return <SalesView />;
}
