-- CreateTable
CREATE TABLE "visitor_logs" (
    "id" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "page" TEXT,
    "referrer" TEXT,
    "visitedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sessionId" TEXT,

    CONSTRAINT "visitor_logs_pkey" PRIMARY KEY ("id")
);
