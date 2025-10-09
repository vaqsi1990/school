-- CreateEnum
CREATE TYPE "public"."TestQuestionType" AS ENUM ('OPEN_ENDED', 'CLOSED_ENDED');

-- CreateEnum
CREATE TYPE "public"."TestStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'GRADED');

-- CreateTable
CREATE TABLE "public"."class_tests" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "classId" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "duration" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "class_tests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."class_test_questions" (
    "id" TEXT NOT NULL,
    "testId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "class_test_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."class_test_results" (
    "id" TEXT NOT NULL,
    "testId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "score" INTEGER,
    "totalPoints" INTEGER,
    "completedAt" TIMESTAMP(3),
    "status" "public"."TestStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "answers" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "class_test_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."test_questions" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "type" "public"."TestQuestionType" NOT NULL,
    "options" TEXT[],
    "correctAnswer" TEXT,
    "answerTemplate" TEXT,
    "points" INTEGER NOT NULL DEFAULT 1,
    "subjectId" TEXT NOT NULL,
    "grade" INTEGER NOT NULL,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "image" TEXT[],
    "content" TEXT,
    "maxPoints" INTEGER,
    "rubric" TEXT,
    "imageOptions" TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "test_questions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "class_test_questions_testId_questionId_key" ON "public"."class_test_questions"("testId", "questionId");

-- CreateIndex
CREATE UNIQUE INDEX "class_test_results_testId_studentId_key" ON "public"."class_test_results"("testId", "studentId");

-- AddForeignKey
ALTER TABLE "public"."class_tests" ADD CONSTRAINT "class_tests_classId_fkey" FOREIGN KEY ("classId") REFERENCES "public"."classes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."class_tests" ADD CONSTRAINT "class_tests_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "public"."teachers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."class_tests" ADD CONSTRAINT "class_tests_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "public"."subjects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."class_test_questions" ADD CONSTRAINT "class_test_questions_testId_fkey" FOREIGN KEY ("testId") REFERENCES "public"."class_tests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."class_test_questions" ADD CONSTRAINT "class_test_questions_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "public"."test_questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."class_test_results" ADD CONSTRAINT "class_test_results_testId_fkey" FOREIGN KEY ("testId") REFERENCES "public"."class_tests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."class_test_results" ADD CONSTRAINT "class_test_results_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "public"."students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."test_questions" ADD CONSTRAINT "test_questions_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "public"."subjects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."test_questions" ADD CONSTRAINT "test_questions_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "public"."teachers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
