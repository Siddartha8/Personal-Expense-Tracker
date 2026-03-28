"use server";

import db from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function addExpense(data: { amount: number; categoryId: string; date: Date; note?: string; paymentMethod: string; location?: string }) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return { error: "Unauthorized" };

    try {
        const expense = await db.expense.create({
            data: {
                ...data,
                userId: session.user.id,
            },
            include: { category: true }
        });
        revalidatePath("/");
        revalidatePath("/transactions");
        return { success: true, expense };
    } catch (error) {
        return { error: "Failed to add expense" };
    }
}

export async function getDashboardStats(targetUserId?: string) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return { error: "Unauthorized" };

    try {
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        const isAdmin = session.user.email === "admin";
        const targetId = (isAdmin && targetUserId) ? targetUserId : session.user.id;

        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const expenses = await db.expense.findMany({
            where: {
                userId: targetId,
                date: { gte: thirtyDaysAgo }
            },
            include: { category: true },
            orderBy: { date: 'desc' }
        });

        const todayTotal = expenses
            .filter((e: any) => e.date >= startOfToday)
            .reduce((sum: number, e: any) => sum + e.amount, 0);

        return { success: true, todayTotal, recentExpenses: expenses };
    } catch (error) {
        return { error: "Failed to fetch stats" };
    }
}

export async function getAllExpenses(targetUserId?: string) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return { error: "Unauthorized" };

    const isAdmin = session.user.email === "admin";
    const userId = (isAdmin && targetUserId) ? targetUserId : session.user.id;

    try {
        const expenses = await db.expense.findMany({
            where: { userId },
            include: { category: true },
            orderBy: { date: 'desc' }
        });
        return { success: true, expenses };
    } catch (error) {
        return { error: "Failed to fetch all expenses" };
    }
}

export async function deleteExpense(id: string) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return { error: "Unauthorized" };

    try {
        await db.expense.delete({
            where: { id, userId: session.user.id }
        });
        revalidatePath("/");
        revalidatePath("/reports");
        revalidatePath("/analytics");
        return { success: true };
    } catch (error) {
        return { error: "Failed to delete expense." };
    }
}

export async function updateExpense(id: string, data: { amount?: number; categoryId?: string; date?: Date; note?: string; paymentMethod?: string; location?: string }) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return { error: "Unauthorized" };

    try {
        const expense = await db.expense.update({
            where: { id, userId: session.user.id },
            data,
            include: { category: true }
        });
        revalidatePath("/");
        revalidatePath("/reports");
        revalidatePath("/analytics");
        return { success: true, expense };
    } catch (error) {
        return { error: "Failed to securely update expense." };
    }
}
