/*
  Warnings:

  - You are about to drop the column `score` on the `student_olympiads` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[subjectId,grade,name]` on the table `olympiads` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[olympiadId,order]` on the table `rounds` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[studentId,questionId,olympiadId]` on the table `student_answers` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `roundNumber` to the `olympiad_questions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `grade` to the `olympiads` table without a default value. This is not possible if the table is not empty.
  - Added the required column `round` to the `questions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `maxQuestions` to the `rounds` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "public"."student_answers_studentId_questionId_key";

-- AlterTable
ALTER TABLE "public"."olympiad_questions" ADD COLUMN     "roundNumber" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "public"."olympiads" ADD COLUMN     "grade" INTEGER NOT NULL,
ADD COLUMN     "maxParticipants" INTEGER;

-- AlterTable
ALTER TABLE "public"."questions" ADD COLUMN     "image" TEXT,
ADD COLUMN     "round" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "public"."rounds" ADD COLUMN     "maxQuestions" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "public"."student_answers" ADD COLUMN     "olympiadId" TEXT,
ADD COLUMN     "roundNumber" INTEGER;

-- AlterTable
ALTER TABLE "public"."student_olympiads" DROP COLUMN "score",
ADD COLUMN     "currentRound" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "round1Score" INTEGER,
ADD COLUMN     "round2Score" INTEGER,
ADD COLUMN     "round3Score" INTEGER,
ADD COLUMN     "totalScore" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "olympiads_subjectId_grade_name_key" ON "public"."olympiads"("subjectId", "grade", "name");

-- CreateIndex
CREATE UNIQUE INDEX "rounds_olympiadId_order_key" ON "public"."rounds"("olympiadId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "student_answers_studentId_questionId_olympiadId_key" ON "public"."student_answers"("studentId", "questionId", "olympiadId");
