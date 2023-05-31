-- AlterIndex
ALTER INDEX "Upload_blobName_key" RENAME TO "Upload_blobURL_key";

-- AlterTable
ALTER TABLE "Media" RENAME COLUMN "blobName" TO "blobURL";

-- AlterTable
ALTER TABLE "Post" RENAME COLUMN "blobName" TO "blobURL";

-- AlterTable
ALTER TABLE "Upload" RENAME COLUMN "blobName" TO "blobURL";
