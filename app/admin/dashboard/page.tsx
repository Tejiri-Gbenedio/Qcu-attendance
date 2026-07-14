import { redirect } from "next/navigation";
import { Dashboard } from "@/components/admin/dashboard";
import { isAdminAuthenticated } from "@/lib/auth";

export default async function AdminDashboardPage() {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen relative">
      <Dashboard />
    </div>
  );
}
