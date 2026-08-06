import type { Metadata } from "next";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { ProductsView } from "@/app/(agendamentos)/(left-nav-bar)/produtos/components/products-view";

export const metadata: Metadata = {
  title: "Produtos — Agendamentos",
  description: "Cadastre e gerencie os produtos do seu negócio.",
};

export default async function ProductsPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  return <ProductsView />;
}
