import { PageHeader } from "@/components/PageHeader";
import { RecordGrid } from "@/components/RecordGrid";
import { fetchNewsList } from "@/lib/api-server";
import { formatDate, summarizeText } from "@/lib/format";

export default async function NewsPage() {
  const response = await fetchNewsList({ pageSize: 30 });

  return (
    <>
      <PageHeader
        eyebrow="News"
        title="お知らせ"
        description="会員企業向けのお知らせ、更新情報、イベント案内を掲載します。"
      />

      <RecordGrid
        items={response.items.map((item) => ({
          id: item.id,
          href: `/news/${item.id}`,
          title: item.title,
          summary: summarizeText(item.body, 88),
          meta: [item.category, `更新日: ${formatDate(item.updatedAt)}`]
        }))}
        emptyMessage="公開中のお知らせはありません。"
      />
    </>
  );
}
