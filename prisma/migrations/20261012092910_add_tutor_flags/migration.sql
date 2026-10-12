-- CreateEnum
CREATE TYPE "FlagReason" AS ENUM ('WRONG', 'CONFUSING', 'GAVE_ANSWER', 'OTHER');

-- CreateEnum
CREATE TYPE "FlagStatus" AS ENUM ('OPEN', 'RESOLVED');

-- CreateTable
CREATE TABLE "TutorFlag" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "messageIndex" INTEGER NOT NULL,
    "reason" "FlagReason" NOT NULL,
    "comment" TEXT NOT NULL DEFAULT '',
    "status" "FlagStatus" NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),

    CONSTRAINT "TutorFlag_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TutorFlag_sessionId_messageIndex_key" ON "TutorFlag"("sessionId", "messageIndex");

-- AddForeignKey
ALTER TABLE "TutorFlag" ADD CONSTRAINT "TutorFlag_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TutorFlag" ADD CONSTRAINT "TutorFlag_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "TutorSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
