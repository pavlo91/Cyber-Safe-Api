/*
  Warnings:

  - Made the column `userId` on table `Twitter` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Twitter" ALTER COLUMN "userId" SET NOT NULL;
