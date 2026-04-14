import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const backendDir = join(scriptDir, "..");
const repoRoot = join(backendDir, "..");
const seedSourcePath = join(backendDir, "prisma", "seed.ts");
const outputPath = join(repoRoot, "docs", "neon-demo-seed.sql");

const seedSource = readFileSync(seedSourcePath, "utf8");

const enumContext = {
  PublishStatus: {
    DRAFT: "DRAFT",
    PUBLISHED: "PUBLISHED"
  },
  Date
};

const centerIdByName = new Map([
  ["システムイノベーションセンター", "seed-center-system-innovation"],
  ["オープンソリューションセンター", "seed-center-open-solution"],
  ["地域連携推進センター", "seed-center-community-link"]
]);

const sitePage = {
  id: "seed-sitepage-about-terms",
  pageKey: "ABOUT_TERMS",
  title: "サイトについて・利用規約",
  body: "本サイトは技術協力会が運用する会員企業向けポータルサイトです。学校公式サイトではありません。利用者はログインのうえ、会員向け情報の閲覧、企業情報の更新、技術シーズの登録を行えます。"
};

const memberDemoUser = {
  id: "seed-user-member-demo",
  loginId: "member-demo",
  email: "member-demo@example.com",
  userName: "会員デモ担当",
  passwordHash: "$2a$10$.GGtPewUE3Od38YvXJWuruI/SiDxe24Wy4NJaSqc1dt35rUOiqciW",
  role: "MEMBER",
  status: "ACTIVE",
  companyId: "cm0memberdemo00000000000000",
  mustChangePassword: true
};

const extractExpression = (name) => {
  const marker = `const ${name} =`;
  const markerIndex = seedSource.indexOf(marker);

  if (markerIndex === -1) {
    throw new Error(`Could not find constant: ${name}`);
  }

  let index = markerIndex + marker.length;
  while (/\s/.test(seedSource[index])) {
    index += 1;
  }

  const opening = seedSource[index];
  const closing = opening === "[" ? "]" : opening === "{" ? "}" : null;

  if (!closing) {
    throw new Error(`Unsupported expression for constant: ${name}`);
  }

  let depth = 0;
  let quote = null;
  let escape = false;

  for (let cursor = index; cursor < seedSource.length; cursor += 1) {
    const char = seedSource[cursor];

    if (quote) {
      if (escape) {
        escape = false;
        continue;
      }

      if (char === "\\") {
        escape = true;
        continue;
      }

      if (char === quote) {
        quote = null;
      }

      continue;
    }

    if (char === '"' || char === "'" || char === "`") {
      quote = char;
      continue;
    }

    if (char === opening) {
      depth += 1;
      continue;
    }

    if (char === closing) {
      depth -= 1;

      if (depth === 0) {
        return seedSource.slice(index, cursor + 1);
      }
    }
  }

  throw new Error(`Could not parse constant: ${name}`);
};

const evaluateExpression = (name) => {
  const expression = extractExpression(name);
  return vm.runInNewContext(`(${expression})`, enumContext);
};

const sqlString = (value) => `'${String(value).replaceAll("'", "''")}'`;
const sqlNullableString = (value) => (value == null ? "NULL" : sqlString(value));
const sqlBoolean = (value) => (value ? "TRUE" : "FALSE");
const sqlTimestamp = (value) => sqlString(value.toISOString());
const sqlEnum = (value, typeName) => `${sqlString(value)}::"${typeName}"`;

const multiline = (lines, indent = "  ") => lines.map((line) => `${indent}${line}`).join("\n");

const centers = evaluateExpression("centers");
const companies = evaluateExpression("demoCompanies");
const techSeeds = evaluateExpression("demoTechSeeds");
const newsItems = evaluateExpression("demoNews");
const supportProjects = evaluateExpression("demoSupportProjects");
const activityReports = evaluateExpression("demoActivityReports");

const renderValues = (rows) => rows.map((row) => `    (${row.join(", ")})`).join(",\n");

