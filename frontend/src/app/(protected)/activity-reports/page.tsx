import { PageHeader } from "@/components/PageHeader";
import { RecordGrid } from "@/components/RecordGrid";
import { fetchActivityReports } from "@/lib/api-server";
import { formatDate, summarizeText } from "@/lib/format";

export default async function ActivityReportsPage() {
  const response = await fetchActivityReports({ pageSize: 30 });

  return (
    <>
      <PageHeader
        eyebrow="Reports"
        title="活動報告"
        description="イベントや連携施策、成果共有を活動報告として掲載します。"
      />

      <RecordGrid
        items={response.items.map((item) => ({
          id: item.id,
          href: `/activity-reports/${item.id}`,
          title: item.title,
          summary: summarizeText(item.summary, 88),
          meta: [item.category ?? "カテゴリ未設定", `更新日: ${formatDate(item.updatedAt)}`]
        }))}
        emptyMessage="公開中の活動報告はありません。"
      />
    </>
  );
}
