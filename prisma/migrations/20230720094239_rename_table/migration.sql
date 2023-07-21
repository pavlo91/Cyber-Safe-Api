/*
  Warnings:

  - You are about to drop the `EmailSetting` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "NotificationSettingType" AS ENUM ('BOOLEAN');

-- DropForeignKey
ALTER TABLE "EmailSetting" DROP CONSTRAINT "EmailSetting_userId_fkey";

-- AlterTable
ALTER TABLE "PendingPhoneNumbers" ALTER COLUMN "expiresAt" SET DEFAULT now() + interval '15 minutes';

-- DropTable
DROP TABLE "EmailSetting";

-- DropEnum
DROP TYPE "EmailSettingType";

-- CreateTable
CREATE TABLE "NotificationSetting" (
    "id" TEXT NOT NULL,
    "type" "NotificationSettingType" NOT NULL,
    "boolean" BOOLEAN,
    "userId" TEXT NOT NULL,

    CONSTRAINT "NotificationSetting_pkey" PRIMARY KEY ("id","userId")
);

-- CreateIndex
CREATE INDEX "NotificationSetting_userId_idx" ON "NotificationSetting"("userId");

-- AddForeignKey
ALTER TABLE "NotificationSetting" ADD CONSTRAINT "NotificationSetting_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
