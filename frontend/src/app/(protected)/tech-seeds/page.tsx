import { PageHeader } from "@/components/PageHeader";
import { RecordGrid } from "@/components/RecordGrid";
import { fetchTechSeeds } from "@/lib/api-server";
import { formatDateTime } from "@/lib/format";

type TechSeedsPageProps = {
  searchParams?: Promise<{
    q?: string;
    applicationField?: string;
  }>;
};

export default async function TechSeedsPage({ searchParams }: TechSeedsPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const q = resolvedSearchParams?.q ?? "";
  const applicationField = resolvedSearchParams?.applicationField ?? "";
  const response = await fetchTechSeeds({ pageSize: 50, q, applicationField });

  return (
    <>
      <PageHeader
        eyebrow="Tech Seeds"
        title="技術シーズ一覧"
        description="キーワード検索と分野絞り込みで、会員企業の技術シーズを探せます。"
      />

      <form className="panel split-grid" method="get">
        <label className="field">
          <span>キーワード</span>
          <input name="q" defaultValue={q} placeholder="技術名、概要、企業名など" />
        </label>
        <label className="field">
          <span>対応可能分野</span>
          <input name="applicationField" defaultValue={applicationField} placeholder="例: IoT, 機械加工" />
        </label>
        <div className="button-row">
          <button type="submit" className="primary-button">
            検索する
          </button>
        </div>
      </form>

      <RecordGrid
        items={response.items.map((item) => ({
          id: item.id,
          href: `/tech-seeds/${item.id}`,
          title: item.seedName,
          summary: item.seedSummary,
          meta: [
            item.company?.companyName ?? "企業未設定",
            item.applicationField ?? "分野未設定",
            `更新日: ${formatDateTime(item.updatedAt)}`
          ]
        }))}
        emptyMessage="条件に一致する技術シーズはありません。"
      />
    </>
  );
}
