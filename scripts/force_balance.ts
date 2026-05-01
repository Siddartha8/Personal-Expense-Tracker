import { PrismaClient } from '@prisma/client';
const db = new PrismaClient();

async function fix() {
    const users = await db.user.findMany();
    if (users.length === 0) {
        console.log("No users found.");
        return;
    }
    const user = users[0];

    const targetBalances: Record<string, number> = {
        "UPI": 5686,
        "Cash": 80,
        "Card": 0,
        "Net Banking": 0
    };

    for (const w of Object.keys(targetBalances)) {
        const inc = await db.income.aggregate({ where: { userId: user.id, paymentMethod: w }, _sum: { amount: true } });
        const exp = await db.expense.aggregate({ where: { userId: user.id, paymentMethod: w }, _sum: { amount: true } });
        const bal = (inc._sum.amount || 0) - (exp._sum.amount || 0);
        
        const target = targetBalances[w];
        const diff = target - bal;

        if (diff > 0) {
            await db.income.create({
                data: {
                    userId: user.id,
                    amount: diff,
                    paymentMethod: w,
                    source: "System Balance Recovery",
                    date: new Date()
                }
            });
            console.log(`Fixed ${w}: injected +${diff} to reach ${target}`);
        } else if (diff < 0) {
            let cat = await db.category.findFirst({ where: { userId: user.id, name: "Adjustment" }});
            if (!cat) {
                 cat = await db.category.create({ data: { userId: user.id, name: "Adjustment", color: "#666", icon: "Settings" } });
            }
            await db.expense.create({
                 data: { userId: user.id, amount: Math.abs(diff), paymentMethod: w, categoryId: cat.id, date: new Date(), note: "System Balance Recovery" }
            });
            console.log(`Fixed ${w}: injected -${Math.abs(diff)} to reach ${target}`);
        } else {
            console.log(`${w} is already at ${target}`);
        }
    }
}
fix().then(() => console.log("Done."));
