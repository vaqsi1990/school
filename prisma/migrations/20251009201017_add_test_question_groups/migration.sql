-- CreateTable
CREATE TABLE "public"."test_question_groups" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "subjectId" TEXT NOT NULL,
    "grade" INTEGER NOT NULL,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "test_question_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."test_question_group_questions" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "test_question_group_questions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "test_question_group_questions_groupId_questionId_key" ON "public"."test_question_group_questions"("groupId", "questionId");

-- AddForeignKey
ALTER TABLE "public"."test_question_groups" ADD CONSTRAINT "test_question_groups_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "public"."subjects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."test_question_groups" ADD CONSTRAINT "test_question_groups_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "public"."teachers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."test_question_group_questions" ADD CONSTRAINT "test_question_group_questions_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "public"."test_question_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."test_question_group_questions" ADD CONSTRAINT "test_question_group_questions_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "public"."test_questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
