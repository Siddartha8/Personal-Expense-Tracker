"use server";

import db from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function getAdminUsers() {
    const session = await getServerSession(authOptions);
    if (session?.user?.email !== "admin") return { error: "Unauthorized" };

    try {
        const users = await db.user.findMany({
            include: {
                expenses: {
                    select: { amount: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        const mapped = users.map((u: any) => ({
            id: u.id,
            name: u.name,
            email: u.email,
            expenseCount: u.expenses.length,
            totalSpent: u.expenses.reduce((sum: number, e: any) => sum + e.amount, 0)
        }));

        return { success: true, users: mapped };
    } catch (err) {
        return { error: "Failed to fetch users" };
    }
}
