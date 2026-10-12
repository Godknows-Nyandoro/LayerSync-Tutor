"use server";
// Server Actions for the teacher's guide buttons. Each one checks the user is a teacher first.

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { generateGuideSections } from "@/lib/guide-generator";
import { findUnit } from "@/data/topics";

// Make the guide visible to students.
export async function approveGuide(topicKey: string) {
  await requireUser("TEACHER");
  await db.guide.update({ where: { topicKey }, data: { status: "APPROVED", approvedAt: new Date() } });
  revalidatePath("/teacher/guides");
}

// Hide the guide from students again.
export async function unpublishGuide(topicKey: string) {
  await requireUser("TEACHER");
  await db.guide.update({ where: { topicKey }, data: { status: "DRAFT", approvedAt: null } });
  revalidatePath("/teacher/guides");
}

// Write a fresh AI draft for any unit: creates the guide if there isn't one, or replaces it.
// It is always saved as a DRAFT, so students cannot see it until the teacher approves it.
export async function generateDraft(topicKey: string) {
  await requireUser("TEACHER");
  const unit = findUnit(topicKey);
  if (!unit) redirect("/teacher/guides");

  try {
    const sections = await generateGuideSections(unit.key);
    const row = { title: unit.title, sections, status: "DRAFT" as const, approvedAt: null };
    await db.guide.upsert({
      where: { topicKey: unit.key },
      create: { topicKey: unit.key, ...row },
      update: row,
    });
  } catch (error) {
    console.error(error);
    redirect(`/teacher/guides/${unit.key}?error=generate`);
  }
  redirect(`/teacher/guides/${unit.key}`);
}
