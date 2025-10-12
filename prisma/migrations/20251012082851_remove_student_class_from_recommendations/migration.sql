/*
  Warnings:

  - You are about to drop the column `classId` on the `recommendations` table. All the data in the column will be lost.
  - You are about to drop the column `studentId` on the `recommendations` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."recommendations" DROP CONSTRAINT "recommendations_classId_fkey";

-- DropForeignKey
ALTER TABLE "public"."recommendations" DROP CONSTRAINT "recommendations_studentId_fkey";

-- AlterTable
ALTER TABLE "public"."recommendations" DROP COLUMN "classId",
DROP COLUMN "studentId";
