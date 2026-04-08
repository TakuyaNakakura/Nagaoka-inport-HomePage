import { redirect } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import { SelfCompanyEditor } from "@/components/SelfCompanyEditor";
import { fetchCompany, getCurrentUser } from "@/lib/api-server";

export default async function MyCompanyPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (!user.companyId) {
    return (
      <>
        <PageHeader eyebrow="My Company" title="自社会社情報" description="所属企業が設定されていません。" />
        <section className="panel">
          <p className="empty-state">管理者に所属企業の設定を依頼してください。</p>
        </section>
      </>
    );
  }

  const { item } = await fetchCompany(user.companyId);

  return (
    <>
      <PageHeader
        eyebrow="My Company"
        title="自社会社情報"
        description="会員企業自身で会社プロフィールを更新できます。"
      />
      <SelfCompanyEditor company={item} />
    </>
  );
}

