import { SignJWT, jwtVerify } from "jose";

// What we store inside the login cookie.
export type SessionPayload = {
  userId: string;
  role: "STUDENT" | "TEACHER";
  name: string;
};

export const SESSION_COOKIE = "session";

// The secret that signs the cookie. Without it, nobody can forge a valid cookie.
const key = new TextEncoder().encode(process.env.SESSION_SECRET);

// Turn the payload into a signed token (a JWT) that expires in 7 days.
export async function signToken(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(key);
}

// Check the signature and expiry. Returns null if the token is missing, fake or expired.
export async function verifyToken(token: string | undefined): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, key, { algorithms: ["HS256"] });
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}
