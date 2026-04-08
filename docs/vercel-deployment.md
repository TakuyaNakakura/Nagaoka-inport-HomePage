# Vercel デプロイ手順

## 採用構成

- `frontend` と `backend` を同一リポジトリから別々の Vercel Project としてデプロイします
- ユーザーに公開する URL は frontend のみです
- browser は frontend の `/api/*` にのみアクセスし、frontend の Route Handler が backend に proxy します
- backend の REST endpoint 形は変更しません
- Cookie は `HttpOnly`, `SameSite=Lax`, `Secure=production`, `Path=/`, `Domain` 未指定の host-only を採用します

## Monorepo の切り方

- frontend Project
  - Root Directory: `frontend`
  - Framework Preset: Next.js
- backend Project
  - Root Directory: `backend`
  - Framework Preset: Express もしくは Other
  - `backend/vercel.json` の `buildCommand` と `installCommand` を使います

## 環境変数

### backend Project

Production / Preview の両方で設定します。

| 変数 | 必須 | 用途 | 例 |
| --- | --- | --- | --- |
| `DATABASE_URL` | 必須 | 外部 PostgreSQL 接続文字列 | `postgresql://user:pass@host:5432/db?schema=public` |
| `SESSION_SECRET` | 必須 | セッション署名用の長いランダム文字列 | 32 bytes 以上 |
| `FRONTEND_ORIGIN` | 必須 | backend が許可する frontend origin | `https://portal.example.com` |
| `ADMIN_LOGIN_ID` | 必須 | bootstrap seed で作る初期管理者ログイン ID | `admin` |
| `ADMIN_EMAIL` | 必須 | bootstrap seed で作る初期管理者メール | `admin@example.com` |
| `ADMIN_NAME` | 必須 | bootstrap seed で作る初期管理者名 | `Portal Admin` |
| `ADMIN_PASSWORD` | 必須 | bootstrap seed で作る初期管理者初期パスワード | `...` |
| `SEED_MODE` | 推奨 | seed の投入モード | `bootstrap` |

Production では `SEED_MODE=bootstrap` を推奨します。Preview でも demo データを入れない運用なら `bootstrap` を使います。

### frontend Project

| 変数 | 必須 | 用途 | 例 |
| --- | --- | --- | --- |
| `API_INTERNAL_BASE_URL` | 必須 | frontend server runtime と `/api` proxy が参照する backend URL | `https://api-portal.example.com` |
| `NEXT_PUBLIC_API_BASE_URL` | 任意 | browser から参照する API base。通常は `/api` のまま | `/api` |

`NEXT_PUBLIC_API_BASE_URL` は未設定でも `/api` が既定値です。特別な理由がなければ `/api` のままにしてください。

## Preview と Production の考え方

- `DATABASE_URL` は preview と production で必ず分けてください
- frontend / backend の preview 環境変数も production と分けます
- frontend preview から backend preview へ向けるには、backend 側に安定した preview 用 URL を用意するのが安全です
- 推奨は backend に preview branch 用ドメインまたは staging 用サブドメインを割り当て、その URL を frontend preview の `API_INTERNAL_BASE_URL` に設定する方法です

例:

- frontend production: `https://portal.example.com`
- backend production: `https://api-portal.example.com`
- frontend preview/staging: `https://staging-portal.example.com`
- backend preview/staging: `https://staging-api-portal.example.com`

## Cookie / CORS / Origin 方針

- browser は backend 直 URL にアクセスしません
- セッション Cookie は frontend origin に対して設定されます
- Cookie 属性
  - `secure`: production のみ `true`
  - `sameSite`: `lax`
  - `domain`: 未設定
  - `path`: `/`
- `FRONTEND_ORIGIN` は backend が CORS で許可する frontend URL です
- backend subdomain を直接公開していても、通常の利用導線では frontend `/api` 経由を維持してください

## Prisma / DB 運用

- 本番 DB は外部 PostgreSQL を前提にします
- backend deploy 時は `prisma migrate deploy` を実行します
- Docker Compose 用の `prisma db push` は廃止し、migration ベースに統一しました
- Prisma Client は `postinstall` で `prisma generate` されます

### 初回公開時の順序

1. backend Project に production `DATABASE_URL` を設定
2. backend をデプロイして `prisma migrate deploy` を通す
3. 一度だけ `SEED_MODE=bootstrap` で `npm run seed` を実行して初期管理者を作る
4. frontend Project に production `API_INTERNAL_BASE_URL` を設定
5. frontend をデプロイ
6. 初期管理者でログインし、パスワードを変更

### seed モード

- `bootstrap`
  - 初期管理者
  - サイトについて / 利用規約ページ
- `demo`
  - `bootstrap` の内容
  - デモ会社 / 技術シーズ / お知らせ / 活動報告 / 支援プロジェクト / 会員デモユーザー

## Vercel ダッシュボードで設定する内容

### backend Project

1. GitHub リポジトリを Import
2. Root Directory を `backend` に設定
3. Production / Preview の `DATABASE_URL` を設定
4. Production / Preview の `SESSION_SECRET` を設定
5. Production / Preview の `FRONTEND_ORIGIN` を設定
6. 初期管理者用 env を設定
7. 必要なら custom domain を追加

### frontend Project

1. 同じ GitHub リポジトリをもう一度 Import
2. Root Directory を `frontend` に設定
3. Production / Preview の `API_INTERNAL_BASE_URL` を設定
4. 必要なら `NEXT_PUBLIC_API_BASE_URL=/api` を設定
5. frontend の custom domain を追加

## カスタムドメイン設定

### 推奨構成

- frontend production: `portal.example.com`
- backend production: `api-portal.example.com`

### DNS の要点

- apex domain を Vercel に向ける場合は `A 76.76.21.21`
- subdomain を向ける場合は `CNAME cname.vercel-dns-0.com`
- 実運用は frontend を `www` または専用 subdomain に置く方が管理しやすいです
- backend は browser から見せない前提でも、frontend から到達できる HTTPS URL が必要です

## デプロイ直前チェックリスト

### コード側で完了済みの項目

- frontend `/api` proxy 実装
- frontend の API base を `/api` 標準へ変更
- backend の Vercel 互換 export
- Prisma migration ベースの起動へ変更
- seed を `bootstrap` / `demo` に分離
- Docker Compose を same-origin proxy 前提へ更新
- README と本手順書を追加

### 人手で行う項目

- Vercel Project を 2 つ作成
- preview / production の env を設定
- custom domain を追加
- DNS を反映
- backend の初回 production deploy 後に bootstrap seed を 1 回実行
- 初期管理者でログインし、パスワード変更と主要画面確認を行う

## 検証観点

- frontend `/api/auth/login` 経由で `Set-Cookie` が返ること
- frontend origin に Cookie が保存されること
- frontend SSR が backend と通信できること
- logout / password change / admin 更新系 API が `/api` 経由で動くこと
- preview と production の DB が混ざらないこと
