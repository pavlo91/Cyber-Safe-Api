-- CreateEnum
CREATE TYPE "GlobalSettingType" AS ENUM ('BOOLEAN', 'INTEGER', 'STRING');

-- CreateTable
CREATE TABLE "GlobalSetting" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "GlobalSettingType" NOT NULL,
    "boolean" BOOLEAN,
    "integer" INTEGER,
    "string" TEXT,

    CONSTRAINT "GlobalSetting_pkey" PRIMARY KEY ("id")
);
