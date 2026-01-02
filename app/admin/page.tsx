import { redirect } from "next/navigation";
import { getAdminUser } from "@/lib/auth";
import AdminDashboard from "./AdminDashboard";

export default async function AdminPage() {
  const user = await getAdminUser();

  if (!user) {
    // User is not an admin - redirect to home
    redirect("/");
  }

  return <AdminDashboard userName={user.name || user.email} />;
}
