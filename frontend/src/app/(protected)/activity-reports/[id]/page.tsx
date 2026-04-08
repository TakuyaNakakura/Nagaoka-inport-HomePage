import { notFound } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import { RecordGrid } from "@/components/RecordGrid";
import { RichText } from "@/components/RichText";
import { ApiError, fetchActivityReport } from "@/lib/api-server";
import { formatDateTime } from "@/lib/format";

export default async function ActivityReportDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  try {
    const { item } = await fetchActivityReport(id);

    return (
      <>
        <PageHeader eyebrow="Report" title={item.title} description={item.category ?? "活動報告"} />
        <article className="panel detail-card">
          <ul className="detail-meta">
            <li>投稿日: {formatDateTime(item.publishedAt)}</li>
            <li>更新日: {formatDateTime(item.updatedAt)}</li>
            {(item.centers ?? []).map((center) => (
              <li key={center.id}>{center.centerName}</li>
            ))}
          </ul>
          <section>
            <h2>概要</h2>
            <RichText value={item.summary} />
          </section>
          <section>
            <h2>本文</h2>
            <RichText value={item.body} />
          </section>
        </article>

        <section className="panel">
          <h2>関連する支援プロジェクト</h2>
          <RecordGrid
            items={(item.relatedProjects ?? []).map((project) => ({
              id: project.id,
              href: `/support-projects/${project.id}`,
              title: project.projectName,
              meta: ["関連プロジェクト"]
            }))}
            emptyMessage="関連する支援プロジェクトはありません。"
          />
        </section>
      </>
    );
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }
    throw error;
  }
}
