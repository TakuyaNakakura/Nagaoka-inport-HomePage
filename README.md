# 技術協力会 会員向けポータル MVP

会員企業と管理者向けのクローズド型ポータルサイトです。構成は `Next.js frontend`、`Express + Prisma backend`、`PostgreSQL` です。

## サービス構成

- `frontend`: Next.js App Router
- `backend`: Express + Prisma REST API
- `db`: PostgreSQL

本番公開は Docker Compose 前提ではなく、`frontend` と `backend` を別々の Vercel Project としてデプロイする構成を想定しています。詳細は [docs/vercel-deployment.md](/Users/takuya/Documents/05_Git/Nagaoka-inport-HomePage/docs/vercel-deployment.md) を参照してください。

## ローカルセットアップ

1. `.env.example` を `.env` にコピーして値を調整
2. Docker Compose で起動

```bash
docker compose up --build
```

ローカル Docker Compose では以下を前提にしています。

- frontend は same-origin の `/api/*` を叩く
- frontend の `/api` Route Handler が backend に proxy する
- backend は `SEED_MODE=demo` で初期データを投入する
- backend は `NODE_ENV=development` で起動し、HTTP ローカル環境でも Cookie が使える

既存の PostgreSQL volume が migration 導入前のスキーマを持っている場合は、最初の 1 回だけ `P3005` が出ることがあります。その場合は local volume を作り直すか、`POSTGRES_DB` を新しい DB 名に切り替えて起動してください。

初回起動時に以下が投入されます。

- 管理者アカウント 1 件
- 会員デモユーザー 1 件
- 3 センター初期データ
- サイトについて / 規約の初期ページ
- デモ企業 / 技術シーズ / お知らせ / 活動報告 / 支援プロジェクト

## 主な環境変数

- `DATABASE_URL`: backend が接続する PostgreSQL 接続文字列
- `SESSION_SECRET`: セッション署名用の秘密値
- `FRONTEND_ORIGIN`: backend が許可する frontend origin
- `API_INTERNAL_BASE_URL`: frontend server runtime / proxy が参照する backend URL
- `NEXT_PUBLIC_API_BASE_URL`: ブラウザから参照する API base。通常は `/api`
- `ADMIN_LOGIN_ID`, `ADMIN_EMAIL`, `ADMIN_NAME`, `ADMIN_PASSWORD`: 初期管理者
- `SEED_MODE`: `bootstrap` または `demo`

`API_INTERNAL_BASE_URL` は `https://...` を含む完全 URL を使ってください。

## 開発用チェック

```bash
cd backend && npm test
cd backend && npm run build
cd frontend && npm run build
```

## 画面

- `/login`
- `/`
- `/news`
- `/centers`
- `/activity-reports`
- `/support-projects`
- `/companies`
- `/tech-seeds`
- `/about`
- `/my/company`
- `/my/tech-seeds`
- `/change-password`
- `/admin/*`
