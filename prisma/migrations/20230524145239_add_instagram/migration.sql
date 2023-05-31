/*
  Warnings:

  - A unique constraint covering the columns `[instagramId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "instagramId" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "instagramId" TEXT;

-- CreateTable
CREATE TABLE "Instagram" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "indexedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "instagramId" TEXT NOT NULL,
    "instagramUsername" TEXT NOT NULL,
    "instagramAccessToken" TEXT NOT NULL,
    "instagramTokenExpiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Instagram_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Instagram_instagramId_key" ON "Instagram"("instagramId");

-- CreateIndex
CREATE UNIQUE INDEX "User_instagramId_key" ON "User"("instagramId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_instagramId_fkey" FOREIGN KEY ("instagramId") REFERENCES "Instagram"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_instagramId_fkey" FOREIGN KEY ("instagramId") REFERENCES "Instagram"("id") ON DELETE SET NULL ON UPDATE CASCADE;
