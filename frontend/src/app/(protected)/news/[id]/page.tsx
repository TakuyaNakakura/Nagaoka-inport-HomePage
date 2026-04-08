import { notFound } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import { RichText } from "@/components/RichText";
import { ApiError, fetchNews } from "@/lib/api-server";
import { formatDateTime } from "@/lib/format";

export default async function NewsDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    const { item } = await fetchNews(id);

    return (
      <>
        <PageHeader eyebrow="News" title={item.title} description={item.category} />
        <article className="panel detail-card">
          <ul className="detail-meta">
            <li>投稿日: {formatDateTime(item.publishedAt)}</li>
            <li>更新日: {formatDateTime(item.updatedAt)}</li>
          </ul>
          <section>
            <RichText value={item.body} />
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
