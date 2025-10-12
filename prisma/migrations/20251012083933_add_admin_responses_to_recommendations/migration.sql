-- CreateTable
CREATE TABLE "public"."recommendation_admin_responses" (
    "id" TEXT NOT NULL,
    "recommendationId" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "response" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "recommendation_admin_responses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "recommendation_admin_responses_recommendationId_key" ON "public"."recommendation_admin_responses"("recommendationId");

-- AddForeignKey
ALTER TABLE "public"."recommendation_admin_responses" ADD CONSTRAINT "recommendation_admin_responses_recommendationId_fkey" FOREIGN KEY ("recommendationId") REFERENCES "public"."recommendations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."recommendation_admin_responses" ADD CONSTRAINT "recommendation_admin_responses_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "public"."admins"("id") ON DELETE CASCADE ON UPDATE CASCADE;
