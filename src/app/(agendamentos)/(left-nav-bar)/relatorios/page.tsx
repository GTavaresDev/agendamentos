import type { Metadata } from "next";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { canAccessReports } from "@/lib/permissions";
import { ReportsDashboard } from "./components/reports-dashboard.component";

export const metadata: Metadata = {
  title: "Relatórios — Agendamentos",
  description: "Indicadores e análises dos agendamentos.",
};

export default async function ReportsPage() {
  const session = await auth();
  const hasReportsPermission = canAccessReports(session?.user);

  if (!hasReportsPermission) {
    redirect("/dashboard");
  }

  return <ReportsDashboard />;
}
