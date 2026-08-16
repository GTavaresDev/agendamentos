import type { Metadata } from "next";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { SettingsView } from "./components/settings-view.component";

export const metadata: Metadata = {
  title: "Configurações — Agendamentos",
  description: "Gerencie preferências e recursos do sistema.",
};

export default async function SettingsPage() {
  const session = await auth();
  const isAdmin =
    session?.user?.permissionLevel === 1 || session?.user?.role === "Administrador";

  if (!isAdmin) {
    redirect("/dashboard");
  }

  return <SettingsView />;
}
