-- CreateTable
CREATE TABLE "Address" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "street" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "zip" TEXT NOT NULL,
    "teamId" TEXT,

    CONSTRAINT "Address_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Image" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "url" TEXT NOT NULL,
    "userId" TEXT,
    "teamId" TEXT,

    CONSTRAINT "Image_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Address_teamId_key" ON "Address"("teamId");

-- CreateIndex
CREATE INDEX "Address_teamId_idx" ON "Address"("teamId");

-- CreateIndex
CREATE UNIQUE INDEX "Image_userId_key" ON "Image"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Image_teamId_key" ON "Image"("teamId");

-- CreateIndex
CREATE INDEX "Image_userId_idx" ON "Image"("userId");

-- CreateIndex
CREATE INDEX "Image_teamId_idx" ON "Image"("teamId");

-- AddForeignKey
ALTER TABLE "Address" ADD CONSTRAINT "Address_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Image" ADD CONSTRAINT "Image_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Image" ADD CONSTRAINT "Image_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;
