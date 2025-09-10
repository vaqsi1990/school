-- AlterTable
ALTER TABLE "public"."olympiad_events" ADD COLUMN     "showDetailedReview" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "public"."olympiads" ADD COLUMN     "showDetailedReview" BOOLEAN NOT NULL DEFAULT false;
