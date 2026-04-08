-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'MEMBER');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'DISABLED');

-- CreateEnum
CREATE TYPE "PublishStatus" AS ENUM ('DRAFT', 'PUBLISHED');

-- CreateEnum
CREATE TYPE "SitePageKey" AS ENUM ('ABOUT_TERMS');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "loginId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "userName" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "companyId" TEXT,
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "mustChangePassword" BOOLEAN NOT NULL DEFAULT true,
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Company" (
    "id" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "industry" TEXT NOT NULL,
    "address" TEXT,
    "businessSummary" TEXT,
    "interestTheme" TEXT,
    "contactInfo" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TechSeed" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "seedName" TEXT NOT NULL,
    "seedSummary" TEXT NOT NULL,
    "applicationField" TEXT,
    "usageExample" TEXT,
    "strength" TEXT,
    "relatedResults" TEXT,
    "collaborationTheme" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TechSeed_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "News" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "publishStatus" "PublishStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "createdBy" TEXT NOT NULL,
    "updatedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "News_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Center" (
    "id" TEXT NOT NULL,
    "centerName" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "mainActivities" TEXT NOT NULL,
    "companyRelation" TEXT,
    "createdBy" TEXT NOT NULL,
    "updatedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Center_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivityReport" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "category" TEXT,
    "publishStatus" "PublishStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "createdBy" TEXT NOT NULL,
    "updatedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ActivityReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SupportProject" (
    "id" TEXT NOT NULL,
    "projectName" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "background" TEXT NOT NULL,
    "issue" TEXT NOT NULL,
    "goal" TEXT NOT NULL,
    "supportNeeded" TEXT NOT NULL,
    "expectedResult" TEXT,
    "contactInfo" TEXT,
    "publishStatus" "PublishStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "createdBy" TEXT NOT NULL,
    "updatedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SupportProject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivityReportCenter" (
    "id" TEXT NOT NULL,
    "activityReportId" TEXT NOT NULL,
    "centerId" TEXT NOT NULL,

    CONSTRAINT "ActivityReportCenter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SupportProjectCenter" (
    "id" TEXT NOT NULL,
    "supportProjectId" TEXT NOT NULL,
    "centerId" TEXT NOT NULL,

    CONSTRAINT "SupportProjectCenter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivityReportProject" (
    "id" TEXT NOT NULL,
    "activityReportId" TEXT NOT NULL,
    "supportProjectId" TEXT NOT NULL,

    CONSTRAINT "ActivityReportProject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SitePage" (
    "id" TEXT NOT NULL,
    "pageKey" "SitePageKey" NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "updatedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SitePage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_loginId_key" ON "User"("loginId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Session_tokenHash_key" ON "Session"("tokenHash");

-- CreateIndex
CREATE UNIQUE INDEX "Center_centerName_key" ON "Center"("centerName");

-- CreateIndex
CREATE UNIQUE INDEX "ActivityReportCenter_activityReportId_centerId_key" ON "ActivityReportCenter"("activityReportId", "centerId");

-- CreateIndex
CREATE UNIQUE INDEX "SupportProjectCenter_supportProjectId_centerId_key" ON "SupportProjectCenter"("supportProjectId", "centerId");

-- CreateIndex
CREATE UNIQUE INDEX "ActivityReportProject_activityReportId_supportProjectId_key" ON "ActivityReportProject"("activityReportId", "supportProjectId");

-- CreateIndex
CREATE UNIQUE INDEX "SitePage_pageKey_key" ON "SitePage"("pageKey");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TechSeed" ADD CONSTRAINT "TechSeed_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityReportCenter" ADD CONSTRAINT "ActivityReportCenter_activityReportId_fkey" FOREIGN KEY ("activityReportId") REFERENCES "ActivityReport"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityReportCenter" ADD CONSTRAINT "ActivityReportCenter_centerId_fkey" FOREIGN KEY ("centerId") REFERENCES "Center"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupportProjectCenter" ADD CONSTRAINT "SupportProjectCenter_supportProjectId_fkey" FOREIGN KEY ("supportProjectId") REFERENCES "SupportProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupportProjectCenter" ADD CONSTRAINT "SupportProjectCenter_centerId_fkey" FOREIGN KEY ("centerId") REFERENCES "Center"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityReportProject" ADD CONSTRAINT "ActivityReportProject_activityReportId_fkey" FOREIGN KEY ("activityReportId") REFERENCES "ActivityReport"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityReportProject" ADD CONSTRAINT "ActivityReportProject_supportProjectId_fkey" FOREIGN KEY ("supportProjectId") REFERENCES "SupportProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;
