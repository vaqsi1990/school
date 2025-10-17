/*
  Warnings:

  - You are about to alter the column `duration` on the `olympiad_events` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.

*/
-- AlterTable
ALTER TABLE "public"."olympiad_events" ALTER COLUMN "duration" DROP NOT NULL,
ALTER COLUMN "duration" DROP DEFAULT,
ALTER COLUMN "duration" SET DATA TYPE INTEGER;
