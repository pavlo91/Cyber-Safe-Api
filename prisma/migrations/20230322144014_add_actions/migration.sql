/*
  Warnings:

  - Added the required column `expiresAt` to the `Twitter` table without a default value. This is not possible if the table is not empty.
  - Added the required column `refreshToken` to the `Twitter` table without a default value. This is not possible if the table is not empty.
  - Added the required column `token` to the `Twitter` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "AnalysisItem" ADD COLUMN     "manualReview" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Twitter" ADD COLUMN     "expiresAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "refreshToken" TEXT NOT NULL,
ADD COLUMN     "token" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Action" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "typeId" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "userId" TEXT,

    CONSTRAINT "Action_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActionType" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "ActionType_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Action" ADD CONSTRAINT "Action_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "ActionType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Action" ADD CONSTRAINT "Action_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Action" ADD CONSTRAINT "Action_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
