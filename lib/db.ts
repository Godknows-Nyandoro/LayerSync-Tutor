import { PrismaClient } from "@prisma/client";

// In development Next.js reloads files often. Keeping the client on
// globalThis stops us opening a new database connection on every reload.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const db = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
