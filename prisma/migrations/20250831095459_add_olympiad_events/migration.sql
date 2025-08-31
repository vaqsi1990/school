/*
  Warnings:

  - The values [SINGLE_ANSWER] on the enum `QuestionType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."QuestionType_new" AS ENUM ('MULTIPLE_CHOICE', 'TRUE_FALSE', 'MATCHING', 'TEXT_ANALYSIS', 'MAP_ANALYSIS', 'OPEN_ENDED', 'CLOSED_ENDED');
ALTER TABLE "public"."questions" ALTER COLUMN "type" TYPE "public"."QuestionType_new" USING ("type"::text::"public"."QuestionType_new");
ALTER TYPE "public"."QuestionType" RENAME TO "QuestionType_old";
ALTER TYPE "public"."QuestionType_new" RENAME TO "QuestionType";
DROP TYPE "public"."QuestionType_old";
COMMIT;

-- AlterTable
ALTER TABLE "public"."questions" ADD COLUMN     "chapterName" TEXT,
ADD COLUMN     "content" TEXT,
ADD COLUMN     "isAutoScored" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "matchingPairs" JSONB,
ADD COLUMN     "maxPoints" INTEGER,
ADD COLUMN     "paragraphName" TEXT,
ADD COLUMN     "rubric" TEXT,
ALTER COLUMN "correctAnswer" DROP NOT NULL;

-- CreateTable
CREATE TABLE "public"."question_packages" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "question_packages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."question_package_questions" (
    "id" TEXT NOT NULL,
    "questionPackageId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "question_package_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."olympiad_events" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "registrationDeadline" TIMESTAMP(3) NOT NULL,
    "maxParticipants" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "rounds" INTEGER NOT NULL DEFAULT 3,
    "subjects" TEXT[],
    "grades" INTEGER[],
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "olympiad_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."student_olympiad_events" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "olympiadEventId" TEXT NOT NULL,
    "startTime" TIMESTAMP(3),
    "endTime" TIMESTAMP(3),
    "currentRound" INTEGER NOT NULL DEFAULT 1,
    "round1Score" INTEGER,
    "round2Score" INTEGER,
    "round3Score" INTEGER,
    "totalScore" INTEGER,
    "status" "public"."ParticipationStatus" NOT NULL DEFAULT 'REGISTERED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "student_olympiad_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."manual_scores" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "olympiadId" TEXT NOT NULL,
    "roundNumber" INTEGER NOT NULL,
    "scoredBy" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "maxScore" DOUBLE PRECISION NOT NULL,
    "feedback" TEXT,
    "scoredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "manual_scores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."_OlympiadEventToQuestionPackage" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_OlympiadEventToQuestionPackage_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "question_package_questions_questionPackageId_questionId_key" ON "public"."question_package_questions"("questionPackageId", "questionId");

-- CreateIndex
CREATE UNIQUE INDEX "student_olympiad_events_studentId_olympiadEventId_key" ON "public"."student_olympiad_events"("studentId", "olympiadEventId");

-- CreateIndex
CREATE UNIQUE INDEX "manual_scores_studentId_questionId_olympiadId_roundNumber_key" ON "public"."manual_scores"("studentId", "questionId", "olympiadId", "roundNumber");

-- CreateIndex
CREATE INDEX "_OlympiadEventToQuestionPackage_B_index" ON "public"."_OlympiadEventToQuestionPackage"("B");

-- AddForeignKey
ALTER TABLE "public"."question_packages" ADD CONSTRAINT "question_packages_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "public"."admins"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."question_package_questions" ADD CONSTRAINT "question_package_questions_questionPackageId_fkey" FOREIGN KEY ("questionPackageId") REFERENCES "public"."question_packages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."question_package_questions" ADD CONSTRAINT "question_package_questions_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "public"."questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."olympiad_events" ADD CONSTRAINT "olympiad_events_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "public"."admins"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."student_olympiad_events" ADD CONSTRAINT "student_olympiad_events_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "public"."students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."student_olympiad_events" ADD CONSTRAINT "student_olympiad_events_olympiadEventId_fkey" FOREIGN KEY ("olympiadEventId") REFERENCES "public"."olympiad_events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."manual_scores" ADD CONSTRAINT "manual_scores_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "public"."students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."manual_scores" ADD CONSTRAINT "manual_scores_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "public"."questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."manual_scores" ADD CONSTRAINT "manual_scores_olympiadId_fkey" FOREIGN KEY ("olympiadId") REFERENCES "public"."olympiads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."manual_scores" ADD CONSTRAINT "manual_scores_scoredBy_fkey" FOREIGN KEY ("scoredBy") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_OlympiadEventToQuestionPackage" ADD CONSTRAINT "_OlympiadEventToQuestionPackage_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."olympiad_events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_OlympiadEventToQuestionPackage" ADD CONSTRAINT "_OlympiadEventToQuestionPackage_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."question_packages"("id") ON DELETE CASCADE ON UPDATE CASCADE;
