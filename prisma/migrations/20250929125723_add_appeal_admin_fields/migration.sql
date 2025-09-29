-- AlterTable
ALTER TABLE "public"."appeals" ADD COLUMN     "adminComment" TEXT,
ADD COLUMN     "processedAt" TIMESTAMP(3),
ADD COLUMN     "processedBy" TEXT;
