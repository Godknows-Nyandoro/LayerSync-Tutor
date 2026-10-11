-- CreateTable
CREATE TABLE "Objective" (
    "id" TEXT NOT NULL,
    "paper" INTEGER NOT NULL,
    "topicNumber" INTEGER NOT NULL,
    "topic" TEXT NOT NULL,
    "subtopicId" TEXT NOT NULL,
    "subtopic" TEXT NOT NULL,
    "statement" TEXT NOT NULL,
    "notes" TEXT[],
    "sortOrder" INTEGER NOT NULL,

    CONSTRAINT "Objective_pkey" PRIMARY KEY ("id")
);
