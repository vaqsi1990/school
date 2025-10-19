/*
  Warnings:

  - You are about to drop the column `location` on the `calendar_events` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."calendar_events" DROP COLUMN "location";
