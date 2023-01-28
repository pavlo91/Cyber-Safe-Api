-- CreateEnum
CREATE TYPE "NotificationObjectType" AS ENUM ('NONE', 'USER', 'TEAM');

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "unread" BOOLEAN NOT NULL DEFAULT true,
    "message" TEXT NOT NULL,
    "objectType" "NotificationObjectType" NOT NULL DEFAULT 'NONE',
    "objectId" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Notification_unread_idx" ON "Notification"("unread");

-- CreateIndex
CREATE INDEX "Notification_objectId_idx" ON "Notification"("objectId");

-- CreateIndex
CREATE INDEX "Notification_userId_idx" ON "Notification"("userId");

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
