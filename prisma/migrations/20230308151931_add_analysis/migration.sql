-- CreateEnum
CREATE TYPE "AnalysisModelType" AS ENUM ('TEXT');

-- CreateTable
CREATE TABLE "Analysis" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "postId" TEXT NOT NULL,

    CONSTRAINT "Analysis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnalysisModel" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" "AnalysisModelType" NOT NULL,
    "analysisId" TEXT NOT NULL,

    CONSTRAINT "AnalysisModel_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Analysis_postId_key" ON "Analysis"("postId");

-- CreateIndex
CREATE INDEX "Analysis_postId_idx" ON "Analysis"("postId");

-- CreateIndex
CREATE INDEX "AnalysisModel_analysisId_idx" ON "AnalysisModel"("analysisId");

-- CreateIndex
CREATE INDEX "Media_postId_idx" ON "Media"("postId");

-- CreateIndex
CREATE INDEX "Post_twitterId_idx" ON "Post"("twitterId");

-- AddForeignKey
ALTER TABLE "Analysis" ADD CONSTRAINT "Analysis_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnalysisModel" ADD CONSTRAINT "AnalysisModel_analysisId_fkey" FOREIGN KEY ("analysisId") REFERENCES "Analysis"("id") ON DELETE CASCADE ON UPDATE CASCADE;
