// Seed script: fills the database with starting data.
// Run with: npx prisma db seed
// Safe to run more than once: it resets the demo data to the same starting point.

import bcrypt from "bcryptjs";
import { db } from "../lib/db";
import { updateMastery } from "../lib/mastery";
import { syllabus } from "../data/syllabus";
import { CLASS_NAME, DEMO_PASSWORD, emailFor, students, teacher } from "../data/class";
import { questions, type SeedQuestion } from "../data/questions";
import { guides } from "../data/guides";
import { history } from "../data/history";

// A date `days` days before now.
function daysAgo(days: number) {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

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

async function seedQuestions() {
  for (const [index, question] of questions.entries()) {
    const row = {
      objectiveId: question.objectiveId,
      type: question.type,
      prompt: question.prompt,
      options: question.options ?? [],
      answer: question.answer,
      markScheme: question.markScheme,
      marks: question.marks,
      sortOrder: index,
    };
    await db.question.upsert({
      where: { id: question.id },
      create: { id: question.id, ...row },
      update: row,
    });
  }

  console.log(`Seeded ${questions.length} questions`);
}

async function seedGuides() {
  for (const guide of guides) {
    // Every guide starts as a DRAFT, so the demo can show the teacher approving it.
    const row = { title: guide.title, sections: guide.sections, status: "DRAFT" as const, approvedAt: null };
    await db.guide.upsert({
      where: { topicKey: guide.topicKey },
      create: { topicKey: guide.topicKey, ...row },
      update: row,
    });
  }

  console.log(`Seeded ${guides.length} guides (as drafts)`);
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

// Save one fake attempt. `fraction` is how much of the question they got right (0 to 1).
async function createAttempt(studentId: string, question: SeedQuestion, fraction: number, date: Date) {
  const score = Math.round(fraction * question.marks);
  const isFullMarks = score === question.marks;

  let answer = question.answer;
  if (!isFullMarks) {
    answer = question.type === "MCQ" ? question.options!.find((o) => o !== question.answer)! : "(partial answer)";
  }

  const feedback = isFullMarks
    ? "Correct, well done."
    : question.type === "MCQ"
      ? `Not quite. ${question.markScheme[0]}`
      : `You got ${score} out of ${question.marks}. Compare your answer with: ${question.answer}`;

  await db.attempt.create({
    data: { studentId, questionId: question.id, answer, score, maxScore: question.marks, feedback, createdAt: date },
  });
}

async function seedHistory() {
  for (const student of students) {
    const user = await db.user.findUniqueOrThrow({ where: { studentCode: student.code } });
    const plan = history[student.code];

    // Start from a clean slate so running the seed twice gives the same result.
    await db.attempt.deleteMany({ where: { studentId: user.id } });
    await db.mastery.deleteMany({ where: { studentId: user.id } });
    await db.tutorSession.deleteMany({ where: { studentId: user.id } });

    await db.user.update({ where: { id: user.id }, data: { lastLoginAt: daysAgo(plan.lastLoginDaysAgo) } });

    for (const check of plan.checks) {
      // The questions for this topic: their objective's sub-topic matches the topic key.
      const topicQuestions = questions.filter((q) => q.objectiveId.startsWith(check.topicKey + "."));

      for (const question of topicQuestions) {
        // Earlier, weaker attempts first...
        for (const retry of plan.retries?.[question.id] ?? []) {
          await createAttempt(user.id, question, retry.fraction, daysAgo(retry.daysAgo));
        }
        // ...then the latest attempt.
        const fraction = plan.overrides?.[question.id] ?? check.skill;
        await createAttempt(user.id, question, fraction, daysAgo(check.daysAgo));
      }
    }

    // Recalculate mastery for every objective this student has answered.
    const answered = await db.attempt.findMany({
      where: { studentId: user.id },
      select: { question: { select: { objectiveId: true } } },
    });
    const objectiveIds = new Set(answered.map((a) => a.question.objectiveId));
    for (const objectiveId of objectiveIds) {
      await updateMastery(user.id, objectiveId);
    }

    // Short fake tutor chats, spread over the last few days.
    for (const [topicKey, count] of Object.entries(plan.tutorSessions)) {
      for (let i = 0; i < count; i++) {
        await db.tutorSession.create({
          data: {
            studentId: user.id,
            topicKey,
            messages: [
              { role: "user", content: "Can you help me with this topic?" },
              { role: "assistant", content: "Of course. What have you tried so far?" },
            ],
            inputTokens: 1200,
            outputTokens: 150,
            createdAt: daysAgo(plan.lastLoginDaysAgo + i),
          },
        });
      }
    }
  }

  console.log("Seeded student history (attempts, mastery, tutor sessions)");
}

// One flagged tutor reply, so the teacher dashboard has something to show.
async function seedFlags() {
  for (const student of students) {
    const flag = history[student.code].flag;
    if (!flag) continue;
    const user = await db.user.findUniqueOrThrow({ where: { studentCode: student.code } });

    const chat = await db.tutorSession.create({
      data: {
        studentId: user.id,
        topicKey: flag.topicKey,
        messages: [
          { role: "user", content: flag.studentMessage },
          { role: "assistant", content: flag.tutorReply },
        ],
        inputTokens: 1200,
        outputTokens: 60,
        createdAt: daysAgo(1),
      },
    });
    // messageIndex 1 = the tutor's reply (index 0 is the student's message)
    await db.tutorFlag.create({
      data: { studentId: user.id, sessionId: chat.id, messageIndex: 1, reason: flag.reason, comment: flag.comment, createdAt: daysAgo(1) },
    });
  }

  console.log("Seeded flagged tutor replies");
}

async function main() {
  await seedSyllabus();
  await seedQuestions();
  await seedGuides();
  await seedUsers();
  await seedHistory();
  await seedFlags();
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
