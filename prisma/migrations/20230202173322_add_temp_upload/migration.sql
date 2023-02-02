-- DropIndex
DROP INDEX "Address_schoolId_idx";

-- DropIndex
DROP INDEX "Image_schoolId_idx";

-- DropIndex
DROP INDEX "Image_userId_idx";

-- DropIndex
DROP INDEX "ParentUserRole_userRoleId_idx";

-- DropIndex
DROP INDEX "SchoolUserRole_userRoleId_idx";

-- CreateTable
CREATE TABLE "TempUpload" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "blobName" TEXT NOT NULL,
    "userId" TEXT,

    CONSTRAINT "TempUpload_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TempUpload_blobName_key" ON "TempUpload"("blobName");

-- CreateIndex
CREATE INDEX "TempUpload_userId_idx" ON "TempUpload"("userId");

-- AddForeignKey
ALTER TABLE "TempUpload" ADD CONSTRAINT "TempUpload_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
