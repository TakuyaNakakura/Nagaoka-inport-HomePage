import { notFound } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import { RecordGrid } from "@/components/RecordGrid";
import { RichText } from "@/components/RichText";
import { ApiError, fetchCenter } from "@/lib/api-server";
import { formatDate, formatDateTime, summarizeText } from "@/lib/format";

export default async function CenterDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    const { item } = await fetchCenter(id);

    return (
      <>
        <PageHeader eyebrow="Center" title={item.centerName} description={item.domain} />
        <article className="panel detail-card">
          <ul className="detail-meta">
            <li>更新日: {formatDateTime(item.updatedAt)}</li>
          </ul>
          <section>
            <h2>概要</h2>
            <RichText value={item.summary} />
          </section>
          <section>
            <h2>主な取り組み</h2>
            <RichText value={item.mainActivities} />
          </section>
          <section>
            <h2>企業との関わり方</h2>
            <RichText value={item.companyRelation} />
          </section>
        </article>

        <section className="panel">
          <h2>関連する活動報告</h2>
          <RecordGrid
            items={(item.relatedReports ?? []).map((report) => ({
              id: report.id,
              href: `/activity-reports/${report.id}`,
              title: report.title,
              summary: summarizeText(report.summary, 80),
              meta: [`更新日: ${formatDate(report.updatedAt)}`]
            }))}
            emptyMessage="関連する活動報告はありません。"
          />
        </section>

        <section className="panel">
          <h2>関連する支援プロジェクト</h2>
          <RecordGrid
            items={(item.relatedProjects ?? []).map((project) => ({
              id: project.id,
              href: `/support-projects/${project.id}`,
              title: project.projectName,
              summary: summarizeText(project.summary, 80),
              meta: [`更新日: ${formatDate(project.updatedAt)}`]
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
