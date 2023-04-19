-- CreateTable
CREATE TABLE "ParentConsent" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "parentUserId" TEXT NOT NULL,
    "childUserId" TEXT NOT NULL,
    "signatureId" TEXT,
    "version" TEXT NOT NULL,
    "ip" TEXT NOT NULL,

    CONSTRAINT "ParentConsent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ParentConsent_signatureId_key" ON "ParentConsent"("signatureId");

-- AddForeignKey
ALTER TABLE "ParentConsent" ADD CONSTRAINT "ParentConsent_parentUserId_fkey" FOREIGN KEY ("parentUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParentConsent" ADD CONSTRAINT "ParentConsent_childUserId_fkey" FOREIGN KEY ("childUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParentConsent" ADD CONSTRAINT "ParentConsent_signatureId_fkey" FOREIGN KEY ("signatureId") REFERENCES "Image"("id") ON DELETE SET NULL ON UPDATE CASCADE;
