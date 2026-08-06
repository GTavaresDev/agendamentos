import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { AgendaPage } from "@/app/(agendamentos)/(left-nav-bar)/agenda/components/agenda-page";

export default async function Page() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  return <AgendaPage />;
}
