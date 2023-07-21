-- AlterTable
ALTER TABLE "PendingPhoneNumbers" ALTER COLUMN "expiresAt" SET DEFAULT now() + interval '15 minutes';

-- CreateIndex
CREATE INDEX "PendingPhoneNumbers_expiresAt_idx" ON "PendingPhoneNumbers"("expiresAt");

-- CreateIndex
CREATE INDEX "PendingPhoneNumbers_token_idx" ON "PendingPhoneNumbers"("token");

-- CreateIndex
CREATE INDEX "PendingPhoneNumbers_phoneNumber_idx" ON "PendingPhoneNumbers"("phoneNumber");

-- CreateIndex
CREATE INDEX "PendingPhoneNumbers_userId_idx" ON "PendingPhoneNumbers"("userId");
