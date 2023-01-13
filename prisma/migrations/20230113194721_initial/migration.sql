-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "citext";

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('STAFF', 'COACH', 'ATHLETE', 'PARENT');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "uuid" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "email" CITEXT NOT NULL,
    "emailConfirmed" BOOLEAN NOT NULL DEFAULT false,
    "password" TEXT,
    "passwordToken" TEXT,
    "name" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Team" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,

    CONSTRAINT "Team_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserRole" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "Role" NOT NULL,

    CONSTRAINT "UserRole_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeamUserRole" (
    "teamId" TEXT NOT NULL,
    "userRoleId" TEXT NOT NULL,

    CONSTRAINT "TeamUserRole_pkey" PRIMARY KEY ("teamId","userRoleId")
);

-- CreateTable
CREATE TABLE "ParentUserRole" (
    "childUserId" TEXT NOT NULL,
    "userRoleId" TEXT NOT NULL,
    "relation" TEXT,

    CONSTRAINT "ParentUserRole_pkey" PRIMARY KEY ("childUserId","userRoleId")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_uuid_key" ON "User"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_passwordToken_key" ON "User"("passwordToken");

-- CreateIndex
CREATE INDEX "User_emailConfirmed_idx" ON "User"("emailConfirmed");

-- CreateIndex
CREATE INDEX "UserRole_userId_idx" ON "UserRole"("userId");

-- CreateIndex
CREATE INDEX "UserRole_role_idx" ON "UserRole"("role");

-- CreateIndex
CREATE UNIQUE INDEX "TeamUserRole_userRoleId_key" ON "TeamUserRole"("userRoleId");

-- CreateIndex
CREATE INDEX "TeamUserRole_teamId_idx" ON "TeamUserRole"("teamId");

-- CreateIndex
CREATE INDEX "TeamUserRole_userRoleId_idx" ON "TeamUserRole"("userRoleId");

-- CreateIndex
CREATE UNIQUE INDEX "ParentUserRole_userRoleId_key" ON "ParentUserRole"("userRoleId");

-- CreateIndex
CREATE INDEX "ParentUserRole_childUserId_idx" ON "ParentUserRole"("childUserId");

-- CreateIndex
CREATE INDEX "ParentUserRole_userRoleId_idx" ON "ParentUserRole"("userRoleId");

-- AddForeignKey
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamUserRole" ADD CONSTRAINT "TeamUserRole_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamUserRole" ADD CONSTRAINT "TeamUserRole_userRoleId_fkey" FOREIGN KEY ("userRoleId") REFERENCES "UserRole"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParentUserRole" ADD CONSTRAINT "ParentUserRole_childUserId_fkey" FOREIGN KEY ("childUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParentUserRole" ADD CONSTRAINT "ParentUserRole_userRoleId_fkey" FOREIGN KEY ("userRoleId") REFERENCES "UserRole"("id") ON DELETE CASCADE ON UPDATE CASCADE;
