import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const users = await prisma.user.findMany();
    console.log(`Found ${users.length} users.`);
    
    for (const user of users) {
        console.log(`\n--- User: ${user.email} ---`);
        
        const incomes = await prisma.income.findMany({
            where: { userId: user.id },
            orderBy: { date: 'asc' }
        });
        
        console.log("INCOMES:");
        let totalIncome = 0;
        for (const inc of incomes) {
            console.log(`  ${inc.date.toISOString().split('T')[0]} | ${inc.paymentMethod} | +${inc.amount} | ${inc.source}`);
            totalIncome += inc.amount;
        }
        console.log(`  Total Income: ${totalIncome}`);
        
        const expenses = await prisma.expense.findMany({
            where: { userId: user.id },
            orderBy: { date: 'asc' },
            include: { category: true }
        });
        
        console.log("\nEXPENSES:");
        let totalExpense = 0;
        for (const exp of expenses) {
            console.log(`  ${exp.date.toISOString().split('T')[0]} | ${exp.paymentMethod} | -${exp.amount} | ${exp.category?.name} | ${exp.note}`);
            totalExpense += exp.amount;
        }
        console.log(`  Total Expense: ${totalExpense}`);
        console.log(`\n  NET BALANCE: ${totalIncome - totalExpense}`);
    }
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
