// Seed script: fills the database with starting data.
// Run with: npx prisma db seed
// Safe to run more than once: it updates rows that already exist.

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { syllabus } from "../data/syllabus";
import { CLASS_NAME, DEMO_PASSWORD, emailFor, students, teacher } from "../data/class";

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

async function seedUsers() {
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  await db.user.upsert({
    where: { email: teacher.email },
    create: { ...teacher, passwordHash, role: "TEACHER", className: CLASS_NAME },
    update: { name: teacher.name, passwordHash },
  });

  for (const student of students) {
    const email = emailFor(student.name);
    await db.user.upsert({
      where: { email },
      create: {
        name: student.name,
        email,
        passwordHash,
        role: "STUDENT",
        studentCode: student.code,
        className: CLASS_NAME,
      },
      update: { name: student.name, passwordHash },
    });
  }

  console.log(`Seeded 1 teacher and ${students.length} students`);
}

async function main() {
  await seedSyllabus();
  await seedUsers();
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
