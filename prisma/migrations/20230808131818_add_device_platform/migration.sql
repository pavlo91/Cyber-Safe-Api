-- AlterTable
ALTER TABLE "Device" ADD COLUMN     "platform" TEXT;

-- AlterTable
ALTER TABLE "PendingPhoneNumbers" ALTER COLUMN "expiresAt" SET DEFAULT now() + interval '15 minutes';
