import type { Metadata } from "next";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { SchedulingApp } from "@/app/(agendamentos)/(left-nav-bar)/_components/scheduling-app";

export const metadata: Metadata = {
  title: "Configurações — Harmonize",
  description: "Gerencie preferências e recursos do sistema.",
};

export default async function SettingsPage() {
  const session = await auth();
  const isAdmin =
    session?.user?.permissionLevel === 1 || session?.user?.role === "Administrador";

  if (!isAdmin) {
    redirect("/dashboard");
  }

  return <SchedulingApp initialView="configuracoes" />;
}
