import { PageHeader } from "@/components/PageHeader";
import { RecordGrid } from "@/components/RecordGrid";
import { fetchCenters } from "@/lib/api-server";
import { formatDate, summarizeText } from "@/lib/format";

export default async function CentersPage() {
  const response = await fetchCenters();

  return (
    <>
      <PageHeader
        eyebrow="Centers"
        title="取り組み紹介"
        description="3センターの役割と、会員企業との関わり方を紹介します。"
      />

      <RecordGrid
        items={response.items.map((item) => ({
          id: item.id,
          href: `/centers/${item.id}`,
          title: item.centerName,
          summary: summarizeText(item.summary, 88),
          meta: [item.domain, `更新日: ${formatDate(item.updatedAt)}`]
        }))}
        emptyMessage="センター情報はありません。"
      />
    </>
  );
}
