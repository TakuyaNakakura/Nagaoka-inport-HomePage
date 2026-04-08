import { notFound } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import { RichText } from "@/components/RichText";
import { ApiError, fetchTechSeed } from "@/lib/api-server";
import { formatDateTime } from "@/lib/format";

export default async function TechSeedDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    const { item } = await fetchTechSeed(id);

    return (
      <>
        <PageHeader
          eyebrow="Tech Seed"
          title={item.seedName}
          description={item.company?.companyName ?? item.applicationField ?? "技術シーズ"}
        />
        <article className="panel detail-card">
          <ul className="detail-meta">
            <li>対応可能分野: {item.applicationField ?? "未設定"}</li>
            <li>企業: {item.company?.companyName ?? "未設定"}</li>
            <li>更新日: {formatDateTime(item.updatedAt)}</li>
          </ul>
          <section>
            <h2>技術概要</h2>
            <RichText value={item.seedSummary} />
          </section>
          <section>
            <h2>活用用途</h2>
            <RichText value={item.usageExample} />
          </section>
          <section>
            <h2>強み・特徴</h2>
            <RichText value={item.strength} />
          </section>
          <section>
            <h2>関連製品・実績</h2>
            <RichText value={item.relatedResults} />
          </section>
          <section>
            <h2>連携したいテーマ</h2>
            <RichText value={item.collaborationTheme} />
          </section>
        </article>
      </>
    );
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }
    throw error;
  }
}
