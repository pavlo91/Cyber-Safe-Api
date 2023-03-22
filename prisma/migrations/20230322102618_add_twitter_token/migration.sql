/*
  Warnings:

  - Added the required column `expiresAt` to the `Twitter` table without a default value. This is not possible if the table is not empty.
  - Added the required column `refreshToken` to the `Twitter` table without a default value. This is not possible if the table is not empty.
  - Added the required column `token` to the `Twitter` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Twitter" ADD COLUMN     "expiresAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "refreshToken" TEXT NOT NULL,
ADD COLUMN     "token" TEXT NOT NULL;
