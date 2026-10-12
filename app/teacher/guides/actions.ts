"use server";
// Server Actions for the teacher's guide buttons. Each one checks the user is a teacher first.

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { generateGuideSections } from "@/lib/guide-generator";

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

// Replace the guide with a fresh AI draft. It starts as a DRAFT, so students cannot see it yet.
export async function generateDraft(topicKey: string) {
  await requireUser("TEACHER");
  try {
    const sections = await generateGuideSections(topicKey);
    await db.guide.update({ where: { topicKey }, data: { sections, status: "DRAFT", approvedAt: null } });
  } catch (error) {
    console.error(error);
    redirect(`/teacher/guides/${topicKey}?error=generate`);
  }
  redirect(`/teacher/guides/${topicKey}`);
}
