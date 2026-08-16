import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { ServicesView } from "./components/services-view.component";

export default async function ServicesPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  return <ServicesView />;
}
