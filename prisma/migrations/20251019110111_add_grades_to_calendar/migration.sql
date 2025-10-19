-- AlterTable
ALTER TABLE "public"."calendar_events" ADD COLUMN     "grades" INTEGER[] DEFAULT ARRAY[]::INTEGER[];
