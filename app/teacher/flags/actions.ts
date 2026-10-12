"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/session";

// The teacher has reviewed a flagged tutor reply.
// updateMany with the className check means a teacher can only resolve flags from their own class.
export async function resolveFlag(flagId: string) {
  const session = await requireUser("TEACHER");
  const teacher = await db.user.findUniqueOrThrow({ where: { id: session.userId } });
  await db.tutorFlag.updateMany({
    where: { id: flagId, student: { className: teacher.className } },
    data: { status: "RESOLVED", resolvedAt: new Date() },
  });
  revalidatePath(`/teacher/flags/${flagId}`);
  revalidatePath("/teacher");
}
