/*
  Warnings:

  - A unique constraint covering the columns `[schoolCoverId]` on the table `Image` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Image" ADD COLUMN     "schoolCoverId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Image_schoolCoverId_key" ON "Image"("schoolCoverId");

-- AddForeignKey
ALTER TABLE "Image" ADD CONSTRAINT "Image_schoolCoverId_fkey" FOREIGN KEY ("schoolCoverId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;
