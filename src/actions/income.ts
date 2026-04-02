"use server";

import db from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function addIncome(data: { amount: number; source?: string; date: Date; paymentMethod: string }) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return { error: "Unauthorized" };

    try {
        const income = await db.income.create({
            data: {
                ...data,
                userId: session.user.id,
            }
        });
        revalidatePath("/");
        revalidatePath("/income");
        return { success: true, income };
    } catch (error) {
        return { error: "Failed to add income record securely." };
    }
}

export async function deleteIncome(id: string) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return { error: "Unauthorized" };

    try {
        await db.income.delete({
            where: { id, userId: session.user.id }
        });
        revalidatePath("/");
        revalidatePath("/income");
        return { success: true };
    } catch (error) {
        return { error: "Failed to securely delete target income logic." };
    }
}

export async function updateIncome(id: string, data: { amount?: number; source?: string; date?: Date; paymentMethod?: string }) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return { error: "Unauthorized" };

    try {
        const income = await db.income.update({
            where: { id, userId: session.user.id },
            data
        });
        revalidatePath("/");
        revalidatePath("/income");
        return { success: true, income };
    } catch (error) {
        return { error: "Failed to securely patch target income payload." };
    }
}

export async function getRecentIncomes() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return { error: "Unauthorized" };

    try {
        const incomes = await db.income.findMany({
            where: { userId: session.user.id },
            orderBy: { date: 'desc' }
        });
        return { success: true, incomes };
    } catch (error) {
        return { error: "Failed to fetch income history." };
    }
}
