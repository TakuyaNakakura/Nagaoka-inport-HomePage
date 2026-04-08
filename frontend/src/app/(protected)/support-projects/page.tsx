import { PageHeader } from "@/components/PageHeader";
import { RecordGrid } from "@/components/RecordGrid";
import { fetchSupportProjects } from "@/lib/api-server";
import { formatDateTime } from "@/lib/format";

export default async function SupportProjectsPage() {
  const response = await fetchSupportProjects({ pageSize: 30 });

  return (
    <>
      <PageHeader
        eyebrow="Projects"
        title="支援プロジェクト"
        description="高専側の課題や実現したい取り組みを会員企業向けに公開します。"
      />

      <RecordGrid
        items={response.items.map((item) => ({
          id: item.id,
          href: `/support-projects/${item.id}`,
          title: item.projectName,
          summary: item.summary,
          meta: [
            `更新日: ${formatDateTime(item.updatedAt)}`,
            ...(item.centers?.map((center) => center.centerName) ?? [])
          ]
        }))}
        emptyMessage="公開中の支援プロジェクトはありません。"
      />
    </>
  );
}

