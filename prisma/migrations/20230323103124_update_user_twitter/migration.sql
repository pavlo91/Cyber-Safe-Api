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
ALTER TABLE "User" ADD COLUMN     "twitterId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_twitterId_key" ON "User"("twitterId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_twitterId_fkey" FOREIGN KEY ("twitterId") REFERENCES "Twitter"("id") ON DELETE SET NULL ON UPDATE CASCADE;
