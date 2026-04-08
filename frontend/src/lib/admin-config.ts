import type { FormField } from "./forms";

export type AdminResourceKey =
  | "news"
  | "centers"
  | "activity-reports"
  | "support-projects"
  | "companies"
  | "tech-seeds"
  | "users"
  | "about";

export type AdminResourceConfig = {
  key: AdminResourceKey;
  title: string;
  description: string;
  endpoint: string;
  responseMode: "paginated" | "plain" | "singleton";
  listTitleField: string;
  listSummaryField?: string;
  allowCreate: boolean;
  allowDelete: boolean;
  deleteLabel?: string;
  fields: FormField[];
  formSections?: Array<{
    title: string;
    description?: string;
    fields: string[];
  }>;
  secondaryAction?: {
    label: string;
    pathSuffix: string;
  };
};

const publishOptions = [
  { label: "下書き", value: "draft" },
  { label: "公開", value: "published" }
];

export const adminResourceConfig: Record<AdminResourceKey, AdminResourceConfig> = {
  news: {
    key: "news",
    title: "お知らせ管理",
    description: "会員企業向けのお知らせを作成・編集します。",
    endpoint: "/admin/news",
    responseMode: "paginated",
    listTitleField: "title",
    listSummaryField: "category",
    allowCreate: true,
    allowDelete: true,
    formSections: [
      {
        title: "基本設定",
        description: "一覧で見分けやすいタイトルとカテゴリ、公開状態を先に整えます。",
        fields: ["title", "category", "publishStatus"]
      },
      {
        title: "掲載内容",
        description: "会員向けに表示する本文を入力します。",
        fields: ["body"]
      }
    ],
    fields: [
      { name: "title", label: "タイトル", type: "text", required: true },
      { name: "category", label: "カテゴリ", type: "text", required: true },
      { name: "publishStatus", label: "公開状態", type: "select", required: true, options: publishOptions },
      { name: "body", label: "本文", type: "textarea", required: true, rows: 10 }
    ]
  },
  centers: {
    key: "centers",
    title: "センター紹介管理",
    description: "固定3センターの紹介内容を更新します。",
    endpoint: "/admin/centers",
    responseMode: "plain",
    listTitleField: "centerName",
    listSummaryField: "domain",
    allowCreate: false,
    allowDelete: false,
    formSections: [
      {
        title: "基本情報",
        description: "センターの担当領域と紹介の要点を整理します。",
        fields: ["domain", "summary"]
      },
      {
        title: "活動内容",
        description: "企業との関わり方まで含めて、紹介文を更新します。",
        fields: ["mainActivities", "companyRelation"]
      }
    ],
    fields: [
      { name: "domain", label: "担当領域", type: "text", required: true },
      { name: "summary", label: "概要", type: "textarea", required: true, rows: 5 },
      { name: "mainActivities", label: "主な取り組み", type: "textarea", required: true, rows: 6 },
      { name: "companyRelation", label: "企業との関わり方", type: "textarea", rows: 6, nullable: true }
    ]
  },
  "activity-reports": {
    key: "activity-reports",
    title: "活動報告管理",
    description: "活動報告の作成、関連センター・支援プロジェクトの紐付けを行います。",
    endpoint: "/admin/activity-reports",
    responseMode: "paginated",
    listTitleField: "title",
    listSummaryField: "summary",
    allowCreate: true,
    allowDelete: true,
    formSections: [
      {
        title: "基本設定",
        description: "タイトル、カテゴリ、公開状態を先に決めて一覧で判別しやすくします。",
        fields: ["title", "category", "publishStatus"]
      },
      {
        title: "掲載内容",
        description: "一覧の概要と詳細本文を分けて入力します。",
        fields: ["summary", "body"]
      },
      {
        title: "関連情報",
        description: "紐づくセンターや支援プロジェクトを整理します。",
        fields: ["centerIds", "projectIds"]
      }
    ],
    fields: [
      { name: "title", label: "タイトル", type: "text", required: true },
      { name: "summary", label: "概要", type: "textarea", required: true, rows: 4 },
      { name: "category", label: "カテゴリ", type: "text", nullable: true },
      { name: "publishStatus", label: "公開状態", type: "select", required: true, options: publishOptions },
      { name: "centerIds", label: "関連センター", type: "multiselect", optionsKey: "centers" },
      {
        name: "projectIds",
        label: "関連支援プロジェクト",
        type: "multiselect",
        optionsKey: "supportProjects"
      },
      { name: "body", label: "本文", type: "textarea", required: true, rows: 12 }
    ]
  },
  "support-projects": {
    key: "support-projects",
    title: "支援プロジェクト管理",
    description: "支援プロジェクトの登録と関連記事紐付けを行います。",
    endpoint: "/admin/support-projects",
    responseMode: "paginated",
    listTitleField: "projectName",
    listSummaryField: "summary",
    allowCreate: true,
    allowDelete: true,
    formSections: [
      {
        title: "基本設定",
        description: "プロジェクト名、公開状態、問い合わせ先など運用に必要な情報です。",
        fields: ["projectName", "publishStatus", "contactInfo"]
      },
      {
        title: "プロジェクト内容",
        description: "背景から期待成果までを順に整理して記載します。",
        fields: [
          "summary",
          "background",
          "issue",
          "goal",
          "supportNeeded",
          "expectedResult"
        ]
      },
      {
        title: "関連情報",
        description: "関連センターと活動報告をつないで参照しやすくします。",
        fields: ["centerIds", "reportIds"]
      }
    ],
    fields: [
      { name: "projectName", label: "プロジェクト名", type: "text", required: true },
      { name: "summary", label: "概要", type: "textarea", required: true, rows: 4 },
      { name: "background", label: "背景", type: "textarea", required: true, rows: 4 },
      { name: "issue", label: "課題", type: "textarea", required: true, rows: 4 },
      { name: "goal", label: "実現したいこと", type: "textarea", required: true, rows: 4 },
      { name: "supportNeeded", label: "必要な支援内容", type: "textarea", required: true, rows: 4 },
      { name: "expectedResult", label: "期待される成果", type: "textarea", rows: 4, nullable: true },
      { name: "contactInfo", label: "問い合わせ先", type: "text", nullable: true },
      { name: "publishStatus", label: "公開状態", type: "select", required: true, options: publishOptions },
      { name: "centerIds", label: "関連センター", type: "multiselect", optionsKey: "centers" },
      {
        name: "reportIds",
        label: "関連活動報告",
        type: "multiselect",
        optionsKey: "activityReports"
      }
    ]
  },
  companies: {
    key: "companies",
    title: "会員企業管理",
    description: "企業情報の登録・編集と運用停止を行います。",
    endpoint: "/admin/companies",
    responseMode: "paginated",
    listTitleField: "companyName",
    listSummaryField: "industry",
    allowCreate: true,
    allowDelete: true,
    deleteLabel: "運用停止",
    formSections: [
      {
        title: "基本情報",
        description: "企業名や業種など、一覧比較の軸になる情報です。",
        fields: ["companyName", "industry", "address", "contactInfo"]
      },
      {
        title: "公開プロフィール",
        description: "会員向け一覧や詳細に出る説明を更新します。",
        fields: ["interestTheme", "businessSummary"]
      },
      {
        title: "運用設定",
        description: "運用状態をここで切り替えます。",
        fields: ["isActive"]
      }
    ],
    fields: [
      { name: "companyName", label: "企業名", type: "text", required: true },
      { name: "industry", label: "業種", type: "text", required: true },
      { name: "address", label: "所在地", type: "text", nullable: true },
      { name: "contactInfo", label: "連絡先", type: "text", nullable: true },
      { name: "interestTheme", label: "高専との関心テーマ", type: "textarea", rows: 4, nullable: true },
      { name: "businessSummary", label: "事業概要", type: "textarea", rows: 6, nullable: true },
      { name: "isActive", label: "運用中", type: "checkbox" }
    ]
  },
  "tech-seeds": {
    key: "tech-seeds",
    title: "技術シーズ管理",
    description: "企業に紐づく技術シーズを全件管理します。",
    endpoint: "/admin/tech-seeds",
    responseMode: "paginated",
    listTitleField: "seedName",
    listSummaryField: "applicationField",
    allowCreate: true,
    allowDelete: true,
    formSections: [
      {
        title: "基本情報",
        description: "所属企業と技術シーズ名、対応分野を先に整理します。",
        fields: ["companyId", "seedName", "applicationField"]
      },
      {
        title: "技術内容",
        description: "一覧や詳細で比較される技術説明をまとめます。",
        fields: ["seedSummary", "usageExample", "strength", "relatedResults"]
      },
      {
        title: "連携情報",
        description: "企業連携につながるテーマを明確にします。",
        fields: ["collaborationTheme"]
      }
    ],
    fields: [
      { name: "companyId", label: "企業", type: "select", required: true, optionsKey: "companies" },
      { name: "seedName", label: "技術シーズ名", type: "text", required: true },
      { name: "applicationField", label: "対応可能分野", type: "text", nullable: true },
      { name: "seedSummary", label: "技術概要", type: "textarea", required: true, rows: 5 },
      { name: "usageExample", label: "活用用途", type: "textarea", rows: 4, nullable: true },
      { name: "strength", label: "強み・特徴", type: "textarea", rows: 4, nullable: true },
      { name: "relatedResults", label: "関連製品・実績", type: "textarea", rows: 4, nullable: true },
      { name: "collaborationTheme", label: "連携したいテーマ", type: "textarea", rows: 4, nullable: true }
    ]
  },
  users: {
    key: "users",
    title: "ユーザー管理",
    description: "利用者アカウントの作成、編集、無効化、仮パスワード再発行を行います。",
    endpoint: "/admin/users",
    responseMode: "paginated",
    listTitleField: "userName",
    listSummaryField: "email",
    allowCreate: true,
    allowDelete: true,
    deleteLabel: "無効化",
    secondaryAction: {
      label: "仮パスワード再発行",
      pathSuffix: "/reset-password"
    },
    formSections: [
      {
        title: "アカウント情報",
        description: "ログイン識別子と連絡先、表示名を設定します。",
        fields: ["loginId", "email", "userName"]
      },
      {
        title: "権限と所属",
        description: "権限、利用状態、所属企業をまとめて管理します。",
        fields: ["role", "status", "companyId"]
      }
    ],
    fields: [
      { name: "loginId", label: "ログインID", type: "text", required: true },
      { name: "email", label: "メールアドレス", type: "text", required: true },
      { name: "userName", label: "ユーザー名", type: "text", required: true },
      {
        name: "role",
        label: "権限",
        type: "select",
        required: true,
        options: [
          { label: "管理者", value: "admin" },
          { label: "会員企業", value: "member" }
        ]
      },
      {
        name: "status",
        label: "利用状態",
        type: "select",
        required: true,
        options: [
          { label: "有効", value: "active" },
          { label: "無効", value: "disabled" }
        ]
      },
      {
        name: "companyId",
        label: "所属企業",
        type: "select",
        optionsKey: "companies",
        nullable: true,
        helpText: "会員企業ユーザーの場合のみ設定します。"
      }
    ]
  },
  about: {
    key: "about",
    title: "サイト情報・規約",
    description: "会員向けサイトの目的と利用規約を更新します。",
    endpoint: "/admin/site-pages/about",
    responseMode: "singleton",
    listTitleField: "title",
    allowCreate: false,
    allowDelete: false,
    formSections: [
      {
        title: "基本情報",
        description: "ページのタイトルを設定します。",
        fields: ["title"]
      },
      {
        title: "本文",
        description: "会員向けサイトに表示する内容を更新します。",
        fields: ["body"]
      }
    ],
    fields: [
      { name: "title", label: "タイトル", type: "text", required: true },
      { name: "body", label: "本文", type: "textarea", required: true, rows: 14 }
    ]
  }
};

export const adminResourceEntries = Object.values(adminResourceConfig);
