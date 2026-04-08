import { notFound } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import { RecordGrid } from "@/components/RecordGrid";
import { RichText } from "@/components/RichText";
import { ApiError, fetchSupportProject } from "@/lib/api-server";
import { formatDateTime } from "@/lib/format";

export default async function SupportProjectDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  try {
    const { item } = await fetchSupportProject(id);

    return (
      <>
        <PageHeader eyebrow="Project" title={item.projectName} description={item.summary} />
        <article className="panel detail-card">
          <ul className="detail-meta">
            <li>更新日: {formatDateTime(item.updatedAt)}</li>
            {(item.centers ?? []).map((center) => (
              <li key={center.id}>{center.centerName}</li>
            ))}
          </ul>
          <section>
            <h2>背景</h2>
            <RichText value={item.background} />
          </section>
          <section>
            <h2>解決したい課題</h2>
            <RichText value={item.issue} />
          </section>
          <section>
            <h2>実現したいこと</h2>
            <RichText value={item.goal} />
          </section>
          <section>
            <h2>必要な支援内容</h2>
            <RichText value={item.supportNeeded} />
          </section>
          <section>
            <h2>期待される成果</h2>
            <RichText value={item.expectedResult} />
          </section>
          <section>
            <h2>問い合わせ先</h2>
            <RichText value={item.contactInfo} />
          </section>
        </article>

        <section className="panel">
          <h2>関連する活動報告</h2>
          <RecordGrid
            items={(item.relatedReports ?? []).map((report) => ({
              id: report.id,
              href: `/activity-reports/${report.id}`,
              title: report.title,
              meta: ["関連活動報告"]
            }))}
            emptyMessage="関連する活動報告はありません。"
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
