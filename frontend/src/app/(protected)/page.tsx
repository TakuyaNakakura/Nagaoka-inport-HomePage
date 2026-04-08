import { PageHeader } from "@/components/PageHeader";
import { RecordGrid } from "@/components/RecordGrid";
import { fetchDashboard, getCurrentUser } from "@/lib/api-server";
import { formatDateTime } from "@/lib/format";

export default async function HomePage() {
  const [dashboard, user] = await Promise.all([fetchDashboard(), getCurrentUser()]);

  return (
    <>
      <PageHeader
        eyebrow="Dashboard"
        title="ホーム"
        description={`${user?.userName ?? "会員"}向けの新着情報と更新情報をまとめています。`}
      />

      <section className="panel">
        <div className="info-strip">
          <strong>確認ポイント</strong>
          <span>新着お知らせ</span>
          <span>最新活動報告</span>
          <span>会員企業・技術シーズ更新</span>
        </div>
      </section>

      <section className="split-grid">
        <div className="panel">
          <h2>新着お知らせ</h2>
          <RecordGrid
            items={dashboard.news.map((item) => ({
              id: item.id,
              href: `/news/${item.id}`,
              title: item.title,
              summary: item.category,
              meta: [`更新日: ${formatDateTime(item.updatedAt)}`]
            }))}
            emptyMessage="お知らせはまだありません。"
          />
        </div>

        <div className="panel">
          <h2>注目の取り組み</h2>
          <RecordGrid
            items={dashboard.centers.map((item) => ({
              id: item.id,
              href: `/centers/${item.id}`,
              title: item.centerName,
              summary: item.summary,
              meta: [item.domain, `更新日: ${formatDateTime(item.updatedAt)}`]
            }))}
            emptyMessage="センター情報はまだありません。"
          />
        </div>
      </section>

      <section className="split-grid">
        <div className="panel">
          <h2>最新の活動報告</h2>
          <RecordGrid
            items={dashboard.activityReports.map((item) => ({
              id: item.id,
              href: `/activity-reports/${item.id}`,
              title: item.title,
              summary: item.summary,
              meta: [`更新日: ${formatDateTime(item.updatedAt)}`]
            }))}
            emptyMessage="活動報告はまだありません。"
          />
        </div>

        <div className="panel">
          <h2>注目の支援プロジェクト</h2>
          <RecordGrid
            items={dashboard.supportProjects.map((item) => ({
              id: item.id,
              href: `/support-projects/${item.id}`,
              title: item.projectName,
              summary: item.summary,
              meta: [`更新日: ${formatDateTime(item.updatedAt)}`]
            }))}
            emptyMessage="支援プロジェクトはまだありません。"
          />
        </div>
      </section>

      <section className="split-grid">
        <div className="panel">
          <h2>会員企業情報の更新</h2>
          <RecordGrid
            items={dashboard.companyUpdates.map((item) => ({
              id: item.id,
              href: `/companies/${item.id}`,
              title: item.companyName,
              summary: item.industry,
              meta: [`更新日: ${formatDateTime(item.updatedAt)}`]
            }))}
            emptyMessage="更新情報はまだありません。"
          />
        </div>

        <div className="panel">
          <h2>技術シーズの更新</h2>
          <RecordGrid
            items={dashboard.techSeedUpdates.map((item) => ({
              id: item.id,
              href: `/tech-seeds/${item.id}`,
              title: item.seedName,
              summary: item.company?.companyName ?? item.applicationField ?? "技術シーズ",
              meta: [`更新日: ${formatDateTime(item.updatedAt)}`]
            }))}
            emptyMessage="更新情報はまだありません。"
          />
        </div>
      </section>
    </>
  );
}

