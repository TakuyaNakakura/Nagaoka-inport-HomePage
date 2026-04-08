import type { ReactNode } from "react";
import { PageHeader } from "@/components/PageHeader";
import { RecordGrid } from "@/components/RecordGrid";
import { fetchDashboard, getCurrentUser } from "@/lib/api-server";
import { formatDateTime } from "@/lib/format";

type Timestamped = {
  updatedAt: string;
};

type HomeSectionProps = {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  latestUpdatedAt: string | null;
  tone: "primary" | "secondary" | "tertiary";
  children: ReactNode;
};

const getLatestUpdatedAt = (items: Timestamped[]) => {
  if (items.length === 0) {
    return null;
  }

  return items.reduce((latest, item) => {
    return new Date(item.updatedAt).getTime() > new Date(latest).getTime() ? item.updatedAt : latest;
  }, items[0].updatedAt);
};

const summarizeText = (value?: string | null, maxLength = 96) => {
  if (!value) {
    return undefined;
  }

  const normalized = value.replace(/\s+/g, " ").trim();

  if (!normalized) {
    return undefined;
  }

  return normalized.length > maxLength ? `${normalized.slice(0, maxLength).trim()}…` : normalized;
};

const HomeSection = ({ id, eyebrow, title, description, latestUpdatedAt, tone, children }: HomeSectionProps) => (
  <section id={id} className={`panel dashboard-section dashboard-section--${tone}`}>
    <div className="dashboard-section__head">
      <div className="dashboard-section__title-group">
        <p className="eyebrow">{eyebrow}</p>
        <div className="dashboard-section__heading">
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
      </div>
      <p className="dashboard-section__updated">最終更新: {formatDateTime(latestUpdatedAt)}</p>
    </div>
    {children}
  </section>
);

