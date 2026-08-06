import type { Metadata } from "next";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { SchedulingApp } from "@/app/(agendamentos)/(left-nav-bar)/_components/scheduling-app";

export const metadata: Metadata = {
  title: "Relatórios — Harmonize",
  description: "Indicadores e análises dos agendamentos.",
};

export default async function ReportsPage() {
  const session = await auth();
  const isAdmin =
    session?.user?.permissionLevel === 1 || session?.user?.role === "Administrador";
  const hasReportsPermission =
    isAdmin || session?.user?.permissions?.some((p) => p.name === "ver_relatorios");

  if (!hasReportsPermission) {
    redirect("/dashboard");
  }

  return <SchedulingApp initialView="relatorios" />;
}
