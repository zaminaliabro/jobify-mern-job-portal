import { PrismaClient } from "@prisma/client";

// A single client per process. Node's module cache keeps this a singleton in
// production; the globalThis guard stops `node --watch` from opening a new pool
// on every reload during development.
const globalForPrisma = globalThis;

const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "production" ? ["error"] : ["error", "warn"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export const connectDB = async () => {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL missing in .env");
    process.exit(1);
  }

  try {
    await prisma.$connect();
    const [{ db, host }] = await prisma.$queryRaw`
      SELECT current_database() AS db, inet_server_addr()::text AS host
    `;
    console.log(`PostgreSQL connected: ${host ?? "local"}/${db}`);
  } catch (error) {
    console.error(`PostgreSQL connection failed: ${error.message}`);
    process.exit(1);
  }
};

export default prisma;
