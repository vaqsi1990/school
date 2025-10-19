-- AlterTable
ALTER TABLE "public"."calendar_events" ADD COLUMN     "curriculumId" TEXT,
ADD COLUMN     "subjectId" TEXT,
ALTER COLUMN "eventType" SET DEFAULT 'olympiad';

-- AddForeignKey
ALTER TABLE "public"."calendar_events" ADD CONSTRAINT "calendar_events_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "public"."subjects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."calendar_events" ADD CONSTRAINT "calendar_events_curriculumId_fkey" FOREIGN KEY ("curriculumId") REFERENCES "public"."Curriculum"("id") ON DELETE SET NULL ON UPDATE CASCADE;
