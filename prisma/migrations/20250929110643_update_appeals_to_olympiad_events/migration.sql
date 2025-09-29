/*
  Warnings:

  - You are about to drop the column `testResultId` on the `appeals` table. All the data in the column will be lost.
  - Added the required column `studentOlympiadEventId` to the `appeals` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."appeals" DROP CONSTRAINT "appeals_testResultId_fkey";

-- AlterTable
ALTER TABLE "public"."appeals" DROP COLUMN "testResultId",
ADD COLUMN     "studentOlympiadEventId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."appeals" ADD CONSTRAINT "appeals_studentOlympiadEventId_fkey" FOREIGN KEY ("studentOlympiadEventId") REFERENCES "public"."student_olympiad_events"("id") ON DELETE CASCADE ON UPDATE CASCADE;
