import db from "../src/lib/db";

async function main() {
  const result = await db.user.deleteMany({
    where: {
      email: {
        in: ["klaussid08@gmail.com", "siddharthakandadi@gmail.com"],
      },
    },
  });
  console.log(`Successfully deleted ${result.count} test accounts.`);
}

main()
  .catch(console.error)
  .finally(() => process.exit(0));
