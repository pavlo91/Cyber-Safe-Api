/*
  Warnings:

  - A unique constraint covering the columns `[tiktokId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "tiktokId" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "tiktokId" TEXT;

-- CreateTable
CREATE TABLE "TikTok" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "indexedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tiktokId" TEXT NOT NULL,
    "tiktokUsername" TEXT NOT NULL,
    "tiktokAccessToken" TEXT NOT NULL,
    "tiktokRefreshToken" TEXT NOT NULL,
    "tiktokTokenExpiresAt" TIMESTAMP(3) NOT NULL,
    "tiktokRefreshTokenExpiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TikTok_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TikTok_tiktokId_key" ON "TikTok"("tiktokId");

-- CreateIndex
CREATE UNIQUE INDEX "User_tiktokId_key" ON "User"("tiktokId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_tiktokId_fkey" FOREIGN KEY ("tiktokId") REFERENCES "TikTok"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_tiktokId_fkey" FOREIGN KEY ("tiktokId") REFERENCES "TikTok"("id") ON DELETE SET NULL ON UPDATE CASCADE;
