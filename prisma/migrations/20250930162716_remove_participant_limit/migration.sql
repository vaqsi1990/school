-- AlterTable
ALTER TABLE "public"."olympiad_events" ALTER COLUMN "maxParticipants" DROP NOT NULL,
ALTER COLUMN "maxParticipants" SET DEFAULT 999999;
