import { PageHeader } from "@/components/PageHeader";
import { RecordGrid } from "@/components/RecordGrid";
import { fetchActivityReports } from "@/lib/api-server";
import { formatDateTime } from "@/lib/format";

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
          summary: item.summary,
          meta: [
            item.category ?? "カテゴリ未設定",
            `更新日: ${formatDateTime(item.updatedAt)}`,
            ...(item.centers?.map((center) => center.centerName) ?? [])
          ]
        }))}
        emptyMessage="公開中の活動報告はありません。"
      />
    </>
  );
}

