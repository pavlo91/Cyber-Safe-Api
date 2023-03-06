/*
  Warnings:

  - Added the required column `twitterUsername` to the `Twitter` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Twitter" ADD COLUMN     "twitterUsername" TEXT NOT NULL;
