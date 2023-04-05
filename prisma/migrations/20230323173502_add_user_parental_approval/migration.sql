/*
  Warnings:

  - You are about to drop the column `userId` on the `Twitter` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[twitterId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Twitter" DROP CONSTRAINT "Twitter_userId_fkey";

-- DropIndex
DROP INDEX "Twitter_userId_key";

-- AlterTable
ALTER TABLE "Twitter" DROP COLUMN "userId";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "parentalApproval" BOOLEAN,
ADD COLUMN     "twitterId" TEXT;

-- CreateTable
CREATE TABLE "Activity" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "typeId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Activity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivityType" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "ActivityType_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Activity_userId_idx" ON "Activity"("userId");

-- CreateIndex
CREATE INDEX "Action_postId_idx" ON "Action"("postId");

-- CreateIndex
CREATE INDEX "Action_userId_idx" ON "Action"("userId");

-- CreateIndex
CREATE INDEX "AnalysisItem_status_idx" ON "AnalysisItem"("status");

-- CreateIndex
CREATE INDEX "AnalysisItem_flagged_idx" ON "AnalysisItem"("flagged");

-- CreateIndex
CREATE INDEX "Post_flagged_idx" ON "Post"("flagged");

-- CreateIndex
CREATE INDEX "Post_manualReview_idx" ON "Post"("manualReview");

-- CreateIndex
CREATE UNIQUE INDEX "User_twitterId_key" ON "User"("twitterId");

-- CreateIndex
CREATE INDEX "User_parentalApproval_idx" ON "User"("parentalApproval");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_twitterId_fkey" FOREIGN KEY ("twitterId") REFERENCES "Twitter"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "ActivityType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
