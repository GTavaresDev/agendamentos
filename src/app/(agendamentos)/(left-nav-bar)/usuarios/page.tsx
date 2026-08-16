import { auth } from "@/auth";
import { canAccessUsers } from "@/lib/permissions";
import { redirect } from "next/navigation";
import { UsersView } from "./components/users-view.component";

export default async function UsersPage() {
  const session = await auth();
  const hasUsersPermission = canAccessUsers(session?.user);

  if (!hasUsersPermission) {
    redirect("/dashboard");
  }

  return <UsersView />;
}
