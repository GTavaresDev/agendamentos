import type { Metadata } from "next";
import { ReportsDashboard } from "./reports-dashboard";

export const metadata: Metadata = {
  title: "Relatórios — Atempo",
  description: "Indicadores e análises dos agendamentos.",
};

export default function ReportsPage() {
  return <ReportsDashboard />;
}