const companyRows = companies.map((company) => [
  sqlString(company.id),
  sqlString(company.companyName),
  sqlString(company.industry),
  sqlNullableString(company.address),
  sqlNullableString(company.businessSummary),
  sqlNullableString(company.interestTheme),
  sqlNullableString(company.contactInfo),
  sqlBoolean(company.isActive),
  "NOW()",
  "NOW()"
]);

const centerRows = centers.map((center) => [
  sqlString(centerIdByName.get(center.centerName)),
  sqlString(center.centerName),
  sqlString(center.domain),
  sqlString(center.summary),
  sqlString(center.mainActivities),
  sqlNullableString(center.companyRelation),
  "admin_id",
  "admin_id",
  "NOW()",
  "NOW()"
]);

const techSeedRows = techSeeds.map((item) => [
  sqlString(item.id),
  sqlString(item.companyId),
  sqlString(item.seedName),
  sqlString(item.seedSummary),
  sqlNullableString(item.applicationField),
  sqlNullableString(item.usageExample),
  sqlNullableString(item.strength),
  sqlNullableString(item.relatedResults),
  sqlNullableString(item.collaborationTheme),
  "NOW()",
  "NOW()"
]);

const newsRows = newsItems.map((item) => [
  sqlString(item.id),
  sqlString(item.title),
  sqlString(item.body),
  sqlString(item.category),
  sqlEnum(item.publishStatus, "PublishStatus"),
  sqlTimestamp(item.publishedAt),
  "admin_id",
  "admin_id",
  "NOW()",
  "NOW()"
]);

const supportProjectRows = supportProjects.map((item) => [
  sqlString(item.id),
  sqlString(item.projectName),
  sqlString(item.summary),
  sqlString(item.background),
  sqlString(item.issue),
  sqlString(item.goal),
  sqlString(item.supportNeeded),
  sqlNullableString(item.expectedResult),
  sqlNullableString(item.contactInfo),
  sqlEnum(item.publishStatus, "PublishStatus"),
  sqlTimestamp(item.publishedAt),
  "admin_id",
  "admin_id",
  "NOW()",
  "NOW()"
]);

const activityReportRows = activityReports.map((item) => [
  sqlString(item.id),
  sqlString(item.title),
  sqlString(item.summary),
  sqlString(item.body),
  sqlNullableString(item.category),
  sqlEnum(item.publishStatus, "PublishStatus"),
  sqlTimestamp(item.publishedAt),
  "admin_id",
  "admin_id",
  "NOW()",
  "NOW()"
]);

const supportProjectCenterRows = supportProjects.flatMap((project) =>
  project.centerNames.map((centerName) => [
    sqlString(`${project.id}:${centerName}`),
    sqlString(project.id),
    `(SELECT id FROM "Center" WHERE "centerName" = ${sqlString(centerName)})`
  ])
);

const activityReportCenterRows = activityReports.flatMap((report) =>
  report.centerNames.map((centerName) => [
    sqlString(`${report.id}:${centerName}`),
    sqlString(report.id),
    `(SELECT id FROM "Center" WHERE "centerName" = ${sqlString(centerName)})`
  ])
);

const activityReportProjectRows = activityReports.flatMap((report) =>
  report.projectIds.map((projectId) => [
    sqlString(`${report.id}:${projectId}`),
    sqlString(report.id),
    sqlString(projectId)
  ])
);

