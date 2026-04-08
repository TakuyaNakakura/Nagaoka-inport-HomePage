import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/api-server";
import { LoginForm } from "@/components/LoginForm";

export default async function LoginPage() {
  const user = await getCurrentUser();

  if (user) {
    redirect(user.mustChangePassword ? "/change-password" : "/");
  }

  return (
    <div className="login-page">
      <LoginForm />
    </div>
  );
}
