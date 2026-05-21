import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const tables = [
    "User",
    "Account",
    "Session",
    "Category",
    "Expense",
    "VerificationToken",
    "Income"
  ];

  console.log("Enabling Row Level Security (RLS) on all tables...");

  for (const table of tables) {
    try {
      await prisma.$executeRawUnsafe(`ALTER TABLE "${table}" ENABLE ROW LEVEL SECURITY;`);
      console.log(`✓ Enabled RLS on table: "${table}"`);
    } catch (error) {
      console.error(`✗ Failed to enable RLS on table: "${table}":`, error);
    }
  }

  console.log("RLS activation complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
