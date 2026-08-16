import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { ClientsView } from "./components/clients-view.component";

export default async function ClientsPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  return <ClientsView />;
}
