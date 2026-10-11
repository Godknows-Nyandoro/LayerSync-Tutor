import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE, signToken, verifyToken, type SessionPayload } from "./jwt";

// Log in: put a signed token in a cookie the browser's JavaScript cannot read (httpOnly).
export async function createSession(payload: SessionPayload) {
  const token = await signToken(payload);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // HTTPS only on the live site
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days, in seconds
  });
}

// Log out: remove the cookie.
export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

// Who is logged in? Returns null if nobody.
export async function getSession() {
  const cookieStore = await cookies();
  return verifyToken(cookieStore.get(SESSION_COOKIE)?.value);
}

// Use at the top of every protected page or API route.
// Sends the visitor to /login if not logged in, or home if they have the wrong role.
export async function requireUser(role?: SessionPayload["role"]) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (role && session.role !== role) redirect("/");
  return session;
}
