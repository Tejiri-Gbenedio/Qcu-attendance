import { redirect } from "next/navigation";
import { LoginForm } from "@/components/admin/login-form";
import { isAdminAuthenticated } from "@/lib/auth";

export default async function AdminLoginPage() {
  if (await isAdminAuthenticated()) {
    redirect("/admin/dashboard");
  }

  return (
    <div className="min-h-screen relative">
      {/* Ambient background is globally in layout */}
      <LoginForm />
    </div>
  );
}
