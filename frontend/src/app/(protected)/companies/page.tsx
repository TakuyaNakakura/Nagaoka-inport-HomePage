import { PageHeader } from "@/components/PageHeader";
import { RecordGrid } from "@/components/RecordGrid";
import { fetchCompanies } from "@/lib/api-server";
import { formatDateTime } from "@/lib/format";

export default async function CompaniesPage() {
  const response = await fetchCompanies({ pageSize: 50 });

  return (
    <>
      <PageHeader
        eyebrow="Companies"
        title="会員企業一覧"
        description="会員企業の基本情報と更新状況を確認できます。"
      />

      <RecordGrid
        items={response.items.map((item) => ({
          id: item.id,
          href: `/companies/${item.id}`,
          title: item.companyName,
          summary: item.businessSummary,
          meta: [
            { label: "業種", value: item.industry },
            { label: "更新日", value: formatDateTime(item.updatedAt) }
          ]
        }))}
        emptyMessage="会員企業情報はありません。"
      />
    </>
  );
}
