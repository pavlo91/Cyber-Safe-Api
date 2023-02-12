/*
  Warnings:

  - A unique constraint covering the columns `[newEmailToken]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "newEmail" TEXT,
ADD COLUMN     "newEmailToken" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_newEmailToken_key" ON "User"("newEmailToken");
