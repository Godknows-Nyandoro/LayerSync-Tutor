"use server";
// Server Actions: functions that run on the server when a form is submitted.

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { createSession, deleteSession } from "@/lib/session";

// Returns an error message to show, or redirects on success.
export async function login(_previousError: string | null, formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  const user = await db.user.findUnique({ where: { email } });

  // Same message for a wrong email and a wrong password,
  // so nobody can use the form to find out which emails exist.
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return "Wrong email or password";
  }

  await db.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
  await createSession({ userId: user.id, role: user.role, name: user.name });

  redirect(user.role === "TEACHER" ? "/teacher" : "/student");
}

export async function logout() {
  await deleteSession();
  redirect("/login");
}
