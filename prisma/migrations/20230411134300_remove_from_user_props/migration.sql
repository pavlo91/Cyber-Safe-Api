/*
  Warnings:

  - You are about to drop the column `passwordToken` on the `User` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "User_emailConfirmed_idx";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "emailConfirmed";