const sql = `-- Neon SQL Editor 用デモ seed
-- 前提:
-- 1. migration 適用済み
-- 2. bootstrap seed 済みで admin ユーザーが存在する
-- 3. loginId = 'admin' の管理者を updatedBy / createdBy に利用する

BEGIN;

DO $seed$
DECLARE
  admin_id TEXT;
BEGIN
  SELECT "id" INTO admin_id
  FROM "User"
  WHERE "loginId" = 'admin'
  LIMIT 1;

  IF admin_id IS NULL THEN
    RAISE EXCEPTION 'Admin user with loginId=admin was not found. Run bootstrap seed first.';
  END IF;

  INSERT INTO "SitePage" (
    "id", "pageKey", "title", "body", "updatedBy", "createdAt", "updatedAt"
  )
  VALUES (
    ${sqlString(sitePage.id)},
    ${sqlEnum(sitePage.pageKey, "SitePageKey")},
    ${sqlString(sitePage.title)},
    ${sqlString(sitePage.body)},
    admin_id,
    NOW(),
    NOW()
  )
  ON CONFLICT ("pageKey") DO UPDATE
  SET
    "title" = EXCLUDED."title",
    "body" = EXCLUDED."body",
    "updatedBy" = admin_id,
    "updatedAt" = NOW();

  INSERT INTO "Center" (
    "id", "centerName", "domain", "summary", "mainActivities", "companyRelation",
    "createdBy", "updatedBy", "createdAt", "updatedAt"
  )
  VALUES
${renderValues(centerRows)}
  ON CONFLICT ("centerName") DO UPDATE
  SET
    "domain" = EXCLUDED."domain",
    "summary" = EXCLUDED."summary",
    "mainActivities" = EXCLUDED."mainActivities",
    "companyRelation" = EXCLUDED."companyRelation",
    "updatedBy" = admin_id,
    "updatedAt" = NOW();

  INSERT INTO "Company" (
    "id", "companyName", "industry", "address", "businessSummary",
    "interestTheme", "contactInfo", "isActive", "createdAt", "updatedAt"
  )
  VALUES
${renderValues(companyRows)}
  ON CONFLICT ("id") DO UPDATE
  SET
    "companyName" = EXCLUDED."companyName",
    "industry" = EXCLUDED."industry",
    "address" = EXCLUDED."address",
    "businessSummary" = EXCLUDED."businessSummary",
    "interestTheme" = EXCLUDED."interestTheme",
    "contactInfo" = EXCLUDED."contactInfo",
    "isActive" = EXCLUDED."isActive",
    "updatedAt" = NOW();

  INSERT INTO "User" (
    "id", "loginId", "email", "passwordHash", "userName", "role", "companyId",
    "status", "mustChangePassword", "createdAt", "updatedAt"
  )
  VALUES (
    ${sqlString(memberDemoUser.id)},
    ${sqlString(memberDemoUser.loginId)},
    ${sqlString(memberDemoUser.email)},
    ${sqlString(memberDemoUser.passwordHash)},
    ${sqlString(memberDemoUser.userName)},
    ${sqlEnum(memberDemoUser.role, "Role")},
    ${sqlString(memberDemoUser.companyId)},
    ${sqlEnum(memberDemoUser.status, "UserStatus")},
    ${sqlBoolean(memberDemoUser.mustChangePassword)},
    NOW(),
    NOW()
  )
  ON CONFLICT ("loginId") DO UPDATE
  SET
    "email" = EXCLUDED."email",
    "passwordHash" = EXCLUDED."passwordHash",
    "userName" = EXCLUDED."userName",
    "role" = EXCLUDED."role",
    "companyId" = EXCLUDED."companyId",
    "status" = EXCLUDED."status",
    "mustChangePassword" = EXCLUDED."mustChangePassword",
    "updatedAt" = NOW();

  DELETE FROM "News"
  WHERE
    "id" NOT IN (${newsItems.map((item) => sqlString(item.id)).join(", ")})
    AND "title" = '会員向けポータルを公開しました'
    AND "category" = 'お知らせ'
    AND "body" = '技術協力会の会員企業向けポータルを公開しました。最新情報や支援プロジェクトを確認できます。'
    AND "createdBy" = admin_id;

  INSERT INTO "News" (
    "id", "title", "body", "category", "publishStatus", "publishedAt",
    "createdBy", "updatedBy", "createdAt", "updatedAt"
  )
  VALUES
${renderValues(newsRows)}
  ON CONFLICT ("id") DO UPDATE
  SET
    "title" = EXCLUDED."title",
    "body" = EXCLUDED."body",
    "category" = EXCLUDED."category",
    "publishStatus" = EXCLUDED."publishStatus",
    "publishedAt" = EXCLUDED."publishedAt",
    "updatedBy" = admin_id,
    "updatedAt" = NOW();

  INSERT INTO "TechSeed" (
    "id", "companyId", "seedName", "seedSummary", "applicationField",
    "usageExample", "strength", "relatedResults", "collaborationTheme",
    "createdAt", "updatedAt"
  )
  VALUES
${renderValues(techSeedRows)}
  ON CONFLICT ("id") DO UPDATE
  SET
    "companyId" = EXCLUDED."companyId",
    "seedName" = EXCLUDED."seedName",
    "seedSummary" = EXCLUDED."seedSummary",
    "applicationField" = EXCLUDED."applicationField",
    "usageExample" = EXCLUDED."usageExample",
    "strength" = EXCLUDED."strength",
    "relatedResults" = EXCLUDED."relatedResults",
    "collaborationTheme" = EXCLUDED."collaborationTheme",
    "updatedAt" = NOW();

  INSERT INTO "SupportProject" (
    "id", "projectName", "summary", "background", "issue", "goal",
    "supportNeeded", "expectedResult", "contactInfo", "publishStatus",
    "publishedAt", "createdBy", "updatedBy", "createdAt", "updatedAt"
  )
  VALUES
${renderValues(supportProjectRows)}
  ON CONFLICT ("id") DO UPDATE
  SET
    "projectName" = EXCLUDED."projectName",
    "summary" = EXCLUDED."summary",
    "background" = EXCLUDED."background",
    "issue" = EXCLUDED."issue",
    "goal" = EXCLUDED."goal",
    "supportNeeded" = EXCLUDED."supportNeeded",
    "expectedResult" = EXCLUDED."expectedResult",
    "contactInfo" = EXCLUDED."contactInfo",
    "publishStatus" = EXCLUDED."publishStatus",
    "publishedAt" = EXCLUDED."publishedAt",
    "updatedBy" = admin_id,
    "updatedAt" = NOW();

  INSERT INTO "ActivityReport" (
    "id", "title", "summary", "body", "category", "publishStatus",
    "publishedAt", "createdBy", "updatedBy", "createdAt", "updatedAt"
  )
  VALUES
${renderValues(activityReportRows)}
  ON CONFLICT ("id") DO UPDATE
  SET
    "title" = EXCLUDED."title",
    "summary" = EXCLUDED."summary",
    "body" = EXCLUDED."body",
    "category" = EXCLUDED."category",
    "publishStatus" = EXCLUDED."publishStatus",
    "publishedAt" = EXCLUDED."publishedAt",
    "updatedBy" = admin_id,
    "updatedAt" = NOW();

  DELETE FROM "SupportProjectCenter"
  WHERE "supportProjectId" IN (${supportProjects.map((item) => sqlString(item.id)).join(", ")});

  INSERT INTO "SupportProjectCenter" (
    "id", "supportProjectId", "centerId"
  )
  VALUES
${renderValues(supportProjectCenterRows)}
  ON CONFLICT ("supportProjectId", "centerId") DO NOTHING;

  DELETE FROM "ActivityReportCenter"
  WHERE "activityReportId" IN (${activityReports.map((item) => sqlString(item.id)).join(", ")});

  INSERT INTO "ActivityReportCenter" (
    "id", "activityReportId", "centerId"
  )
  VALUES
${renderValues(activityReportCenterRows)}
  ON CONFLICT ("activityReportId", "centerId") DO NOTHING;

  DELETE FROM "ActivityReportProject"
  WHERE "activityReportId" IN (${activityReports.map((item) => sqlString(item.id)).join(", ")});

  INSERT INTO "ActivityReportProject" (
    "id", "activityReportId", "supportProjectId"
  )
  VALUES
${renderValues(activityReportProjectRows)}
  ON CONFLICT ("activityReportId", "supportProjectId") DO NOTHING;
END;
$seed$;

COMMIT;
`;

mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, sql);
console.log(outputPath);
