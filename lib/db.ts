import { PrismaClient } from "@prisma/client";

// Neon's free tier puts the database to sleep when nobody uses it, and waking it up
// can take a few seconds. Prisma gives up after 5 seconds by default, so we allow 15.
function withConnectTimeout(url: string | undefined) {
  if (!url || url.includes("connect_timeout")) return url;
  return url + (url.includes("?") ? "&" : "?") + "connect_timeout=15";
}

// In development Next.js reloads files often. Keeping the client on
// globalThis stops us opening a new database connection on every reload.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const db =
  globalForPrisma.prisma ?? new PrismaClient({ datasourceUrl: withConnectTimeout(process.env.DATABASE_URL) });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
