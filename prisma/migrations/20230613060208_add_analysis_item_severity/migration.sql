/*
  Warnings:

  - You are about to drop the column `flagged` on the `AnalysisItem` table. All the data in the column will be lost.
  - You are about to drop the column `flagged` on the `Post` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "AnalysisItemSeverity" AS ENUM ('NONE', 'LOW', 'HIGH');

-- DropIndex
DROP INDEX "AnalysisItem_flagged_idx";

-- DropIndex
DROP INDEX "Post_flagged_idx";

-- AlterTable
ALTER TABLE "AnalysisItem" DROP COLUMN "flagged",
ADD COLUMN     "severity" "AnalysisItemSeverity" NOT NULL DEFAULT 'NONE';

-- AlterTable
ALTER TABLE "Post" DROP COLUMN "flagged",
ADD COLUMN     "severity" "AnalysisItemSeverity" NOT NULL DEFAULT 'NONE';

-- CreateIndex
CREATE INDEX "AnalysisItem_severity_idx" ON "AnalysisItem"("severity");

-- CreateIndex
CREATE INDEX "Post_severity_idx" ON "Post"("severity");
