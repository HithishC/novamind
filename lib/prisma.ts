import { PrismaClient } from '@prisma/client';

declare global {
  // allow global `prisma` variable without TypeScript errors
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

/**
 * Returns a PrismaClient instance.
 * In development we attach the client to the global object to prevent
 * exhausting database connections caused by Next.js hot reloads.
 */
export const prisma = global.prisma || new PrismaClient({
  // you can add any PrismaClient options here if needed
});

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

export default prisma;
