-- AlterEnum
ALTER TYPE "AnalysisModelType" ADD VALUE 'MEDIA';

-- AlterTable
ALTER TABLE "AnalysisModel" ADD COLUMN     "blobName" TEXT;
