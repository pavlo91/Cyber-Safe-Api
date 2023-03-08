/*
  Warnings:

  - You are about to drop the column `blobName` on the `AnalysisModel` table. All the data in the column will be lost.
  - Added the required column `source` to the `AnalysisModel` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "AnalysisModel" DROP COLUMN "blobName",
ADD COLUMN     "source" TEXT NOT NULL;
