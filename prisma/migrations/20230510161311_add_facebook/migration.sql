/*
  Warnings:

  - You are about to drop the column `expiresAt` on the `Twitter` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[facebookId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "facebookId" TEXT,
ALTER COLUMN "twitterId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Twitter" DROP COLUMN "expiresAt";
ALTER TABLE "Twitter" RENAME COLUMN "token" TO "twitterToken";
ALTER TABLE "Twitter" RENAME COLUMN "refreshToken" TO "twitterTokenSecret";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "facebookId" TEXT;

-- CreateTable
CREATE TABLE "Facebook" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "indexedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "facebookId" TEXT NOT NULL,
    "facebookUsername" TEXT NOT NULL,
    "facebookToken" TEXT NOT NULL,
    "facebookTokenExpiration" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Facebook_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Facebook_facebookId_key" ON "Facebook"("facebookId");

-- CreateIndex
CREATE UNIQUE INDEX "User_facebookId_key" ON "User"("facebookId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_facebookId_fkey" FOREIGN KEY ("facebookId") REFERENCES "Facebook"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_facebookId_fkey" FOREIGN KEY ("facebookId") REFERENCES "Facebook"("id") ON DELETE CASCADE ON UPDATE CASCADE;