export default async function HomePage() {
  const [dashboard, user] = await Promise.all([fetchDashboard(), getCurrentUser()]);
  const newsLatestUpdatedAt = getLatestUpdatedAt(dashboard.news);
  const activityReportsLatestUpdatedAt = getLatestUpdatedAt(dashboard.activityReports);
  const companyUpdatesLatestUpdatedAt = getLatestUpdatedAt(dashboard.companyUpdates);
  const techSeedUpdatesLatestUpdatedAt = getLatestUpdatedAt(dashboard.techSeedUpdates);
  const centersLatestUpdatedAt = getLatestUpdatedAt(dashboard.centers);
  const supportProjectsLatestUpdatedAt = getLatestUpdatedAt(dashboard.supportProjects);
  const updatesLatestUpdatedAt = getLatestUpdatedAt([...dashboard.companyUpdates, ...dashboard.techSeedUpdates]);
  const overallLatestUpdatedAt = getLatestUpdatedAt([
    ...dashboard.news,
    ...dashboard.centers,
    ...dashboard.activityReports,
    ...dashboard.supportProjects,
    ...dashboard.companyUpdates,
    ...dashboard.techSeedUpdates
  ]);

  const summaryCards = [
    {
      label: "新着お知らせ",
      value: dashboard.news.length,
      meta: `最新 ${formatDateTime(newsLatestUpdatedAt)}`,
      href: "#home-news"
    },
    {
      label: "活動報告",
      value: dashboard.activityReports.length,
      meta: `最新 ${formatDateTime(activityReportsLatestUpdatedAt)}`,
      href: "#home-reports"
    },
    {
      label: "更新情報",
      value: dashboard.companyUpdates.length + dashboard.techSeedUpdates.length,
      meta: `最新 ${formatDateTime(updatesLatestUpdatedAt)}`,
      href: "#home-company-updates"
    }
  ];

  return (
    <>
      <PageHeader
        eyebrow="Dashboard"
        title="ホーム"
        description={`${user?.userName ?? "会員"}向けに、まず確認したい新着情報と更新情報を優先度順にまとめています。`}
      />

      <div className="home-dashboard">
        <section className="panel dashboard-summary" aria-labelledby="dashboard-summary-title">
          <div className="dashboard-summary__head">
            <div className="dashboard-summary__title">
              <p className="eyebrow">Overview</p>
              <h2 id="dashboard-summary-title">最初に見るべき情報を上から順に確認できます</h2>
              <p>
                新着お知らせを起点に、活動報告、会員企業や技術シーズの更新まで、優先度順に流し読みできるよう整理しています。
              </p>
            </div>
            <p className="dashboard-summary__updated">全体の最終更新: {formatDateTime(overallLatestUpdatedAt)}</p>
          </div>

          <div className="dashboard-summary__stats">
            {summaryCards.map((item) => (
              <a key={item.label} href={item.href} className="dashboard-summary__stat">
                <span className="dashboard-summary__stat-label">{item.label}</span>
                <strong className="dashboard-summary__stat-value">{item.value}件</strong>
                <span className="dashboard-summary__stat-meta">{item.meta}</span>
              </a>
            ))}
          </div>

          <div className="dashboard-summary__links">
            <a href="#home-news" className="dashboard-summary__link">
              新着お知らせ
            </a>
            <a href="#home-reports" className="dashboard-summary__link">
              活動報告
            </a>
            <a href="#home-company-updates" className="dashboard-summary__link">
              企業更新
            </a>
            <a href="#home-tech-seeds" className="dashboard-summary__link">
              技術シーズ更新
            </a>
            <a href="#home-centers" className="dashboard-summary__link">
              注目の取り組み
            </a>
            <a href="#home-support-projects" className="dashboard-summary__link">
              支援プロジェクト
            </a>
          </div>
        </section>

        <div className="dashboard-layout">
          <div className="dashboard-layout__primary">
            <HomeSection
              id="home-news"
              eyebrow="Priority 01"
              title="新着お知らせ"
              description="まず確認したい会員向けのお知らせです。カテゴリと更新日を見ながら優先順位を判断できます。"
              latestUpdatedAt={newsLatestUpdatedAt}
              tone="primary"
            >
              <RecordGrid
                items={dashboard.news.map((item) => ({
                  id: item.id,
                  href: `/news/${item.id}`,
                  title: item.title,
                  summary: summarizeText(item.body, 120),
                  meta: [item.category, `更新日: ${formatDateTime(item.updatedAt)}`]
                }))}
                emptyMessage="お知らせはまだありません。"
              />
            </HomeSection>

            <HomeSection
              id="home-reports"
              eyebrow="Priority 02"
              title="最新の活動報告"
              description="直近の活動報告をまとめています。概要を流し読みしながら、必要な詳細へすぐ移動できます。"
              latestUpdatedAt={activityReportsLatestUpdatedAt}
              tone="primary"
            >
              <RecordGrid
                items={dashboard.activityReports.map((item) => ({
                  id: item.id,
                  href: `/activity-reports/${item.id}`,
                  title: item.title,
                  summary: summarizeText(item.summary, 110),
                  meta: [item.category ?? "活動報告", `更新日: ${formatDateTime(item.updatedAt)}`]
                }))}
                emptyMessage="活動報告はまだありません。"
              />
            </HomeSection>
          </div>

          <div className="dashboard-layout__secondary">
            <HomeSection
              id="home-company-updates"
              eyebrow="Updates"
              title="会員企業情報の更新"
              description="会員企業の更新を一覧できます。業種と更新日を起点に必要な情報を探せます。"
              latestUpdatedAt={companyUpdatesLatestUpdatedAt}
              tone="secondary"
            >
              <RecordGrid
                items={dashboard.companyUpdates.map((item) => ({
                  id: item.id,
                  href: `/companies/${item.id}`,
                  title: item.companyName,
                  summary: summarizeText(item.businessSummary, 88),
                  meta: [item.industry, `更新日: ${formatDateTime(item.updatedAt)}`]
                }))}
                emptyMessage="更新情報はまだありません。"
              />
            </HomeSection>

            <HomeSection
              id="home-tech-seeds"
              eyebrow="Updates"
              title="技術シーズの更新"
              description="新しい技術シーズや追記内容を確認できます。企業名や用途分野を手がかりに見比べられます。"
              latestUpdatedAt={techSeedUpdatesLatestUpdatedAt}
              tone="secondary"
            >
              <RecordGrid
                items={dashboard.techSeedUpdates.map((item) => ({
                  id: item.id,
                  href: `/tech-seeds/${item.id}`,
                  title: item.seedName,
                  summary: summarizeText(item.seedSummary, 88),
                  meta: [
                    item.company?.companyName ?? item.applicationField ?? "技術シーズ",
                    `更新日: ${formatDateTime(item.updatedAt)}`
                  ]
                }))}
                emptyMessage="更新情報はまだありません。"
              />
            </HomeSection>
          </div>
        </div>

        <div className="dashboard-support-grid">
          <HomeSection
            id="home-centers"
            eyebrow="Reference"
            title="注目の取り組み"
            description="センターごとの重点領域と概要です。全体動向を把握したいときに確認できます。"
            latestUpdatedAt={centersLatestUpdatedAt}
            tone="tertiary"
          >
            <RecordGrid
              items={dashboard.centers.map((item) => ({
                id: item.id,
                href: `/centers/${item.id}`,
                title: item.centerName,
                summary: summarizeText(item.summary, 90),
                meta: [item.domain, `更新日: ${formatDateTime(item.updatedAt)}`]
              }))}
              emptyMessage="センター情報はまだありません。"
            />
          </HomeSection>

          <HomeSection
            id="home-support-projects"
            eyebrow="Reference"
            title="注目の支援プロジェクト"
            description="進行中の支援テーマをまとめています。気になる案件の背景や進捗確認に使えます。"
            latestUpdatedAt={supportProjectsLatestUpdatedAt}
            tone="tertiary"
          >
            <RecordGrid
              items={dashboard.supportProjects.map((item) => ({
                id: item.id,
                href: `/support-projects/${item.id}`,
                title: item.projectName,
                summary: summarizeText(item.summary, 90),
                meta: [`更新日: ${formatDateTime(item.updatedAt)}`]
              }))}
              emptyMessage="支援プロジェクトはまだありません。"
            />
          </HomeSection>
        </div>
      </div>
    </>
  );
}
