-- CreateEnum
CREATE TYPE "EmailSettingType" AS ENUM ('BOOLEAN');

-- CreateTable
CREATE TABLE "EmailSetting" (
    "id" TEXT NOT NULL,
    "type" "EmailSettingType" NOT NULL,
    "boolean" BOOLEAN,
    "userId" TEXT NOT NULL,

    CONSTRAINT "EmailSetting_pkey" PRIMARY KEY ("id","userId")
);

-- CreateIndex
CREATE INDEX "EmailSetting_userId_idx" ON "EmailSetting"("userId");

-- AddForeignKey
ALTER TABLE "EmailSetting" ADD CONSTRAINT "EmailSetting_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
