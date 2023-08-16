/*
  Warnings:

  - A unique constraint covering the columns `[token]` on the table `Device` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Device_token_userId_key";

-- AlterTable
ALTER TABLE "PendingPhoneNumbers" ALTER COLUMN "expiresAt" SET DEFAULT now() + interval '15 minutes';

-- CreateIndex
CREATE UNIQUE INDEX "Device_token_key" ON "Device"("token");
