# 技術協力会 会員向けポータル MVP

会員企業と管理者向けのクローズド型ポータルサイトです。構成は `Next.js frontend`、`Express + Prisma backend`、`PostgreSQL`、`Docker Compose` です。

## サービス構成

- `frontend`: Next.js App Router
- `backend`: TypeScript REST API
- `db`: PostgreSQL

## セットアップ

1. `.env.example` を `.env` にコピーして値を調整
2. Docker Compose で起動

```bash
docker compose up --build
```

初回起動時に以下が投入されます。

- 管理者アカウント 1 件
- 3 センター初期データ
- サイトについて / 規約の初期ページ

## 主な環境変数

- `SESSION_SECRET`: セッション署名用の秘密値
- `ADMIN_LOGIN_ID`, `ADMIN_EMAIL`, `ADMIN_NAME`, `ADMIN_PASSWORD`: 初期管理者
- `FRONTEND_PUBLIC_API_BASE_URL`: ブラウザから参照する API URL

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

