import { notFound } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import { RecordGrid } from "@/components/RecordGrid";
import { RichText } from "@/components/RichText";
import { ApiError, fetchCompany } from "@/lib/api-server";
import { formatDateTime } from "@/lib/format";

export default async function CompanyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    const { item } = await fetchCompany(id);

    return (
      <>
        <PageHeader eyebrow="Company" title={item.companyName} description={item.industry} />
        <article className="panel detail-card">
          <ul className="detail-meta">
            <li>所在地: {item.address ?? "未設定"}</li>
            <li>連絡先: {item.contactInfo ?? "未設定"}</li>
            <li>更新日: {formatDateTime(item.updatedAt)}</li>
          </ul>
          <section>
            <h2>事業概要</h2>
            <RichText value={item.businessSummary} />
          </section>
          <section>
            <h2>高専との関心テーマ</h2>
            <RichText value={item.interestTheme} />
          </section>
        </article>

        <section className="panel">
          <h2>登録済み技術シーズ</h2>
          <RecordGrid
            items={(item.techSeeds ?? []).map((seed) => ({
              id: seed.id,
              href: `/tech-seeds/${seed.id}`,
              title: seed.seedName,
              summary: seed.seedSummary,
              meta: [seed.applicationField ?? "分野未設定", `更新日: ${formatDateTime(seed.updatedAt)}`]
            }))}
            emptyMessage="登録済み技術シーズはありません。"
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
