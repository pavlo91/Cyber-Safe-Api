ALTER TABLE "Image" RENAME COLUMN "teamId" TO "schoolId";
ALTER TABLE "Image" RENAME CONSTRAINT "Image_teamId_fkey" TO "Image_schoolId_fkey";
ALTER INDEX "Image_teamId_key" RENAME TO "Image_schoolId_key";
ALTER INDEX "Image_teamId_idx" RENAME TO "Image_schoolId_idx";

ALTER TABLE "Address" RENAME COLUMN "teamId" TO "schoolId";
ALTER TABLE "Address" RENAME CONSTRAINT "Address_teamId_fkey" TO "Address_schoolId_fkey";
ALTER INDEX "Address_teamId_key" RENAME TO "Address_schoolId_key";
ALTER INDEX "Address_teamId_idx" RENAME TO "Address_schoolId_idx";

ALTER TABLE "Notification" RENAME COLUMN "teamId" TO "schoolId";
ALTER TABLE "Notification" RENAME CONSTRAINT "Notification_teamId_fkey" TO "Notification_schoolId_fkey";
ALTER INDEX "Notification_teamId_idx" RENAME TO "Notification_schoolId_idx";

ALTER TABLE "TeamUserRole" RENAME TO "SchoolUserRole";
ALTER TABLE "SchoolUserRole" RENAME COLUMN "teamId" TO "schoolId";
ALTER TABLE "SchoolUserRole" RENAME CONSTRAINT "TeamUserRole_pkey" TO "SchoolUserRole_pkey";
ALTER TABLE "SchoolUserRole" RENAME CONSTRAINT "TeamUserRole_userRoleId_fkey" TO "SchoolUserRole_userRoleId_fkey";
ALTER TABLE "SchoolUserRole" RENAME CONSTRAINT "TeamUserRole_teamId_fkey" TO "SchoolUserRole_schoolId_fkey";
ALTER INDEX "TeamUserRole_teamId_idx" RENAME TO "SchoolUserRole_schoolId_idx";
ALTER INDEX "TeamUserRole_userRoleId_idx" RENAME TO "SchoolUserRole_userRoleId_idx";
ALTER INDEX "TeamUserRole_userRoleId_key" RENAME TO "SchoolUserRole_userRoleId_key";

ALTER TABLE "Team" RENAME TO "School";
ALTER TABLE "School" RENAME CONSTRAINT "Team_pkey" TO "School_pkey";
