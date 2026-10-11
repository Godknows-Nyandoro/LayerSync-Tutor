// Seed script: fills the database with starting data.
// Run with: npx prisma db seed
// Safe to run more than once: it updates rows that already exist.

import { PrismaClient } from "@prisma/client";
import { syllabus } from "../data/syllabus";

const db = new PrismaClient();

async function seedSyllabus() {
  let sortOrder = 0;

  for (const topic of syllabus) {
    for (const subtopic of topic.subtopics) {
      for (const objective of subtopic.objectives) {
        sortOrder++;
        const row = {
          paper: topic.paper,
          topicNumber: topic.number,
          topic: topic.title,
          subtopicId: subtopic.id,
          subtopic: subtopic.title,
          statement: objective.statement,
          notes: objective.notes,
          sortOrder,
        };
        // upsert = insert if missing, update if it already exists
        await db.objective.upsert({
          where: { id: objective.id },
          create: { id: objective.id, ...row },
          update: row,
        });
      }
    }
  }

  console.log(`Seeded ${sortOrder} syllabus objectives`);
}

async function main() {
  await seedSyllabus();
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
