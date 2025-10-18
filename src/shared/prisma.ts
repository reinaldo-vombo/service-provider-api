import { PrismaClient } from "../generated/prisma";


const globalPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalPrisma.prisma ??
  new PrismaClient({
    errorFormat: 'minimal',
  });

if (process.env.NODE_ENV !== 'production') globalPrisma.prisma = prisma;
