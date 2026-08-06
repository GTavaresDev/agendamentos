import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { SchedulingApp } from "@/app/(agendamentos)/(left-nav-bar)/_components/scheduling-app";

export default async function UsersPage() {
  const session = await auth();
  const isFuncionario =
    session?.user?.permissionLevel === 3 || session?.user?.role === "Funcionario";

  if (isFuncionario) {
    redirect("/dashboard");
  }

  return <SchedulingApp initialView="usuarios" />;
}
