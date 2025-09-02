/*
  Warnings:

  - Added the required column `createdByType` to the `question_packages` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."question_packages" ADD COLUMN     "createdByType" "public"."UserType" NOT NULL;

-- RenameForeignKey
ALTER TABLE "public"."question_packages" RENAME CONSTRAINT "question_packages_createdBy_fkey" TO "question_packages_createdBy_admin_fkey";

-- AddForeignKey
ALTER TABLE "public"."question_packages" ADD CONSTRAINT "question_packages_createdBy_teacher_fkey" FOREIGN KEY ("createdBy") REFERENCES "public"."teachers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
