-- CreateEnum
CREATE TYPE "public"."QuestionStatus" AS ENUM ('ACTIVE', 'PENDING', 'REJECTED');

-- AlterTable
ALTER TABLE "public"."questions" ADD COLUMN     "createdByType" "public"."UserType",
ADD COLUMN     "isReported" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "reportReason" TEXT,
ADD COLUMN     "reportedAt" TIMESTAMP(3),
ADD COLUMN     "reportedBy" TEXT,
ADD COLUMN     "status" "public"."QuestionStatus" NOT NULL DEFAULT 'ACTIVE';
