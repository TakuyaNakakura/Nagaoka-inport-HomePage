import { PageHeader } from "@/components/PageHeader";
import { PasswordChangeForm } from "@/components/PasswordChangeForm";

export default function ChangePasswordPage() {
  return (
    <>
      <PageHeader
        eyebrow="Security"
        title="パスワード変更"
        description="仮パスワード利用中のユーザーは最初に変更してください。"
      />
      <PasswordChangeForm />
    </>
  );
}

