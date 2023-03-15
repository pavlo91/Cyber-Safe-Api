-- CreateEnum
CREATE TYPE "EmailSettingType" AS ENUM ('BOOLEAN');

-- CreateEnum
CREATE TYPE "MediaType" AS ENUM ('IMAGE', 'VIDEO');

-- CreateEnum
CREATE TYPE "AnalysisItemType" AS ENUM ('TEXT', 'MEDIA');

-- CreateEnum
CREATE TYPE "AnalysisItemStatus" AS ENUM ('IN_PROGRESS', 'SUCCEEDED', 'FAILED');

-- CreateTable
CREATE TABLE "EmailSetting" (
    "id" TEXT NOT NULL,
    "type" "EmailSettingType" NOT NULL,
    "boolean" BOOLEAN,
    "userId" TEXT NOT NULL,

    CONSTRAINT "EmailSetting_pkey" PRIMARY KEY ("id","userId")
);

-- CreateTable
CREATE TABLE "Twitter" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "indexedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "twitterId" TEXT NOT NULL,
    "twitterUsername" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Twitter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Post" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "externalId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "blobName" TEXT,
    "twitterId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Media" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "externalId" TEXT NOT NULL,
    "type" "MediaType" NOT NULL,
    "mime" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "duration" INTEGER NOT NULL,
    "blobName" TEXT,
    "postId" TEXT NOT NULL,

    CONSTRAINT "Media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Analysis" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "postId" TEXT NOT NULL,

    CONSTRAINT "Analysis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnalysisItem" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" "AnalysisItemType" NOT NULL,
    "status" "AnalysisItemStatus" NOT NULL,
    "error" TEXT,
    "source" TEXT NOT NULL,
    "flagged" BOOLEAN NOT NULL DEFAULT false,
    "jobId" TEXT,
    "analysisId" TEXT NOT NULL,

    CONSTRAINT "AnalysisItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EmailSetting_userId_idx" ON "EmailSetting"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Twitter_twitterId_key" ON "Twitter"("twitterId");

-- CreateIndex
CREATE UNIQUE INDEX "Twitter_userId_key" ON "Twitter"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Post_externalId_key" ON "Post"("externalId");

-- CreateIndex
CREATE INDEX "Post_twitterId_idx" ON "Post"("twitterId");

-- CreateIndex
CREATE INDEX "Post_userId_idx" ON "Post"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Media_externalId_key" ON "Media"("externalId");

-- CreateIndex
CREATE INDEX "Media_postId_idx" ON "Media"("postId");

-- CreateIndex
CREATE UNIQUE INDEX "Analysis_postId_key" ON "Analysis"("postId");

-- CreateIndex
CREATE INDEX "Analysis_postId_idx" ON "Analysis"("postId");

-- CreateIndex
CREATE UNIQUE INDEX "AnalysisItem_jobId_key" ON "AnalysisItem"("jobId");

-- CreateIndex
CREATE INDEX "AnalysisItem_analysisId_idx" ON "AnalysisItem"("analysisId");

-- AddForeignKey
ALTER TABLE "EmailSetting" ADD CONSTRAINT "EmailSetting_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Twitter" ADD CONSTRAINT "Twitter_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_twitterId_fkey" FOREIGN KEY ("twitterId") REFERENCES "Twitter"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Analysis" ADD CONSTRAINT "Analysis_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnalysisItem" ADD CONSTRAINT "AnalysisItem_analysisId_fkey" FOREIGN KEY ("analysisId") REFERENCES "Analysis"("id") ON DELETE CASCADE ON UPDATE CASCADE;
