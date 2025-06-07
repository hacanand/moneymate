import { PrismaClient } from "@prisma/client";

// Singleton pattern to avoid creating multiple PrismaClient instances in development
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ["query", "info", "warn", "error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// Usage example:
// import { prisma } from './db';
// const loans = await prisma.loan.findMany();
