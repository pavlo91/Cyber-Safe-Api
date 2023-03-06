-- CreateTable
CREATE TABLE "Twitter" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "indexedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "twitterId" TEXT NOT NULL,
    "userId" TEXT,

    CONSTRAINT "Twitter_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Twitter_twitterId_key" ON "Twitter"("twitterId");

-- CreateIndex
CREATE UNIQUE INDEX "Twitter_userId_key" ON "Twitter"("userId");

-- AddForeignKey
ALTER TABLE "Twitter" ADD CONSTRAINT "Twitter_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
