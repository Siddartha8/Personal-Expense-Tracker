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
            isActive: u.isActive,
            expenseCount: u.expenses.length,
            totalSpent: u.expenses.reduce((sum: number, e: any) => sum + e.amount, 0)
        }));

        return { success: true, users: mapped };
    } catch (err) {
        return { error: "Failed to fetch users" };
    }
}

export async function toggleUserStatus(userId: string, targetStatus: boolean) {
    const session = await getServerSession(authOptions);
    if (session?.user?.email !== "admin") return { error: "Unauthorized: Administrator clearance required." };

    try {
        await db.user.update({
            where: { id: userId },
            data: { isActive: targetStatus }
        });
        return { success: true };
    } catch (err) {
        return { error: "Failed to execute global status override." };
    }
}

export async function deleteUserByAdmin(userId: string) {
    const session = await getServerSession(authOptions);
    if (session?.user?.email !== "admin") return { error: "Unauthorized: Administrator clearance required." };

    try {
        await db.user.delete({
            where: { id: userId }
        });
        return { success: true };
    } catch (err) {
        return { error: "Failed to execute irreversible administrative deletion." };
    }
}
