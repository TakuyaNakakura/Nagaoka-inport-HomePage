import { PublishStatus, Role, SitePageKey, UserStatus } from "@prisma/client";
import { prisma } from "../src/db";
import { config } from "../src/config";
import { hashPassword } from "../src/auth/password";

const centers = [
  {
    centerName: "システムイノベーションセンター",
    domain: "教育連携",
    summary: "教育連携を通じて、高専と会員企業の接点を広げるセンターです。",
    mainActivities: "授業連携、PBL、共同企画、技術人材育成",
    companyRelation: "教育プログラムへの協力、学生との接点づくり、共同テーマ検討"
  },
  {
    centerName: "オープンソリューションセンター",
    domain: "研究連携",
    summary: "研究連携を軸に、高専の技術シーズと企業課題をつなぐセンターです。",
    mainActivities: "共同研究、技術相談、実証実験、技術移転支援",
    companyRelation: "研究テーマ相談、共同研究立ち上げ、技術課題の持ち込み"
  },
  {
    centerName: "地域連携推進センター",
    domain: "就職・生涯学習",
    summary: "地域企業との連携、就職支援、生涯学習支援を担うセンターです。",
    mainActivities: "インターンシップ、キャリア連携、公開講座、地域課題連携",
    companyRelation: "採用連携、地域課題プロジェクト、社会人学び直し企画"
  }
];

const seed = async () => {
  const adminPasswordHash = await hashPassword(config.initialAdmin.password);

  const admin = await prisma.user.upsert({
    where: {
      loginId: config.initialAdmin.loginId
    },
    update: {
      email: config.initialAdmin.email,
      userName: config.initialAdmin.userName,
      passwordHash: adminPasswordHash,
      role: Role.ADMIN,
      status: UserStatus.ACTIVE
    },
    create: {
      loginId: config.initialAdmin.loginId,
      email: config.initialAdmin.email,
      userName: config.initialAdmin.userName,
      passwordHash: adminPasswordHash,
      role: Role.ADMIN,
      status: UserStatus.ACTIVE,
      mustChangePassword: true
    }
  });

  for (const center of centers) {
    await prisma.center.upsert({
      where: {
        centerName: center.centerName
      },
      update: {
        ...center,
        updatedBy: admin.id
      },
      create: {
        ...center,
        createdBy: admin.id,
        updatedBy: admin.id
      }
    });
  }

  await prisma.sitePage.upsert({
    where: {
      pageKey: SitePageKey.ABOUT_TERMS
    },
    update: {
      title: "サイトについて・利用規約",
      body:
        "本サイトは技術協力会が運用する会員企業向けポータルサイトです。学校公式サイトではありません。利用者はログインのうえ、会員向け情報の閲覧、企業情報の更新、技術シーズの登録を行えます。",
      updatedBy: admin.id
    },
    create: {
      pageKey: SitePageKey.ABOUT_TERMS,
      title: "サイトについて・利用規約",
      body:
        "本サイトは技術協力会が運用する会員企業向けポータルサイトです。学校公式サイトではありません。利用者はログインのうえ、会員向け情報の閲覧、企業情報の更新、技術シーズの登録を行えます。",
      updatedBy: admin.id
    }
  });

  const company = await prisma.company.upsert({
    where: {
      id: "cm0memberdemo00000000000000"
    },
    update: {
      companyName: "サンプル工業株式会社",
      industry: "製造業",
      address: "新潟県長岡市",
      businessSummary: "加工技術と試作開発を行う会員企業のデモデータです。",
      interestTheme: "共同研究、インターンシップ、技術相談",
      contactInfo: "portal-demo@example.com",
      isActive: true
    },
    create: {
      id: "cm0memberdemo00000000000000",
      companyName: "サンプル工業株式会社",
      industry: "製造業",
      address: "新潟県長岡市",
      businessSummary: "加工技術と試作開発を行う会員企業のデモデータです。",
      interestTheme: "共同研究、インターンシップ、技術相談",
      contactInfo: "portal-demo@example.com",
      isActive: true
    }
  });

  await prisma.user.upsert({
    where: {
      loginId: "member-demo"
    },
    update: {
      email: "member-demo@example.com",
      userName: "会員デモ担当",
      passwordHash: await hashPassword("member-demo-123"),
      role: Role.MEMBER,
      status: UserStatus.ACTIVE,
      companyId: company.id,
      mustChangePassword: true
    },
    create: {
      loginId: "member-demo",
      email: "member-demo@example.com",
      userName: "会員デモ担当",
      passwordHash: await hashPassword("member-demo-123"),
      role: Role.MEMBER,
      status: UserStatus.ACTIVE,
      companyId: company.id,
      mustChangePassword: true
    }
  });

  const existingNews = await prisma.news.count();
  if (existingNews === 0) {
    await prisma.news.create({
      data: {
        title: "会員向けポータルを公開しました",
        body: "技術協力会の会員企業向けポータルを公開しました。最新情報や支援プロジェクトを確認できます。",
        category: "お知らせ",
        publishStatus: PublishStatus.PUBLISHED,
        publishedAt: new Date(),
        createdBy: admin.id,
        updatedBy: admin.id
      }
    });
  }
};

seed()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    // eslint-disable-next-line no-console
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
