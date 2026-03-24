const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const db = new PrismaClient();

async function seed() {
    const hashedPassword = await bcrypt.hash('88888888', 10);

    const existing = await db.user.findUnique({ where: { email: 'admin' } });

    if (!existing) {
        await db.user.create({
            data: {
                name: 'Admin',
                email: 'admin',
                password: hashedPassword
            }
        });
        console.log("Admin user seeded successfully!");
    } else {
        console.log("Admin user already exists.");
    }
}

seed().finally(() => db.$disconnect());
